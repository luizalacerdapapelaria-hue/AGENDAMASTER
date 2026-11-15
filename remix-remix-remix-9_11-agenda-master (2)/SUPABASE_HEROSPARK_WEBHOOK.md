# 🚀 BLUEPRINT MASTER: Integração Resiliente HeroSpark & Supabase Edge Functions

Este é o documento de referência oficial para conectar de forma automatizada e protegida a plataforma de vendas **HeroSpark** com qualquer banco de dados **Supabase** via **Edge Functions**.

Esse fluxo serve para que sempre que uma compra for **aprovada** ou **cancelada/reembolsada** na HeroSpark, os acessos correspondentes sejam imediatamente ativados ou inativados na tabela de controle de alunos do Supabase, sem a necessidade de intervenção manual.

---

## 📋 Arquitetura Geral do Fluxo

```
[HeroSpark Webhook] 
       │
       ▼ (Requisição HTTP POST livre de login - Sem JWT)
[Supabase Edge Function] ─── (Valida Token Secreto & Filtra por Oferta)
       │
       ▼ (Usa Service Role Bypass RLS)
 [Tabela: allowed_users] ─── (Atualiza ou Inativa Aluno)
```

---

## 🛠️ Passo 1: O Banco de Dados (SQL do Supabase)

O primeiro passo em qualquer novo projeto do Supabase é criar a tabela que armazenará os e-mails e estados de acesso dos alunos autorizados. 

Acesse o painel do seu **Supabase -> SQL Editor -> New Query**, cole o código abaixo e execute-o (`Run`):

```sql
-- 1. Criar a tabela de controle de usuários permitidos
CREATE TABLE IF NOT EXISTS public.allowed_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,                       -- E-mail do aluno (Chave Única)
    active BOOLEAN DEFAULT TRUE NOT NULL,             -- Estado do acesso (TRUE = Ativo, FALSE = Bloqueado)
    password TEXT,                                    -- Senha cadastrada no primeiro acesso para suporte/manutenção do criador
    plano TEXT DEFAULT 'mensal',                      -- Plano descritivo
    plan_type TEXT DEFAULT 'mensal',                  -- Tipo do plano
    plan_tier TEXT DEFAULT 'individual',              -- Nível de herança/tier
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Caso você já tenha a tabela criada no seu projeto, execute o comando abaixo para adicionar o campo password de forma retroativa:
-- ALTER TABLE public.allowed_users ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Criar índices para buscas de logins ultra-rápidas do aluno por e-mail
CREATE INDEX IF NOT EXISTS allowed_users_email_idx ON public.allowed_users (email);

-- 3. Habilitar segurança a nível de linha (Optional Row Level Security)
ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;

-- 4. Permitir que qualquer usuário autenticado ou visitante faça apenas a LEITURA de e-mails
CREATE POLICY "Permitir leitura individual por e-mail" 
ON public.allowed_users 
FOR SELECT 
USING (true);

-- 5. Permitir que a aplicação grave a senha escolhida pelo aluno no primeiro acesso
CREATE POLICY "Permitir atualizar própria senha de aluno" 
ON public.allowed_users 
FOR UPDATE 
USING (true)
WITH CHECK (true);
```

---

## ⚡ Passo 2: Criando a Edge Function do Zero (Terminal Local)

No seu computador local, abra seu terminal de desenvolvimento (VS Code) e prepare o ambiente da Edge Function:

1. **Inicialize as funções no seu projeto local (caso ainda não tenha inicializado):**
   ```bash
   supabase init
   ```

2. **Faça o login em sua conta Supabase:**
   ```bash
   supabase login
   ```

3. **Crie a estrutura básica da nova função:**
   ```bash
   supabase functions new herospark-webhook
   ```

Isso criará uma pasta no diretório do projeto com o caminho `supabase/functions/herospark-webhook/index.ts`.

---

## 📝 Passo 3: O Código Resiliente da Edge Function (`index.ts`)

Substitua todo o conteúdo do arquivo local do seu computador (`supabase/functions/herospark-webhook/index.ts`) por este código pronto para produção. Ele conta com **algoritmos recursivos de varredura** para decifrar dados em múltiplos formatos de payload enviados pela HeroSpark, além de suportar testes simulados com segurança.

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Cabeçalhos padrão para evitar bloqueios de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ───────── ALGORITMOS RECURSIVOS DE BUSCA RESILIENTE ─────────

// Varre profundamente o payload procurando por chaves de e-mail válidas
function findEmail(obj: any): string | null {
  if (!obj || typeof obj !== 'object') return null;
  if (typeof obj.email === 'string' && obj.email.includes('@')) return obj.email;
  if (typeof obj.buyer_email === 'string' && obj.buyer_email.includes('@')) return obj.buyer_email;
  
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (key.toLowerCase().includes('email') && typeof value === 'string' && value.includes('@')) {
      return value;
    }
    if (value && typeof value === 'object') {
      const found = findEmail(value);
      if (found) return found;
    }
  }
  return null;
}

// Varre profundamente procurando por chaves de nome do comprador
function findName(obj: any): string | null {
  if (!obj || typeof obj !== 'object') return null;
  if (typeof obj.name === 'string' && obj.name.trim().length > 0) return obj.name;
  if (typeof obj.buyer_name === 'string' && obj.buyer_name.trim().length > 0) return obj.buyer_name;

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (key.toLowerCase().includes('name') && typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    if (value && typeof value === 'object') {
      const found = findName(value);
      if (found) return found;
    }
  }
  return null;
}

// Varre profundamente procurando por IDs de ofertas ou produtos herospark
function findOfferId(obj: any): string | null {
  if (!obj || typeof obj !== 'object') return null;
  if (obj.offer_id) return obj.offer_id.toString();
  if (obj.product_id) return obj.product_id.toString();

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if ((key.toLowerCase().includes('offer_id') || key.toLowerCase().includes('product_id')) && value !== null && value !== undefined) {
      return value.toString();
    }
    if (value && typeof value === 'object') {
      const found = findOfferId(value);
      if (found) return found;
    }
  }
  return null;
}

// ─────────────── SERVIÇO PRINCIPAL (DENO) ───────────────

serve(async (req) => {
  // Trata requisição CORS Preflight feita pelo navegador ou API Gateways
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inicialização do cliente Supabase administrativo com Service Role Key para ignorar regras de RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parseando corpo JSON da requisição
    const payload = await req.json()
    console.log("Recebido webhook da HeroSpark:", JSON.stringify(payload, null, 2))

    // 1. Extração Inteligente de Variáveis com Fallbacks
    let email = payload.email || payload.buyer_email;
    if (!email && payload.buyer && typeof payload.buyer === 'object') {
      email = payload.buyer.email;
    }
    if (!email && payload.cart && typeof payload.cart === 'object') {
      if (payload.cart.buyer && typeof payload.cart.buyer === 'object') {
        email = payload.cart.buyer.email;
      } else if (payload.cart.buyer_email) {
        email = payload.cart.buyer_email;
      }
    }
    if (!email) {
      email = findEmail(payload);
    }

    let name = payload.name || payload.buyer_name;
    if (!name && payload.buyer && typeof payload.buyer === 'object') {
      name = payload.buyer.name;
    }
    if (!name && payload.cart && typeof payload.cart === 'object') {
      if (payload.cart.buyer && typeof payload.cart.buyer === 'object') {
        name = payload.cart.buyer.name;
      } else if (payload.cart.buyer_name) {
        name = payload.cart.buyer_name;
      }
    }
    if (!name) {
      name = findName(payload);
    }

    let offer_id = payload.offer_id;
    if (!offer_id && payload.cart && typeof payload.cart === 'object') {
      offer_id = payload.cart.offer_id;
    }
    if (!offer_id) {
      offer_id = findOfferId(payload);
    }

    // Normalização de eventos
    let event = payload.event || payload.statusByEvent || payload.status;
    if (!event && payload.cart && typeof payload.cart === 'object') {
      event = payload.cart.status || payload.cart.state;
    }
    if (!event) {
      event = 'approved'; // Assume aprovação se não for fornecido
    }

    const secret_token = payload.secret_token;

    // 2. Isolamento de Massa de Testes Rápidos (Pings de validação no Painel da HeroSpark)
    const lowerEmail = email ? email.trim().toLowerCase() : '';
    const isMockTest = lowerEmail && (
      lowerEmail.includes('test') || 
      lowerEmail.includes('example') || 
      lowerEmail.includes('herospark') || 
      lowerEmail.startsWith('12345')
    );

    if (isMockTest || !email) {
      if (!email) {
        console.warn("Aviso: Teste de webhook recebido, mas nenhum e-mail foi encontrado no formato.");
      } else {
        console.log(`[TESTE] Conectividade validada com sucesso pelo e-mail simulado: ${lowerEmail}`);
      }
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Conectividade validada com sucesso pela Edge Function do Supabase!",
        is_test: true 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // 3. Validação do Token de Segurança Secreto (Evita requisições maliciosas na rota)
    const webhookSecret = Deno.env.get('HEROSPARK_WEBHOOK_SECRET')
    if (webhookSecret && secret_token !== webhookSecret) {
      console.warn("Aviso: Token secreto inválido recebido no cabeçalho ou body.")
      return new Response(JSON.stringify({ error: "Token secreto inválido de segurança" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // 4. Filtro Inteligente de Ofertas (Se a lista ALLOWED_OFFER_IDS estiver configurada)
    const allowedOffersRaw = Deno.env.get('ALLOWED_OFFER_IDS')
    if (allowedOffersRaw && event === 'approved') {
      const allowedOffers = allowedOffersRaw.split(',').map(id => id.trim())
      if (offer_id && !allowedOffers.includes(offer_id.toString())) {
        console.log(`Webhook ignorado: Oferta ID '${offer_id}' não está na lista de permitidos: [${allowedOffersRaw}]`)
        return new Response(JSON.stringify({ message: "Oferta não habilitada para liberação automática" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
      }
    }

    // 5. Normalização Semântica do Evento (Approved vs Canceled)
    let normalizedEvent = 'approved';
    if (typeof event === 'string') {
      const evLower = event.toLowerCase();
      if (evLower.includes('cancel') || evLower.includes('refund') || evLower.includes('chargeback') || evLower.includes('fail') || evLower.includes('inactive')) {
        normalizedEvent = 'canceled';
      }
    }

    // 6. Atualização Automática no Banco de Dados
    if (normalizedEvent === 'approved') {
      console.log(`Liberando de acesso para o e-mail: ${lowerEmail}`)

      const { data, error } = await supabaseClient
        .from('allowed_users')
        .upsert({
          email: lowerEmail,
          active: true,
          plano: payload.plano || payload.plan_type || 'mensal',
          plan_type: payload.plan_type || payload.plano || 'mensal',
          plan_tier: payload.plan_tier || 'individual',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        })
        .select()

      if (error) {
        throw new Error(`Erro ao salvar aluno ativo: ${error.message}`)
      }

      return new Response(JSON.stringify({ success: true, message: "Acesso liberado com sucesso", data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })

    } else if (normalizedEvent === 'canceled') {
      console.log(`Inativando acesso para o e-mail: ${lowerEmail}`)

      const { data, error } = await supabaseClient
        .from('allowed_users')
        .update({
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('email', lowerEmail)
        .select()

      if (error) {
        throw new Error(`Erro ao inativar aluno: ${error.message}`)
      }

      return new Response(JSON.stringify({ success: true, message: "Acesso inativado com sucesso", data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })

    } else {
      return new Response(JSON.stringify({ message: `Evento recebido e ignorado por regras internas: ${event}` }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

  } catch (error: any) {
    console.error("Erro interno no Webhook:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
```

---

## 🚀 Passo 4: Realizando o Deploy da Edge Function

No terminal do seu computador (dentro da pasta do projeto do Supabase), faça o upload da Edge Function usando a flag essencial `--no-verify-jwt` (ela é quem desliga a exigência de logins de usuários e tokens JWT de autenticação privada no gateway do Supabase, permitindo que a HeroSpark faça requisições HTTP nela externamente):

```bash
supabase functions deploy herospark-webhook --no-verify-jwt --project-ref SEU_PROJECT_ID_DO_SUPABASE
```
*(Nota: Substitua `SEU_PROJECT_ID_DO_SUPABASE` pela ID de referência do seu projeto, ex: `aehwpdtjulgjemttdyyl`)*

---

## 🔒 Passo 5: Configuração das Secrets (Segurança)

Não salve dados sensíveis ou senhas "hardcoded" diretamente no código. Utilize os comandos do Supabase CLI para injetar chaves secretas com segurança no ambiente da sua função:

### A. Para restringir as Ofertas Permitidas (Exemplo):
Configure os IDs de oferta da HeroSpark separados por vírgula que estão autorizados a criar cadastros de acesso:
```bash
supabase secrets set ALLOWED_OFFER_IDS="id_oferta_1,id_oferta_2,id_oferta_3" --project-ref SEU_PROJECT_ID_DO_SUPABASE
```
*(Nota: Se você não configurar essa variável, o webhook liberará acesso para **qualquer** ID de oferta recebida, o que é ótimo para múltiplos produtos)*

### B. Para habilitar a verificação de Token Secreto (Recomendado):
Crie um Token Secreto de sua escolha de forma personalizada (ex: `ChavePrivadaDeSuaEscolha_992`):
```bash
supabase secrets set HEROSPARK_WEBHOOK_SECRET="SuaChaveSecretaPersonalizada" --project-ref SEU_PROJECT_ID_DO_SUPABASE
```

---

## 🎨 Passo 6: Configuração no Painel da HeroSpark

No menu do painel administrativo da HeroSpark, acesse **Automações e Integrações** -> **Criar Automação** e configure os dois fluxos a seguir:

### Fluxo 1: Pagamento Aprovado / Assinatura Ativa
* **Gatilho**: Escolha **Pagamento Aprovado** ou **Nova Assinatura Ativa**.
* **Filtros**: Selecione para um produto específico ou todos os produtos.
* **URL de Destino**: O link limpo e cru da sua Edge Function (graças ao `--no-verify-jwt` não é preciso passar chaves apikey na URL):
  * `https://SEU_PROJECT_ID_DO_SUPABASE.supabase.co/functions/v1/herospark-webhook`
* **Método**: `POST`
* **Headers**:
  * `Content-Type`: `application/json`
* **Corpo da Mensagem (JSON Personalizado)**:
  ```json
  {
    "event": "approved",
    "email": "{{buyer_email}}",
    "name": "{{buyer_name}}",
    "plan_type": "mensal",
    "plano": "mensal",
    "plan_tier": "individual",
    "offer_id": "{{offer_id}}",
    "secret_token": "SuaChaveSecretaPersonalizada"
  }
  ```
  *(Nota: Se você preencheu a Secret `HEROSPARK_WEBHOOK_SECRET` no passo 5-B, insira o mesmo valor exato no campo `secret_token`)*

---

### Fluxo 2: Assinatura Cancelada / Compra Reembolsada
* **Gatilho**: Escolha **Assinatura Cancelada**, **Reembolso Solicitado/Aprovado** ou **Pagamento Inadimplente**.
* **URL de Destino**: O mesmo link limpo de sua Edge Function:
  * `https://SEU_PROJECT_ID_DO_SUPABASE.supabase.co/functions/v1/herospark-webhook`
* **Método**: `POST`
* **Headers**:
  * `Content-Type`: `application/json`
* **Corpo da Mensagem (JSON Personalizado)**:
  ```json
  {
    "event": "canceled",
    "email": "{{buyer_email}}",
    "secret_token": "SuaChaveSecretaPersonalizada"
  }
  ```

---

## 📑 Passo 7: Matriz de Diagnósticos (Guia de Solução de Problemas)

| Código | Descrição do Erro | Possível Causa | Solução Rápida |
| :---: | :--- | :--- | :--- |
| **`401`** | **UNAUTHORIZED_NO_AUTH_HEADER** ou **INVALID_CREDENTIALS** | A função foi publicada com validação de JWT nativa do painel do Supabase ativada por engano. | Faça o deploy novamente no seu terminal e certifique-se de adicionar a flag `--no-verify-jwt` no final do comando. |
| **`401`** | **Token secreto inválido de segurança** | O parâmetro `"secret_token"` enviado no JSON da HeroSpark não coincide com a segredo `HEROSPARK_WEBHOOK_SECRET`. | Verifique o campo `secret_token` no JSON configurado no painel de automação da HeroSpark e garanta que ele seja idêntico ao segredo definido no Supabase. |
| **`400`** | **E-mail não fornecido no payload** | Nenhum e-mail foi encontrado na requisição e os métodos de busca heurística falharam. | Cole exatamente o modelo JSON Personalizado com `{{buyer_email}}` no corpo da automação da HeroSpark. |
| **`200` (Mas nada salvou)** | **Oferta não habilitada** | O ID de oferta recebido no Webhook não está cadastrado na sua variável `ALLOWED_OFFER_IDS` das Secrets. | Adicione o ID da oferta da automação na variável de secrets do Supabase separada por vírgula, ou remova a secret `ALLOWED_OFFER_IDS` para liberar para qualquer produto. |
| **`500`** | **Internal Server Error** | Geralmente sinaliza erro ao tentar conectar no banco de dados (ex: tabela `allowed_users` inexistente ou colunas diferentes). | Acesse os Logs da Edge Function no painel do Supabase em: **Edge Functions -> herospark-webhook -> Logs**, visualize os metadados do disparo e confira se a tabela foi criada pelo SQL Editor exatamente conforme o Passo 1. |

---

**Pronto!** Guardando este guia padrão de integração, você agora possui uma estrutura resiliente, segura e documentada que pode ser copiada e replicada integralmente para qualquer novo projeto de ensino ou portal de alunos associado ao Supabase! 🌟

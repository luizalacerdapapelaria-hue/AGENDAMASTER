# Guia de Empacotamento Desktop (.EXE) para Windows - Agenda Master

Este guia prático ensina como transformar o código do seu **Agenda Master** em um aplicativo instalado nativamente no computador (`.exe`), leve, rápido e super seguro para os seus clientes, com suporte para atualizações futuras!

---

## 💡 Como Funciona o Aplicativo Desktop?

O seu aplicativo desktop será empacotado utilizando o **Electron**, a tecnologia mais popular do mundo para apps de desktop (usada pelo VS Code, WhatsApp, Slack, etc.). 
* **Leveza Extrema:** O instalador é compacto, inicia instantaneamente e não consome recursos desnecessários do computador.
* **Auto-Atualização:** O aplicativo pode ser configurado para apontar para a versão web de produção ou carregar os arquivos estáticos de forma inteligente, garantindo que o usuário sempre tenha as novidades em tempo real.

---

## 🛠️ Passo a Passo para Gerar o Arquivo `.exe`

Siga estes passos simples no seu próprio computador para compilar e gerar o instalador para Windows:

### 1. Requisitos Iniciais
Certifique-se de que você tem o **Node.js** instalado em seu computador (baixe a versão LTS recomendada em [nodejs.org](https://nodejs.org)).

### 2. Baixar os Arquivos do Projeto
Exporte o código do Agenda Master (usando o botão de download/export no painel superior) e extraia a pasta em seu computador.

### 3. Instalar as Dependências do Electron
Abra o terminal (Prompt de Comando ou PowerShell no Windows, ou Terminal no Mac) na pasta do projeto e execute o comando:

```bash
npm install electron electron-builder concurrently --save-dev
```

### 4. Arquivos já Configurados no Projeto
Nós já configuramos os arquivos necessários para você:
* `electron/main.js`: O arquivo inicializador que cria a janela nativa do Windows, gerencia links externos e otimiza o uso de memória.
* Scripts no `package.json`: Comandos prontos para rodar em modo de desenvolvimento ou compilar para distribuição.

### 5. Compilar para Windows (.EXE)
Para gerar o instalador nativo de Windows (`.exe`), basta rodar o comando abaixo no terminal do projeto:

```bash
npm run dist
```

Este comando vai:
1. Compilar todo o projeto React para a pasta `/dist`.
2. Empacotar a aplicação em um instalador de Windows otimizado.
3. Gerar o arquivo final em `/dist-desktop/AgendaMaster Setup.exe`.

---

---

## 🔄 Como Funciona a Atualização Automática (Auto-Updater)?

Para que você não precise pedir para os seus clientes baixarem um novo arquivo `.exe` toda vez que fizer um ajuste no sistema, nós configuramos um **sistema híbrido duplo de atualização automática**:

### 1. Atualizações Instantâneas do Layout e Funções (Web/Nuvem)
O aplicativo desktop carrega diretamente a sua versão de produção na nuvem. Isso significa que **toda vez que você atualizar o Agenda Master na web, os usuários do computador também receberão a atualização no mesmo instante!**

Para garantir que o aplicativo não armazene arquivos antigos no cache:
* O sistema conta com um **Detector de Versão em Tempo Real** (`/public/version.json`).
* A cada 5 minutos, o app rodando no computador verifica silenciosamente se há uma versão mais recente na nuvem.
* Se houver, um lindo banner flutuante aparece no canto esquerdo da tela: **"Nova Atualização - Versão vX.X.X Disponível"** com um botão **"Atualizar Agora"**.
* Ao clicar, o app recarrega instantaneamente na última versão sem interromper o trabalho do usuário!

> **Como lançar uma nova versão web:**
> Basta abrir o arquivo `/public/version.json` e o componente `/modules/editor/components/UpdateNotifier.tsx`, atualizar a string da versão (ex: de `"1.0.1"` para `"1.0.2"`) e descrever as notas de atualização. Quando você salvar e colocar o site no ar, todos os apps de desktop do mundo avisarão os usuários automaticamente!

---

### 2. Atualizações Físicas do Aplicativo de Desktop (Nível .EXE)
Se no futuro você alterar o código nativo do Windows (como o arquivo `electron/main.cjs`, mudar o ícone do programa, ou as dimensões iniciais da janela), você precisará atualizar o executável instalado nos computadores. Para isso, integramos o módulo **`electron-updater`**:

1. No arquivo `package.json`, adicione uma configuração de publicação indicando onde os arquivos do seu atualizador estarão hospedados (ex: no seu bucket público do Supabase):
   ```json
   "build": {
     "publish": [
       {
         "provider": "generic",
         "url": "https://seu-projeto.supabase.co/storage/v1/object/public/desktop-apps/"
       }
     ]
   }
   ```
2. Incremente o campo `"version"` no seu `package.json` (ex: de `"1.0.0"` para `"1.0.1"`).
3. Execute o comando `npm run dist` no terminal do seu computador.
4. Além de gerar o instalador `.exe`, o compilador criará um arquivo chamado `latest.yml` na pasta `dist-desktop/`.
5. Faça o upload do novo arquivo `.exe` **E** do arquivo `latest.yml` para a mesma pasta pública do seu Supabase Storage.
6. **Pronto!** Na próxima vez que qualquer usuário abrir o Agenda Master no computador, ele detectará o arquivo `latest.yml` na nuvem, fará o download da nova instalação silenciosamente em segundo plano e exibirá uma janela de aviso perguntando se ele deseja reiniciar o programa para aplicar a atualização agora!

---

## 🚀 Como Disponibilizar o Download do `.EXE` para Seus Clientes?

Para que os seus clientes possam baixar o aplicativo diretamente do Agenda Master Web, faça o seguinte:

1. **Hospedar o arquivo `.exe`**:
   * Faça o upload do arquivo gerado (`AgendaMaster Setup.exe`) para o **Supabase Storage** (crie um bucket público como `desktop-apps`) ou qualquer serviço de armazenamento de sua preferência (Google Drive público, Dropbox, OneDrive, etc.).
2. **Copiar o Link de Download**:
   * Copie o link direto de download público do arquivo `.exe`.
3. **Colar no App**:
   * Como administrador logged in com seu e-mail (`luizalacerdaatelie@gmail.com`), você verá um **botão de edição (lápis)** ao lado do botão de download de aplicativos no Login ou no Dashboard.
   * Clique no lápis, cole o link direto do seu `.exe` e salve.
   * Pronto! A partir de agora, qualquer cliente que entrar no seu Agenda Master verá o botão de download apontando para o seu instalador `.exe` oficial!

---

## 📂 Arquivos de Configuração Adicionados e Atualizados
* **`electron/main.cjs`**: Criação da janela, otimização de memória, interceptador de links externos e suporte nativo ao **Auto-Updater** via `electron-updater`.
* **`electron/preload.cjs`**: Script de preload seguro do Electron.
* **`package.json`**: Script de compilação `dist` e dependência do `electron-updater` adicionados.
* **`/public/version.json`**: Arquivo remoto de rastreamento de versão em tempo real.
* **`/modules/editor/components/UpdateNotifier.tsx`**: Componente visual que detecta e notifica o usuário sobre atualizações de layout na nuvem.


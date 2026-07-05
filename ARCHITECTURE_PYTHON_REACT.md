# 🏗️ Blueprint: Clean Architecture - Python Backend & React + TS Frontend

Este documento descreve como projetar, estruturar e reaplicar a lógica de integração de webhooks (**HeroSpark**) e liberação de acessos utilizando **Clean Architecture (Arquitetura Limpa)** com um backend em **Python** e frontend em **React + TypeScript**.

Como comentamos sobre "timeleaf" (Thymeleaf), vale ressaltar: o Thymeleaf é tradicionalmente um motor de template Java. Em um projeto moderno com **React + TS**, o padrão ideal de Arquitetura Limpa é o desacoplamento completo: o **Python serve como uma API REST** e o **React renderiza no lado do cliente**. Se a intenção for renderizar páginas server-side em Python injetando React, usamos **Jinja2** (o equivalente Python do Thymeleaf) ou construímos os pacotes estáticos do Vite para o servidor Python servir.

Abaixo está o modelo completo e reaplicável para os seus próximos projetos.

---

## 📂 1. Estrutura de Diretórios (Clean Architecture)

```text
meu-projeto/
│
├── backend-python/                      # Camada Backend (FastAPI / Flask)
│   ├── src/
│   │   ├── domain/                      # REGRA DE NEGÓCIO E ENTIDADES (Independente de Frameworks)
│   │   │   ├── entities/
│   │   │   │   └── student.py           # Entidade Aluno (id, email, active, etc.)
│   │   │   └── repositories/
│   │   │       └── student_repo.py      # Interface abstrata do repositório
│   │   │
│   │   ├── use_cases/                   # CASOS DE USO DA APLICAÇÃO (Orquestração)
│   │   │   ├── approve_access.py        # Caso de uso: Novo pagamento / Liberação
│   │   │   └── cancel_access.py         # Caso de uso: Cancelamento / Reembolso
│   │   │
│   │   ├── adapters/                    # ADAPTADORES DE INTERFACE (Pontes de comunicação)
│   │   │   ├── controllers/
│   │   │   │   └── herospark_webhook.py # Trata a requisição HTTP e extrai dados (DTOs)
│   │   │   └── repositories/
│   │   │       └── supabase_student_repo.py # Implementação concreta do banco (ex: Supabase Python SDK)
│   │   │
│   │   └── infrastructure/              # INFRAESTRUTURA (Frameworks, Web Servers, Database Config)
│   │       ├── web/
│   │       │   └── fastapi_app.py       # Inicialização do FastAPI e roteamento das rotas
│   │       └── config.py                # Carregamento de Environment Variables
│   │
│   ├── requirements.txt                 # Dependências Python
│   └── main.py                          # Ponto de entrada do Backend
│
└── frontend-react/                      # Camada Frontend (Vite + React + TS)
    ├── src/
    │   ├── domain/                      # Modelos/Entidades TypeScript
    │   │   └── models.ts
    │   ├── services/                    # Chamadas de API (Gateway)
    │   │   └── authService.ts
    │   ├── hooks/                       # Custom hooks para encapsular lógica de estado
    │   │   └── useAccessStatus.ts
    │   ├── components/                  # Arquivos de visualização (Views)
    │   │   └── AccessGate.tsx
    │   ├── App.tsx
    │   └── main.tsx
```

---

## 🐍 2. Código de Backend em Python (Clean Architecture)

Abaixo está a implementação prática em Python utilizando **FastAPI** e a biblioteca oficial do **Supabase**.

### 2.1. Entidade de Domínio (`domain/entities/student.py`)
```python
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Student:
    email: str
    active: bool
    name: Optional[str] = None
    plano: Optional[str] = "mensal"
    plan_tier: Optional[str] = "individual"
    updated_at: Optional[datetime] = None

    def validate_email(self) -> bool:
        return "@" in self.email
```

### 2.2. Interface do Repositório (`domain/repositories/student_repo.py`)
```python
from abc import ABC, abstractmethod
from domain.entities.student import Student

class StudentRepository(ABC):
    @abstractmethod
    def upsert_student(self, student: Student) -> Student:
        """Salva ou atualiza os privilégios de acesso de um aluno"""
        pass

    @abstractmethod
    def set_active_status(self, email: str, active: bool) -> bool:
        """Modifica o status ativo de um usuário cadastrado"""
        pass
```

### 2.3. Casos de Uso (`use_cases/approve_access.py` e `cancel_access.py`)
```python
# approve_access.py
from domain.entities.student import Student
from domain.repositories.student_repo import StudentRepository
from datetime import datetime

class ApproveAccessUseCase:
    def __init__(self, repository: StudentRepository):
        self.repository = repository

    def execute(self, email: str, name: str, plano: str, plan_tier: str) -> Student:
        normalized_email = email.strip().lower()
        
        student = Student(
            email=normalized_email,
            active=True,
            name=name,
            plano=plano,
            plan_tier=plan_tier,
            updated_at=datetime.utcnow()
        )
        
        if not student.validate_email():
            raise ValueError("O endereço de e-mail é inválido")

        return self.repository.upsert_student(student)


# cancel_access.py
from domain.repositories.student_repo import StudentRepository

class CancelAccessUseCase:
    def __init__(self, repository: StudentRepository):
        self.repository = repository

    def execute(self, email: str) -> bool:
        normalized_email = email.strip().lower()
        return self.repository.set_active_status(normalized_email, False)
```

### 2.4. Implementação do Gateway Supabase (`adapters/repositories/supabase_student_repo.py`)
Certifique-se de instalar `supabase` via pip (`pip install supabase`).

```python
from domain.entities.student import Student
from domain.repositories.student_repo import StudentRepository
from supabase import create_client, Client
import os

class SupabaseStudentRepository(StudentRepository):
    def __init__(self, supabase_url: str, supabase_role_key: str):
        # Usamos uma chave administrativa (SERVICE_ROLE) para ignorar regras de RLS ao atualizar registros
        self.client: Client = create_client(supabase_url, supabase_role_key)

    def upsert_student(self, student: Student) -> Student:
        payload = {
            "email": student.email,
            "active": student.active,
            "name": student.name,
            "plano": student.plano,
            "plan_tier": student.plan_tier,
            "updated_at": student.updated_at.isoformat() if student.updated_at else None
        }
        
        # Insere ou atualiza (on Conflict de email) na tabela 'allowed_users'
        response = self.client.table("allowed_users").upsert(
            payload, 
            on_conflict="email"
        ).execute()
        
        return student

    def set_active_status(self, email: str, active: bool) -> bool:
        response = self.client.table("allowed_users").update(
            {"active": active}
        ).eq("email", email).execute()
        
        return len(response.data) > 0
```

### 2.5. Adaptador de Controller HTTP (`adapters/controllers/herospark_webhook.py`)
Contém todos os parsers expansivos e recursivos que criamos para garantir resiliência absoluta na extração de e-mails da HeroSpark.

```python
from fastapi import APIRouter, Header, HTTPException, Request, Depends
from typing import Optional
import os

router = APIRouter()

# Funções recursivas para buscar dados aninhados de forma segura
def find_email(obj) -> Optional[str]:
    if not isinstance(obj, dict):
        return None
    if isinstance(obj.get("email"), str) and "@" in obj["email"]:
        return obj["email"]
    if isinstance(obj.get("buyer_email"), str) and "@" in obj["buyer_email"]:
        return obj["buyer_email"]
    
    for key, value in obj.items():
        if "email" in key.lower() and isinstance(value, str) and "@" in value:
            return value
        if isinstance(value, dict):
            found = find_email(value)
            if found:
                return found
    return None

def find_name(obj) -> Optional[str]:
    if not isinstance(obj, dict):
        return None
    if isinstance(obj.get("name"), str) and obj["name"].strip():
        return obj["name"]
    if isinstance(obj.get("buyer_name"), str) and obj["buyer_name"].strip():
        return obj["buyer_name"]
    
    for key, value in obj.items():
        if "name" in key.lower() and isinstance(value, str) and value.strip():
            return value
        if isinstance(value, dict):
            found = find_name(value)
            if found:
                return found
    return None

# Endpoints do Webhook
@router.post("/webhook/herospark")
async def handle_herospark_webhook(request: Request):
    payload = await request.json()
    
    # 1. Extração Inteligente com métodos recursivos
    email = payload.get("email") or payload.get("buyer_email")
    if not email and "buyer" in payload and isinstance(payload["buyer"], dict):
        email = payload["buyer"].get("email")
    if not email and "cart" in payload and isinstance(payload["cart"], dict):
        cart = payload["cart"]
        email = cart.get("buyer_email") or (cart.get("buyer") or {}).get("email")
    if not email:
        email = find_email(payload)

    # Verifica se é massa de testes enviadas pelo painel herospark
    if email:
        lower_email = email.strip().lower()
        if "test" in lower_email or "example" in lower_email or "herospark" in lower_email or lower_email.startswith("12345"):
            return {"success": True, "message": "Conectividade validada com sucesso!", "is_test": True}
    
    if not email:
        raise HTTPException(status_code=400, detail="E-mail inválido ou ausente no payload")

    # Nome do comprador
    name = payload.get("name") or payload.get("buyer_name")
    if not name and "buyer" in payload and isinstance(payload["buyer"], dict):
        name = payload["buyer"].get("name")
    if not name:
        name = find_name(payload) or "Aluno"

    # Token de segurança
    secret_token = payload.get("secret_token")
    env_secret = os.getenv("HEROSPARK_WEBHOOK_SECRET")
    if env_secret and secret_token != env_secret:
        raise HTTPException(status_code=401, detail="Token secreto inválido de segurança")

    # Identificando evento e normalizando
    event = payload.get("event") or payload.get("status") or "approved"
    if "cart" in payload and isinstance(payload["cart"], dict):
        event = payload["cart"].get("status") or event
    
    event_str = str(event).lower()
    is_canceled = any(x in event_str for x in ["cancel", "refund", "chargeback", "fail", "inactive"])

    # Resolve os Casos de Uso com injeção de dependências
    # (Em servidores maiores, use contêineres de DI como Dependency Injector)
    from adapters.repositories.supabase_student_repo import SupabaseStudentRepository
    from use_cases.approve_access import ApproveAccessUseCase
    from use_cases.cancel_access import CancelAccessUseCase

    repo = SupabaseStudentRepository(
        supabase_url=os.getenv("SUPABASE_URL", ""),
        supabase_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    )

    if not is_canceled:
        # Libera acesso para o aluno
        use_case = ApproveAccessUseCase(repo)
        use_case.execute(
            email=email,
            name=name,
            plano=payload.get("plano") or payload.get("plan_type") or "mensal",
            plan_tier=payload.get("plan_tier") or "individual"
        )
        return {"success": True, "message": "Acesso aprovado com sucesso"}
    else:
        # Bloqueia/Cancela acesso do aluno
        use_case = CancelAccessUseCase(repo)
        use_case.execute(email=email)
        return {"success": True, "message": "Acesso revogado/cancelado com sucesso"}
```

---

## ⚛️ 3. O Frontend React + TypeScript (Clean Architecture)

No Frontend, estruturamos a aplicação definindo contratos de serviços e hooks reutilizáveis que isolam o estado visual dos componentes de qualquer chamada direta de APIs REST ou bibliotecas como Axios/Fetch.

### 3.1. Contrato de Domínio do Aluno (`domain/models.ts`)
```typescript
export interface UserSession {
  email: string;
  name?: string;
  active: boolean;
  plano?: string;
  plan_tier?: string;
}
```

### 3.2. Serviço de Verificação de Acesso (`services/authService.ts`)
Esta camada encapsula a API e o banco de dados. Se amanhã você trocar o Supabase por um banco de dados próprio em Python, você só precisará mudar o código deste arquivo.

```typescript
import { createClient } from "@supabase/supabase-js";
import { UserSession } from "../domain/models";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const authService = {
  /**
   * Consulta na tabela de controle se o e-mail do aluno está cadastrado e ativo
   */
  async verifyStudentAccess(email: string): Promise<UserSession | null> {
    const { data, error } = await supabase
      .from("allowed_users")
      .select("email, name, active, plano, plan_tier")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (error || !data) {
      return null;
    }

    return {
      email: data.email,
      name: data.name,
      active: data.active,
      plano: data.plano,
      plan_tier: data.plan_tier,
    };
  }
};
```

### 3.3. Gancho Customizado de Estado (`hooks/useAccessStatus.ts`)
Responsável por gerenciar os estados, tratar o carregamento e isolar o componente React.

```typescript
import { useState, useCallback } from "react";
import { UserSession } from "../domain/models";
import { authService } from "../services/authService";

export function useAccessStatus() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkAccess = useCallback(async (email: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const studentSession = await authService.verifyStudentAccess(email);
      
      if (!studentSession) {
        setSession(null);
        setErrorMessage("Este e-mail de aluno não possui cadastro de compra ativa.");
      } else if (!studentSession.active) {
        setSession(studentSession);
        setErrorMessage("Seu acesso está inativo ou expirado. Revise sua assinatura.");
      } else {
        setSession(studentSession);
      }
    } catch (err: any) {
      setErrorMessage("Erro de rede ao verificar privilégios de acesso.");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    setErrorMessage(null);
  }, []);

  return { session, loading, errorMessage, checkAccess, logout };
}
```

### 3.4. Componente Visual da View (`components/AccessGate.tsx`)
Totalmente limpo de lógica pesada de rede, focado puramente em renderizar o estado de interface do usuário de forma amigável com Tailwind CSS.

```tsx
import React, { useState } from "react";
import { useAccessStatus } from "../hooks/useAccessStatus";

export const AccessGate: React.FC = () => {
  const [inputEmail, setInputEmail] = useState("");
  const { session, loading, errorMessage, checkAccess, logout } = useAccessStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputEmail.trim()) {
      checkAccess(inputEmail);
    }
  };

  // Se o aluno está ativo e autenticado, renderize a área de conteúdos protegidos
  if (session && session.active) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto text-center border border-green-100">
        <h2 className="text-2xl font-bold text-green-600 mb-2">Acesso Permitido! 🎉</h2>
        <p className="text-gray-600 mb-4">Bem-vindo de volta, <span className="font-semibold">{session.name || "Aluno"}</span>!</p>
        <div className="bg-gray-55 p-3 rounded text-sm text-left mb-6 text-gray-550 space-y-1">
          <p><strong>E-mail:</strong> {session.email}</p>
          <p><strong>Plano:</strong> {session.plano} ({session.plan_tier})</p>
          <p><strong>Status:</strong> <span className="text-green-600 font-bold">Ativo</span></p>
        </div>
        <button 
          onClick={logout}
          className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded transition"
        >
          Sair da Área de Alunos
        </button>
      </div>
    );
  }

  // Formulário de validação de acesso
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">🔐 Portal do Aluno</h2>
      <p className="text-sm text-gray-500 mb-6 text-center">Insera o e-mail cadastrado na HeroSpark para liberar seu acesso.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">E-mail de Compra</label>
          <input
            type="email"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            placeholder="aluno@email.com"
            className="w-full px-4 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-sky-500 outline-none transition"
            required
          />
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded border border-red-100">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white font-medium rounded transition"
        >
          {loading ? "Processando..." : "Verificar Privilégios"}
        </button>
      </form>
    </div>
  );
};
```

---

## 🌟 Benefícios Práticos desse Modelo Clean

1. **Reutilização Inteligente**: Você pode copiar toda a pasta `backend-python/` ou `frontend-react/` para novos projetos substituindo apenas dados marginais (como o nome da tabela).
2. **Independência de Framework**: Se decidir trocar a biblioteca do `Supabase` por PostgreSQL nativo ou MongoDB em Python, basta alterar a classe `SupabaseStudentRepository`. O resto do código (entidades, casos de uso e routers de controle) permanece intocado!
3. **Padrão Profissional e Escalável**: Divide responsabilidades de forma que programadores de Frontend e de Backend consigam trabalhar simultaneamente no projeto sem gerar conflitos de merge ou acoplamento tecnológico.

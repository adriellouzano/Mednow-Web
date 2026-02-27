# MedNow — Plataforma Digital de Receituários Médicos
<p align="center"> <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" /> <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" /> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" /> <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" /> <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" /> <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />  </p>

## Sobre o Projeto

O **MedNow** é uma aplicação desenvolvida como Trabalho de Conclusão de Curso (TCC), composta por **duas plataformas integradas**: uma versão web e uma versão mobile, criadas para auxiliar no gerenciamento seguro de pacientes e no controle da administração de medicamentos em ambientes clínicos.
O sistema busca reduzir falhas humanas no acompanhamento terapêutico, centralizando informações médicas e automatizando lembretes e registros relacionados à medicação.

**Repositório da versão mobile:**
https://github.com/adriellouzano/Mednow---Mobile

---

## Demonstração Online

Uma versão funcional do sistema está disponível para testes:

 **Acessar aplicação:**
https://mednow-one.vercel.app/login

###   Usuário de Demonstração

Admin<br>
CPF: 123.456.789-09<br>
Senha: 123

Médico<br>
CPF: 671.650.690-03<br>
Senha: 123

Farmacêutico<br>
CPF: 694.565.160-67<br>
Senha: 123


⚠️ Ambiente destinado apenas para demonstração acadêmica, utilizando dados fictícios.
---

###  Funcionalidades

- Cadastro e autenticação de usuários
- Gerenciamento de pacientes
- Controle de prescrições médicas
- Agendamento de alarmes de medicação
- Registro de entregas e eventos clínicos
- Monitoramento e seleção de perfis

---

##  Arquitetura do Sistema

Arquitetura **Fullstack com Next.js App Router**:

```
Frontend (React + Tailwind)
        │
        ▼
API Routes / Server Actions
        │
        ▼
Prisma ORM
        │
        ▼
PostgreSQL Database
```

---

##  Tecnologias Utilizadas

- Next.js
- React
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT 
- Bcrypt 
- TailwindCSS
- Firebase 
---

##  Estrutura do Projeto

```
src/
 ├── app/
 │   ├── api/
 │   ├── cadastrar/
 │   ├── login/
 │   └── painel/
 │        └── selecionar-perfil/
 │
 ├── components/
 ├── imagens/
 ├── lib/
 └── utilitarios/
```

---

##  Pré-requisitos

- Node.js 18+
- npm ou yarn
- PostgreSQL
- Git

---

##  Variáveis de Ambiente

Crie o arquivo:

```
.env.local
```

Exemplo:

```
DATABASE_URL=
JWT_SECRET=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

##  Instalação

```bash
git clone https://github.com/seu-usuario/mednow.git
cd mednow
npm install
```

---

##  Banco de Dados

```bash
npx prisma generate
npx prisma migrate dev
```

---

##  Executando o Projeto

```bash
npm run dev
```

Acesse:

```
http://localhost:3000
```

---

##  Build de Produção

```bash
npm run build
npm start
```

---

##  Segurança

- Autenticação baseada em JWT
- Senhas criptografadas com bcrypt
- Variáveis sensíveis protegidas por environment variables
- Separação entre código cliente e servidor

---

##  Objetivo Acadêmico

Projeto desenvolvido para aplicação prática dos conceitos de:

- Engenharia de Software
- Desenvolvimento Web Fullstack
- Segurança da Informação
- Modelagem de Banco de Dados
- Integração de Sistemas

---

##  Autor

**Adriel Rodrigues Louzano**
Projeto acadêmico — 2025

---

##  Licença

Uso educacional e acadêmico.

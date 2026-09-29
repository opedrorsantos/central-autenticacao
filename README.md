# Central de Autenticação Segura com MFA

API desenvolvida em **NestJS + TypeScript** para implementar um serviço de autenticação segura com **bcrypt, JWT, Refresh Token e MFA/TOTP compatível com Google Authenticator**.

## Integrantes

- **João Pedro Rodrigues dos Santos**
- **Lohany de Assis Rocha**

## 1. Sobre o projeto

O projeto tem como objetivo desenvolver uma API de autenticação com mecanismos básicos de segurança para cadastro, login, renovação de tokens e autenticação multifator.

A aplicação utiliza:

- **NestJS** para construção da API;
- **TypeScript** como linguagem;
- **Prisma ORM** para acesso ao banco de dados;
- **SQLite** como banco de dados;
- **bcrypt** para armazenamento seguro de senhas;
- **JWT** para autenticação baseada em tokens;
- **Refresh Token** para renovação da sessão;
- **TOTP/MFA** para autenticação em dois fatores;
- **QR Code** para facilitar a configuração do autenticador;
- **Swagger** para documentação e testes da API.

## 2. Funcionalidades

Atualmente, a API possui as seguintes funcionalidades:

### Cadastro

`POST /auth/register`

Realiza o cadastro de um novo usuário.

A senha não é armazenada diretamente no banco de dados. Antes do armazenamento, ela é transformada em hash utilizando bcrypt.

Exemplo:

```json
{
  "email": "usuario@email.com",
  "senha": "Senha123!"
}
```

### Login

`POST /auth/login`

Autentica um usuário utilizando e-mail e senha.

Quando os dados estão corretos, a API gera:

- Access Token;
- Refresh Token.

O Access Token possui duração curta e é utilizado para acesso a recursos protegidos.

O Refresh Token possui duração maior e pode ser utilizado para solicitar novos tokens.

### Renovação de token

`POST /auth/refresh`

Recebe o Refresh Token e, caso ele seja válido, gera um novo Access Token e um novo Refresh Token.

Exemplo:

```json
{
  "refreshToken": "SEU_REFRESH_TOKEN"
}
```

O Refresh Token também é armazenado no banco somente em formato de hash.

### Configuração do MFA

`POST /auth/mfa/setup`

Gera um segredo TOTP e um QR Code para configuração do segundo fator de autenticação.

O QR Code pode ser escaneado por aplicativos autenticadores compatíveis, como o Google Authenticator.

### Verificação do MFA

`POST /auth/mfa/verify`

Recebe o código TOTP de 6 dígitos gerado pelo aplicativo autenticador.

Exemplo:

```json
{
  "codigo": "123456"
}
```

Quando o código é válido, o MFA é ativado para o usuário.

### Rota de teste

`GET /auth`

Retorna uma mensagem simples para confirmar que o controller de autenticação está funcionando.

## 3. Estrutura do projeto

```text
central-autenticacao/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── mfa-verify.dto.ts
│   │   │   ├── refresh.dto.ts
│   │   │   └── register.dto.ts
│   │   │
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── prisma.module.ts
│   ├── prisma.service.ts
│   ├── app.module.ts
│   └── main.ts
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 4. Modelo de usuário

O banco possui a entidade `Usuario`, com os principais campos:

```text
id
email
senha
mfaAtivo
mfaSecret
refreshTokenHash
criadoEm
```

- `id`: identificador do usuário;
- `email`: e-mail único;
- `senha`: hash da senha;
- `mfaAtivo`: indica se o MFA foi ativado;
- `mfaSecret`: segredo usado pelo TOTP;
- `refreshTokenHash`: hash do Refresh Token válido;
- `criadoEm`: data de criação do cadastro.

## 5. Tecnologias e dependências

Principais tecnologias utilizadas:

```text
Node.js
NestJS
TypeScript
Prisma
SQLite
JWT
bcrypt
otplib
QRCode
Swagger
```

## 6. Requisitos

Antes de executar o projeto, é necessário ter instalado:

- Node.js;
- npm;
- Git.

Também é recomendado utilizar o VS Code para desenvolvimento.

## 7. Instalação

Clone o repositório:

```bash
git clone https://github.com/SEU_USUARIO/central-autenticacao.git
```

Entre na pasta:

```bash
cd central-autenticacao
```

Instale as dependências:

```bash
npm install
```

## 8. Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto.

Exemplo:

```env
DATABASE_URL="file:./dev.db"
JWT_ACCESS_SECRET="sua-chave-secreta-do-access-token"
JWT_REFRESH_SECRET="sua-chave-secreta-do-refresh-token"
```

O arquivo `.env` não deve ser enviado para o GitHub.

Utilize o `.env.example` como modelo para configuração.

## 9. Banco de dados

Execute as migrações do Prisma:

```bash
npx prisma migrate dev
```

Depois gere o cliente Prisma:

```bash
npx prisma generate
```

## 10. Executando o projeto

Modo de desenvolvimento:

```bash
npm run start:dev
```

A API será executada por padrão em:

```text
http://localhost:3000
```

## 11. Swagger

A documentação interativa da API está disponível em:

```text
http://localhost:3000/docs
```

No Swagger é possível visualizar as rotas, preencher os campos das requisições e executar os endpoints diretamente.

## 12. Fluxo básico de utilização

### 1. Criar usuário

```text
POST /auth/register
```

### 2. Realizar login

```text
POST /auth/login
```

O login retorna:

```json
{
  "accessToken": "....",
  "refreshToken": "...."
}
```

### 3. Configurar MFA

```text
POST /auth/mfa/setup
```

A API retorna um QR Code que deve ser configurado em um aplicativo autenticador.

### 4. Confirmar MFA

```text
POST /auth/mfa/verify
```

Enviar o código de 6 dígitos mostrado pelo aplicativo autenticador.

### 5. Renovar tokens

```text
POST /auth/refresh
```

Enviar o Refresh Token recebido durante o login ou em uma renovação anterior.

## 13. Segurança aplicada

O projeto foi desenvolvido com alguns mecanismos de segurança:

### Hash de senha

As senhas são processadas com bcrypt antes de serem armazenadas.

### JWT

A autenticação utiliza tokens JWT para representar a sessão do usuário.

### Access Token com expiração curta

O Access Token possui validade reduzida, diminuindo o tempo de exposição caso seja comprometido.

### Refresh Token

O Refresh Token permite renovar a autenticação sem exigir que o usuário informe novamente a senha.

### Hash do Refresh Token

O Refresh Token armazenado no banco é representado por um hash, evitando manter o token em texto puro no banco de dados.

### MFA/TOTP

O segundo fator utiliza códigos temporários de 6 dígitos compatíveis com aplicativos autenticadores.

## 14. Rotas da API

| Método | Rota | Função |
|---|---|---|
| GET | `/auth` | Teste do controller |
| POST | `/auth/register` | Cadastro de usuário |
| POST | `/auth/login` | Autenticação |
| POST | `/auth/refresh` | Renovação de tokens |
| POST | `/auth/mfa/setup` | Configuração do MFA |
| POST | `/auth/mfa/verify` | Verificação do MFA |

## 15. Git e GitHub

O projeto utiliza Git para controle de versão.

Exemplo de fluxo utilizado:

```bash
git add .
git commit -m "feat: implementa central de autenticacao segura"
git push
```

Após cada nova funcionalidade ou correção, recomenda-se registrar um novo commit.

Exemplos:

```bash
git commit -m "feat: adiciona renovacao de tokens"
git commit -m "feat: implementa MFA com TOTP"
git commit -m "fix: corrige autenticacao"
git commit -m "docs: atualiza README"
```

## 16. Observações

O projeto está sendo desenvolvido como atividade acadêmica, com foco no estudo de autenticação, segurança de aplicações, APIs REST, JWT e autenticação multifator.

A rota `GET /auth/me`, prevista como etapa adicional do projeto, deve ser implementada em uma etapa posterior para retornar os dados do usuário autenticado a partir do JWT.

## 17. Autores

**João Pedro Rodrigues dos Santos**  
**Lohany de Assis Rocha**

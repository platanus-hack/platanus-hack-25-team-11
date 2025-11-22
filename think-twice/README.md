# Think Twice - AWS Lambda with TypeScript & SAM

API serverless que genera preguntas reflexivas sobre compras online usando Claude AI.

## 🚀 Features

- **TypeScript Lambda Function** con tipos completos
- **AWS SAM** para infraestructura como código
- **API Gateway** REST endpoint
- **Claude Sonnet 4** para generación de preguntas inteligentes
- **Análisis de contexto financiero** del usuario
- **Cálculo de "horas de vida"** basado en ingreso
- **GitHub Actions** para CI/CD automático
- **CORS** habilitado para acceso web
- **Soporte para desarrollo local**

## 📋 Prerequisites

- Node.js 20.x o superior
- AWS CLI configurado
- AWS SAM CLI instalado
- Cuenta de AWS con permisos apropiados
- **API Key de Anthropic** ([obtener aquí](https://console.anthropic.com/))

## 🛠️ Local Development

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
npm run build
```

### Configurar API Key de Anthropic

Para desarrollo local, crea un archivo `env.json`:

```json
{
  "ThinkTwiceFunction": {
    "ANTHROPIC_API_KEY": "tu-api-key-aqui"
  }
}
```

⚠️ **IMPORTANTE**: Nunca commitees este archivo. Ya está en `.gitignore`.

### Test Localmente

```bash
# Iniciar API local
sam build
sam local start-api --env-vars env.json

# En otra terminal, probar el endpoint
curl -X POST http://localhost:3000/consult \
  -H "Content-Type: application/json" \
  -d @test-event.json
```

### Deploy Manual

```bash
# Build y deploy (primera vez)
sam build
sam deploy --guided --parameter-overrides AnthropicApiKey=tu-api-key-aqui
```

## 🔧 GitHub Actions Setup

### Required GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

#### Option 1: OIDC (Recommended)

- `AWS_ROLE_ARN` - ARN of the IAM role for GitHub Actions
- `AWS_REGION` - AWS region (e.g., `us-east-1`)

#### Option 2: Access Keys

- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `AWS_REGION` - AWS region (e.g., `us-east-1`)

### Setting up OIDC (Recommended)

1. Create an IAM OIDC identity provider in AWS:

   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`

2. Create an IAM role with trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:*"
        }
      }
    }
  ]
}
```

3. Attach necessary policies to the role (CloudFormation, Lambda, IAM, S3, API Gateway)

### Workflow Triggers

The GitHub Actions workflow runs on:

- Push to `main` branch
- Pull requests to `main` branch
- Manual trigger (workflow_dispatch)

## 📁 Project Structure

```
think-twice/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── src/
│   └── index.ts                # Lambda handler
├── dist/                       # Compiled JavaScript (gitignored)
├── template.yaml               # SAM template
├── tsconfig.json               # TypeScript configuration
├── package.json                # Node.js dependencies
├── samconfig.toml              # SAM deployment config
└── .gitignore                  # Git ignore rules
```

## 🌐 API Endpoints

### GET /hello

Returns a greeting with request information.

**Response:**

```json
{
  "message": "Hello from Think Twice Lambda!",
  "timestamp": "2025-11-22T10:30:00.000Z",
  "method": "GET",
  "queryParams": {},
  "body": {},
  "path": "/hello"
}
```

### POST /hello

Accepts JSON body and returns it with request information.

**Request:**

```bash
curl -X POST https://your-api-url/Prod/hello \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "action": "test"}'
```

**Response:**

```json
{
  "message": "Hello from Think Twice Lambda!",
  "timestamp": "2025-11-22T10:30:00.000Z",
  "method": "POST",
  "queryParams": {},
  "body": {
    "name": "John",
    "action": "test"
  },
  "path": "/hello"
}
```

## 🔍 Monitoring & Logs

View logs using AWS CLI:

```bash
sam logs -n ThinkTwiceFunction --stack-name think-twice-lambda --tail
```

Or view in AWS CloudWatch Logs console.

## 🧹 Cleanup

To delete the deployed stack:

```bash
sam delete --stack-name think-twice-lambda
```

## 📝 Notes

- The Lambda function uses Node.js 20.x runtime
- Function timeout is set to 30 seconds
- Memory allocation is 256 MB
- CORS is enabled for all origins (`*`)
- Source maps are generated for debugging

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with `npm run local`
4. Push to trigger the GitHub Actions workflow
5. Create a pull request

## 📄 License

MIT

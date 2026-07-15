# FlowMind AI — Liquid Intelligence

[![Build](https://img.shields.io/github/actions/workflow/status/flowmind/flowmind/ci.yml?branch=main&style=flat-square)](https://github.com/flowmind/flowmind/actions)
[![Test Coverage](https://img.shields.io/codecov/c/github/flowmind/flowmind?style=flat-square)](https://codecov.io/gh/flowmind/flowmind)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

> **No hay barreras. Solo tu mente y el flujo.**  
> Build intelligent automation flows with AI-powered precision.

FlowMind AI is a next-generation workflow automation platform that combines the power of LLMs (OpenAI GPT-4o, Anthropic Claude 3) with a visual flow builder. Unlike traditional automation tools that require manual configuration, FlowMind's AI Copilot can generate, optimize, debug, and explain entire workflows from natural language prompts.

---

## Key Features

- **AI Copilot** — Generate complete automation flows from plain English. "When I get a Slack message, summarize it and post to Notion."
- **Visual Flow Builder** — Drag-and-drop canvas with triggers, actions, conditions, loops, transforms, and AI nodes.
- **8 Node Types** — TRIGGER, ACTION, CONDITION, DELAY, AI, WEBHOOK, LOOP, TRANSFORM.
- **Multi-Provider AI** — OpenAI GPT-4o (primary) with automatic fallback to Anthropic Claude 3.
- **Connectors** — Slack, Gmail, HTTP Webhooks, and extensible connector system.
- **Workspaces & RBAC** — Multi-tenant organizations with ADMIN_ORG, DEVELOPER, BUSINESS_USER, VIEWER roles.
- **Scheduling** — Cron-based and interval scheduling for flow execution.
- **Webhook Support** — Inbound webhooks with HMAC-SHA256 verification and replay protection.
- **Real-Time Monitoring** — Socket.io-based live execution tracking, logs, and activity feed.
- **Variables & Secrets** — Encrypted secret storage with AES-256-GCM and full audit log.
- **Templates & Marketplace** — Pre-built flow templates for common automation patterns.
- **Background Jobs** — BullMQ-powered async execution with exponential backoff retry.
- **API Keys** — Scoped API keys (read/write/admin) for programmatic access.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, Radix UI |
| **Framework** | TypeScript 5.4, tRPC 10, TanStack Query 5 |
| **Database** | PostgreSQL 16, Drizzle ORM |
| **Cache & Queue** | Redis 7, BullMQ |
| **AI** | OpenAI SDK, Anthropic SDK |
| **Real-Time** | Socket.io, socket.io-redis |
| **Background** | BullMQ Workers |
| **Auth** | JWT (HS256), bcryptjs, cookie-based |
| **Monorepo** | Turborepo, pnpm 9 |
| **Testing** | Vitest, Testing Library, Playwright |
| **Observability** | Pino (structured logging), Sentry |
| **Container** | Docker, Docker Compose |

---

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/flowmind/flowmind.git
cd flowmind
pnpm install

# 2. Start infrastructure
docker compose up -d postgres redis

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your keys (DATABASE_URL, OPENAI_API_KEY, etc.)

# 4. Push database schema
pnpm db:push

# 5. Start development
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Login with the seed credentials or register a new account.

---

## Project Structure

```
flowmind/
├── apps/
│   └── web/                          # Next.js 14 App Router
│       ├── app/
│       │   ├── (auth)/               # Login, Register
│       │   └── (dashboard)/          # Dashboard, Flows, Connectors, Variables,
│       │                               Monitor, Activity, Templates, Settings, Help
│       ├── components/               # Shared UI components
│       ├── hooks/                    # Custom React hooks
│       ├── stores/                   # Zustand stores
│       ├── providers/                # React context providers
│       ├── tests/                    # Vitest + Playwright tests
│       └── types/                    # TypeScript type definitions
├── packages/
│   ├── core/                         # Domain logic, value objects, entities, ports
│   ├── database/                     # Drizzle schema, repositories, migrations
│   ├── engine/                       # Flow execution engine, node handlers
│   ├── ai/                           # AI Copilot (OpenAI + Anthropic)
│   ├── queue/                        # BullMQ background job workers
│   ├── ws/                           # Socket.io real-time server
│   ├── connectors/                   # Slack, Gmail, HTTP connectors
│   └── shared/                       # Shared utilities, errors, encryption, types
├── docker/                           # Dockerfiles for app and worker
├── docker-compose.yml                # PostgreSQL, Redis, App, Worker
├── turbo.json                        # Turborepo pipeline
└── pnpm-workspace.yaml               # Workspace configuration
```

---

## Documentation

| Document | Description |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, decisions, data flow |
| [API.md](./API.md) | tRPC routers, REST endpoints, webhooks, auth |
| [DATABASE.md](./DATABASE.md) | ER diagram, schema, indexes, RLS policies |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Docker, Railway, Vercel, CI/CD, monitoring |
| [TESTING.md](./TESTING.md) | Test strategy, unit/integration/E2E, coverage |
| [SECURITY.md](./SECURITY.md) | Auth, RBAC, encryption, webhook security |
| [WALKTHROUGH.md](./WALKTHROUGH.md) | Step-by-step product walkthrough |

---

## License

MIT License — see [LICENSE](LICENSE).

---

## Security

Report vulnerabilities to **security@flowmind.ai**.  
See [SECURITY.md](./SECURITY.md) for our full security policy and [SECURITY-CHECKLIST.md](./SECURITY-CHECKLIST.md) for the pre-deployment checklist.

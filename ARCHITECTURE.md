# FlowMind AI — Architecture

## Overview

FlowMind AI is a **modular monolith** built on a Turborepo monorepo. All packages live in a single deployable unit but are separated by domain boundary. This gives us the development speed of a monolith with the discipline of modular architecture.

The system has four runtime processes:

1. **Next.js App** — Server-rendered frontend + API routes (tRPC + REST)
2. **BullMQ Worker** — Background job processor for flow executions
3. **Socket.io Server** — Real-time event bus (co-located or standalone)
4. **Infrastructure** — PostgreSQL 16 + Redis 7

---

## Layer Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│  Next.js App Router  │  React + TanStack Query  │  Socket.io    │
└──────────────────────────────┬───────────────────────────────────┘
                               │ HTTP / WebSocket
┌──────────────────────────────┴───────────────────────────────────┐
│                     NEXT.JS API LAYER                            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ tRPC Router  │  │ REST Routes  │  │ Webhook Endpoints      │  │
│  │ (flows, exec,│  │ (/api/auth,  │  │ (/api/webhooks/*)      │  │
│  │  connectors, │  │  /api/health)│  │ Slack, Gmail, Generic  │  │
│  │  ai, search) │  │              │  │                        │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬─────────────┘  │
└─────────┼─────────────────┼──────────────────────┼────────────────┘
          │                 │                      │
┌─────────┼─────────────────┼──────────────────────┼────────────────┐
│         ▼                 ▼                      ▼                │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                   APPLICATION CORE                        │    │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌───────────┐  │    │
│  │  │ @core    │ │ @engine   │ │ @ai      │ │ @queue    │  │    │
│  │  │ Entities │ │ Executor  │ │ Copilot  │ │ BullMQ    │  │    │
│  │  │ VOs      │ │ Node Hdlrs│ │ Parser   │ │ Workers   │  │    │
│  │  │ Ports    │ │ Retry Mgr │ │ Models   │ │           │  │    │
│  │  └──────────┘ └───────────┘ └──────────┘ └───────────┘  │    │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────┐               │    │
│  │  │ @ws      │ │ @connectors│ │ @shared  │               │    │
│  │  │ Socket.io│ │ Slack/Gmail│ │ Utils    │               │    │
│  │  │ Events   │ │ HTTP       │ │ Errors   │               │    │
│  │  └──────────┘ └───────────┘ └──────────┘               │    │
│  └──────────────────────────────────────────────────────────┘    │
│                         │                                         │
│  ┌──────────────────────┴──────────────────────────────────────┐  │
│  │                  DATA ACCESS LAYER                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │  │
│  │  │ @database    │  │ Redis        │  │ BullMQ Queues    │  │  │
│  │  │ Drizzle ORM  │  │ Cache/Sess   │  │ Flow Execution   │  │  │
│  │  │ Repositories │  │ Rate Limiting│  │ Webhook Proc.    │  │  │
│  │  │ Migrations   │  │ Pub/Sub      │  │ Scheduled Runs   │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────────┘  │  │
│  └─────────┼─────────────────┼──────────────────────────────────┘  │
└────────────┼─────────────────┼─────────────────────────────────────┘
             │                 │
             ▼                 ▼
     ┌──────────────┐  ┌──────────────┐
     │  PostgreSQL  │  │    Redis     │
     │    16        │  │    7         │
     └──────────────┘  └──────────────┘
```

---

## Architectural Decisions

### Why Modular Monolith (not microservices)?

| Factor | Decision |
|---|---|
| Team size | Small team — monolith reduces coordination overhead |
| Domain boundaries | Packages enforce modularity without network overhead |
| Deployment | Single deployable unit — simpler ops |
| Performance | No inter-service latency for core flows |
| Future | Can extract services along package boundaries if needed |

### Why Next.js App Router?

- Server Components reduce client-side JS by ~40%
- API routes co-located with frontend for tRPC
- Built-in image optimization, font optimization, streaming
- Middleware for auth, rate limiting, tenant isolation

### Why Drizzle ORM (not Prisma)?

- SQL-like API with full type safety
- Lighter bundle — no engine binary
- Better migration workflow with `drizzle-kit`
- Raw SQL escape hatch via `sql` template tag
- Better performance on complex queries

### Why tRPC (not REST/GraphQL)?

- End-to-end type safety — Zod schemas shared between client and server
- No code generation — inferred types from router definitions
- Lower boilerplate than GraphQL
- Automatic serialization with superjson

### Why BullMQ (not in-process)?

- Flow executions can be long-running (minutes to hours)
- Redis-backed persistence survives process restarts
- Built-in retry with exponential backoff
- Worker can be scaled independently

### Why Socket.io (not SSE/WebSocket raw)?

- Automatic fallback to long-polling
- Built-in room management for multi-tenant isolation
- Redis adapter for horizontal scaling
- Event-based architecture matches our domain

---

## Main Flows

### Create Flow

```
User → Canvas → Drag nodes → Configure → Save Draft
                ↓
          AI Copilot (optional)
          "Create a flow that sends me a
           Slack notification when I get
           an email from my boss"
                ↓
          AI generates nodes + edges
                ↓
          User reviews & edits → Save
```

### Execute Flow

```
Trigger fires (schedule/webhook/manual)
    ↓
BullMQ enqueues execution job
    ↓
Worker picks up job
    ↓
Executor resolves node execution order (topological sort)
    ↓
For each node:
  → Resolve variables (with template interpolation)
  → Build context (previous node outputs)
  → Execute node handler (with retry & timeout)
  → Emit real-time events via Socket.io
    ↓
Execution completes (SUCCESS / FAILED)
    ↓
Notification sent to user
```

### AI Generates Flow

```
User prompt: "When a new Slack message arrives in #support,
  analyze sentiment with AI, if negative create a Jira ticket,
  if positive save to Notion database"
    ↓
Copilot.generate({ action: "generate_flow", ... })
    ↓
ContextBuilder gathers:
  → Installed connectors
  → Recent flows
  → Available templates
    ↓
OpenAI call with tool calling (generate_flow function)
  (auto fallback to Anthropic if OpenAI fails)
    ↓
Parser validates JSON structure with Zod
    ↓
Return { nodes, edges, description }
    ↓
Canvas renders generated flow
```

### Webhook (Inbound)

```
External service → POST /api/webhooks/{source}/{token}
    ↓
Security checks:
  1. Payload size validation (max 256 KB)
  2. HMAC-SHA256 signature verification
  3. Replay attack prevention (webhook ID in Redis, 24h TTL)
  4. Timestamp freshness (5 min tolerance)
    ↓
Return 202 Accepted immediately
    ↓
BullMQ enqueues webhook processing job
    ↓
Worker matches webhook to active flows
    ↓
For each matching flow → execute
```

---

## Data Model (Conceptual ER)

```
Organization 1──N Workspace
Organization 1──N OrganizationMember N──1 User
Organization 1──N InstalledConnector N──1 Connector
Organization 1──N Template
Organization 1──N ActivityLog N──1 User
Workspace 1──N Flow
Workspace 1──N Variable
Workspace 1──N WorkspaceMember N──1 User
Flow 1──N Execution
Flow 1──N Schedule
Flow 1──N FlowVersion
Execution 1──N ExecutionStep
Variable 1──N VariableAuditLog
User 1──N Notification
User 1──N AISuggestion
User 1──N Invitation
```

---

## Security Architecture

- **Auth**: JWT (HS256) with access tokens (15 min) + refresh tokens (7 days)
- **RBAC**: ADMIN_ORG > DEVELOPER > BUSINESS_USER > VIEWER — enforced server-side per endpoint
- **Encryption**: AES-256-GCM for secrets at rest; 64-char hex key; unique IV per encryption
- **Rate Limiting**: Redis sliding window — 5/min auth, 100/min read, 30/min write, 20/min AI, 200/min webhooks
- **Webhook Security**: HMAC-SHA256 signing, replay prevention, payload size limits, timestamp validation
- **API Keys**: `fm_{prefix}_{random}` format, SHA-256 stored hash, scoped (read/write/admin)
- **CORS**: Strict whitelist via CORS_ORIGINS env var, HTTPS enforced in production
- **HTTP Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **PII**: Encrypted at rest, masked in logs, tagged in schema with `@pii` markers
- **Data Retention**: Executions 90d, audit logs 365d, webhook payloads 30d

---

## Performance Targets

| Metric | Target |
|---|---|
| LCP | < 2.0s |
| FID/INP | < 100ms |
| CLS | < 0.05 |
| TTFB (API) | < 100ms (p95) |
| Flow execution start | < 500ms from trigger |
| Webhook ack | < 200ms |
| AI Copilot response | < 5s (p95) |
| Page load (dashboard) | < 1.5s |

---

## Scalability

| Component | Strategy |
|---|---|
| **Next.js** | Horizontal scale via container replicas; stateless by design |
| **PostgreSQL** | Connection pooling (max 20); read replicas for analytics; pgvector for future AI features |
| **Redis** | Cluster mode for cache + BullMQ + rate limiting + Socket.io adapter |
| **BullMQ Workers** | Independent scaling from web server; add workers for more throughput |
| **Socket.io** | Redis adapter enables multi-instance real-time broadcasting |
| **Static Assets** | CDN with immutable cache headers (1 year) |
| **Images** | AVIF/WebP formats, device-size responsive srcset |

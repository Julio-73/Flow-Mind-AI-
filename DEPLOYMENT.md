# FlowMind AI — Deployment Guide

---

## System Requirements

| Requirement | Minimum | Recommended |
|---|---|---|
| Node.js | 20.x | 22.x LTS |
| pnpm | 9.x | 9.x |
| PostgreSQL | 16 | 16 |
| Redis | 7 | 7 |
| RAM | 2 GB | 4 GB |
| CPU | 2 cores | 4 cores |
| Disk | 10 GB | 20 GB SSD |
| Docker | 24+ | 24+ |

---

## Environment Variables

All environment variables are documented in `.env.example`. Below is the complete reference:

### Database

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `DATABASE_URL` | Yes | 🔴 | — | PostgreSQL connection string (`postgresql://user:pass@host:5432/db`) |
| `DATABASE_POOL_MIN` | No | 🟡 | `2` | Minimum connection pool size |
| `DATABASE_POOL_MAX` | No | 🟡 | `20` | Maximum connection pool size |

### Redis

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `REDIS_URL` | Yes | 🔴 | — | Redis connection string (`redis://:password@host:6379/0`) |
| `REDIS_HOST` | No | 🟢 | `localhost` | Redis host |
| `REDIS_PORT` | No | 🟢 | `6379` | Redis port |
| `REDIS_PASSWORD` | No | 🔴 | — | Redis password (required in production) |

### Authentication (JWT)

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `JWT_ACCESS_SECRET` | Yes | 🔴 | — | Min 32 chars. Rotate every 90 days. |
| `JWT_REFRESH_SECRET` | Yes | 🔴 | — | Min 32 chars. Must differ from ACCESS. Rotate every 90 days. |
| `JWT_ACCESS_EXPIRES_IN` | No | 🟡 | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | No | 🟡 | `7d` | Refresh token TTL |
| `BCRYPT_SALT_ROUNDS` | No | 🟡 | `12` | bcrypt cost factor |

### Encryption

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `ENCRYPTION_KEY` | Yes | 🔴 | — | Exactly 64 hex chars (32 bytes, 256 bits). Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Rotate every 90 days. |

### AI Providers

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `OPENAI_API_KEY` | Yes | 🔴 | — | OpenAI API key (`sk-...`) |
| `OPENAI_MODEL` | No | 🟢 | `gpt-4o` | OpenAI model |
| `OPENAI_MAX_TOKENS` | No | 🟡 | `4096` | Max tokens per request |
| `OPENAI_TEMPERATURE` | No | 🟡 | `0.2` | Model temperature |
| `ANTHROPIC_API_KEY` | No | 🔴 | — | Anthropic API key (fallback) |
| `ANTHROPIC_MODEL` | No | 🟢 | `claude-3-opus-20240229` | Anthropic model |
| `ANTHROPIC_MAX_TOKENS` | No | 🟡 | `4096` | Max tokens (fallback) |

### Slack Connector

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `SLACK_CLIENT_ID` | No | 🟡 | — | Slack app client ID |
| `SLACK_CLIENT_SECRET` | No | 🔴 | — | Slack app client secret |
| `SLACK_SIGNING_SECRET` | No | 🔴 | — | For HMAC verification of Slack webhooks |

### Gmail Connector

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `GMAIL_CLIENT_ID` | No | 🟡 | — | Google OAuth client ID |
| `GMAIL_CLIENT_SECRET` | No | 🔴 | — | Google OAuth client secret |
| `GMAIL_REFRESH_TOKEN` | No | 🔴 | — | Gmail API refresh token |

### Application

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Yes | 🟢 | — | Must be HTTPS in production |
| `NEXT_PUBLIC_APP_NAME` | No | 🟢 | `FlowMind AI` | Application name |
| `NODE_ENV` | No | 🟡 | `development` | `development`, `production`, `test`, `staging` |

### Socket.io

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `SOCKETIO_PATH` | No | 🟢 | `/api/socket` | Socket.io path |
| `SOCKETIO_CORS_ORIGIN` | No | 🟢 | — | Socket.io CORS origin |

### BullMQ

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `BULLMQ_PREFIX` | No | 🟢 | `flowmind` | Redis key prefix |
| `BULLMQ_DEFAULT_ATTEMPTS` | No | 🟡 | `3` | Default retry attempts |
| `BULLMQ_BACKOFF_TYPE` | No | 🟡 | `exponential` | `exponential` or `fixed` |
| `BULLMQ_BACKOFF_DELAY` | No | 🟡 | `2000` | Backoff delay in ms |

### Rate Limiting

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `RATE_LIMIT_WINDOW_MS` | No | 🟡 | `60000` | Window in ms |
| `RATE_LIMIT_MAX_REQUESTS` | No | 🟡 | `100` | Max requests per window |

### CORS

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `CORS_ORIGINS` | No | 🟡 | `http://localhost:3000` | Comma-separated allowed origins |

### Logging

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `LOG_LEVEL` | No | 🟡 | `info` | `fatal`, `error`, `warn`, `info`, `debug`, `trace` |
| `LOG_PRETTY` | No | 🟢 | — | Pretty-print logs in development |

### Sentry

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `SENTRY_DSN` | No | 🟡 | — | Sentry DSN for error tracking |

### Webhooks

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `WEBHOOK_PAYLOAD_MAX_BYTES` | No | 🟡 | `262144` | Max payload (256 KB) |
| `WEBHOOK_TIMEOUT_MS` | No | 🟡 | `10000` | Webhook timeout |

---

## Docker Compose Setup

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down

# Full reset (destroys volumes)
docker compose down -v
```

The Compose file (`docker-compose.yml`) starts:

| Service | Image | Port | Description |
|---|---|---|---|
| `postgres` | postgres:16-alpine | 5432 | Database |
| `redis` | redis:7-alpine | 6379 | Cache + Queue |
| `app` | custom (Dockerfile) | 3000 | Next.js application |
| `worker` | custom (Dockerfile.worker) | — | BullMQ background worker |

---

## Railway Deployment

Railway handles PostgreSQL, Redis, and app deployment automatically.

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Init project
railway init

# Deploy
railway up
```

**Required Railway services**:
1. **PostgreSQL** — Railway PostgreSQL plugin
2. **Redis** — Railway Redis plugin
3. **App** — Connect to the monorepo, set build command to `pnpm build`, start command to `pnpm --filter @flowmind/web start`
4. **Worker** — Same repo, start command: `pnpm --filter @flowmind/queue start`

**Environment variables**: Set all from `.env.example` in Railway dashboard. Railway auto-injects `DATABASE_URL` and `REDIS_URL`.

---

## Vercel Deployment (Frontend Only)

If deploying frontend separately from backend:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Vercel configuration** (`vercel.json`):

```json
{
  "buildCommand": "pnpm build --filter @flowmind/web",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs",
  "installCommand": "pnpm install"
}
```

**Note**: WebSocket and BullMQ worker are not available on Vercel's serverless infrastructure. Use Railway or Docker for full functionality.

---

## CI/CD with GitHub Actions

### Workflow: CI Pipeline

File: `.github/workflows/ci.yml`

```yaml
name: CI
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env: { POSTGRES_USER: flowmind, POSTGRES_PASSWORD: flowmind_pass, POSTGRES_DB: flowmind }
        ports: [5432:5432]
      redis:
        image: redis:7-alpine
        ports: [6379:6379]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:push
      - run: pnpm test -- --reporter=junit --coverage
      - uses: codecov/codecov-action@v4

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm security:check
      - run: pnpm security:sbom

  e2e:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env: { POSTGRES_USER: flowmind, POSTGRES_PASSWORD: flowmind_pass, POSTGRES_DB: flowmind }
        ports: [5432:5432]
      redis:
        image: redis:7-alpine
        ports: [6379:6379]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: apps/web/playwright-report/
```

### Workflow: Deploy to Railway

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: railway/actions/setup@v1
      - run: railway up --service flowmind-app
      - run: railway up --service flowmind-worker
```

---

## Health Checks

| Endpoint | Service | Expected |
|---|---|---|
| `GET /api/health` | App | `{ status: "ok", ... }` |
| PostgreSQL healthcheck | DB | `pg_isready -U flowmind` |
| Redis healthcheck | Cache | `redis-cli incr ping` |
| App healthcheck (Docker) | App | `curl -f http://localhost:3000/api/health` |
| Worker healthcheck (Docker) | Worker | `ps aux | grep worker` |

---

## Monitoring

| Tool | Purpose | Configuration |
|---|---|---|
| **Sentry** | Error tracking | Set `SENTRY_DSN` env var. PII stripping enabled. |
| **Pino** | Structured logging | JSON logs, auto-redacts secrets. Log level: `info` in production. |
| **Health checks** | Uptime monitoring | `/api/health` endpoint, Docker HEALTHCHECK |
| **BullMQ Dashboard** | Queue monitoring | Optional: `bull-board` integration |
| **Rate limiting alerts** | Abuse detection | Logs rate limit violations. Alert on spike. |

### Sentry Setup

```bash
# Install Sentry
pnpm add @sentry/nextjs

# Configure in next.config.js
# Set SENTRY_DSN in environment
```

---

## Rollback Plan

### If Docker:

```bash
# Rollback to previous version
docker compose down
docker compose up -d  # uses previous image if tag pinned

# Or pull specific version
docker compose pull app
docker compose up -d
```

### If Railway:

```bash
# Deploy previous deployment
railway rollback
# Or via Railway dashboard → Deployments → Rollback
```

### Database Rollback:

```bash
# Drizzle does not support automatic rollbacks.
# Manual down migration required:
# 1. Write SQL to revert the migration
# 2. Apply: psql $DATABASE_URL -f rollback.sql
# 3. Update drizzle_meta table
```

### Rollback Steps:

1. **Assess impact** — Is it a database schema change? Data loss?
2. **Stop traffic** — Remove app from load balancer or set maintenance page
3. **Rollback code** — Deploy previous container image or git tag
4. **Rollback DB** — If schema change, apply manual down migration
5. **Verify** — Run health checks and smoke tests
6. **Resume traffic** — Add back to load balancer

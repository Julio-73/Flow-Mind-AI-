# FlowMind AI — Monitoring Guide

## 1. Sentry (Error Tracking)

### Setup

1. Create a project at [sentry.io](https://sentry.io) for FlowMind AI
2. Add the DSN to your `.env`:

```env
SENTRY_DSN=https://your-dsn@oXXXX.ingest.sentry.io/XXXXXX
```

3. Install the Sentry Next.js SDK:

```bash
pnpm add @sentry/nextjs
```

4. Run the Sentry wizard to auto-generate config:

```bash
pnpm --filter @flowmind/web sentry-wizard -i nextjs
```

### Key metrics to monitor in Sentry

| Metric | Threshold | Action |
|---|---|---|
| Error count per minute | > 10 in 5min | Alert on-call |
| HTTP 5xx rate | > 1% of requests | Check API routes |
| API response time p95 | > 2000ms | Profile slow endpoints |
| Unhandled rejections | Any | Fix immediately |
| Performance score | < 75 | Profile bundles |

### PII Stripping

Configure in Sentry dashboard:
- **Server-side**: Strip query strings, request body, and user IP automatically
- **Before Send** callback in `sentry.client.config.ts`:

```ts
Sentry.init({
  beforeSend(event) {
    if (event.request?.data) delete event.request.data;
    if (event.user?.email) delete event.user.email;
    return event;
  },
});
```

---

## 2. Logtail / Axiom (Centralized Logging)

### Axiom Setup

1. Create account at [axiom.co](https://axiom.co)
2. Create a dataset: `flowmind-logs`
3. Get API token and ingest URL

### Docker Logging Driver

Already configured in `docker-compose.prod.yml`:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

For production, use the Axiom Docker plugin:

```yaml
logging:
  driver: "axiom/axiom-docker-logger"
  options:
    axiom_token: "${AXIOM_TOKEN}"
    axiom_dataset: "flowmind-logs"
    axiom_org_id: "${AXIOM_ORG_ID}"
```

### Log Levels

| Level | Environment | Purpose |
|---|---|---|
| `error` | All | Runtime errors, unhandled rejections |
| `warn` | All | Degraded performance, retries |
| `info` | Production | Service lifecycle, auth events |
| `debug` | Development | Detailed request/response |

---

## 3. Uptime Kuma (Health Checks)

### Self-hosted Setup

```bash
docker run -d \
  --name uptime-kuma \
  -p 3001:3001 \
  -v uptime-kuma-data:/app/data \
  louislam/uptime-kuma:latest
```

### Monitors to Create

| Monitor | URL | Interval | Threshold |
|---|---|---|---|
| App Health | `https://flowmind.ai/api/health` | 60s | 3 retries |
| App SSL | `https://flowmind.ai` | 24h | 30 days expiry |
| PostgreSQL | `postgresql://...` (via TCP ping) | 60s | 3 retries |
| Redis | `redis://...` (via TCP ping) | 60s | 3 retries |
| Worker Process | `https://flowmind.ai/api/health/worker` | 120s | 3 retries |

### Alert Channels

- **Slack**: Send alerts to `#alerts` channel
- **Email**: On-call engineer
- **Webhook**: Trigger PagerDuty/Opsgenie
- **Pushover**: Mobile push notifications

---

## 4. Docker Health Checks

Built into `docker-compose.yml`:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

View health status:

```bash
docker ps --filter "name=flowmind" --format "table {{.Names}}\t{{.Status}}"
```

---

## 5. Metrics API Endpoint

`GET /api/health` returns:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "0.1.0",
  "checks": {
    "database": { "status": "ok", "latency_ms": 2 },
    "redis": { "status": "ok", "latency_ms": 1 },
    "uptime_seconds": 3600,
    "memory_mb": { "heap_used": 128, "heap_total": 256, "rss": 180 }
  }
}
```

---

## 6. Alerts Configuration

### Critical (PagerDuty/Phone)

| Condition | Response |
|---|---|
| App unreachable for 5min | Wake on-call engineer |
| Database connection lost | Emergency restore from backup |
| SSL certificate expires < 7 days | Renew immediately |
| Disk usage > 90% | Clean logs, expand volume |

### Warning (Slack/Email)

| Condition | Response |
|---|---|
| API p95 latency > 2000ms | Profile slow queries |
| Error rate > 1% | Review Sentry in morning |
| Memory > 80% usage | Consider scaling up |
| Backup failed | Check disk space & retry |

### Info (Dashboard)

| Condition | Response |
|---|---|
| Deploy started/finished | Monitor health check |
| Database migration ran | Verify data integrity |
| Certificate renewed | Confirm in 24h |

---

## 7. Dashboard Recommendations

### Grafana (if self-hosting)

Panels to create:
1. **Uptime**: App, DB, Redis availability over 7d/30d
2. **API Latency**: p50/p95/p99 over time
3. **Error Rate**: 5xx vs 4xx ratio
4. **Active Users**: WebSocket connections
5. **Queue Depth**: BullMQ jobs pending/failed
6. **System Resources**: CPU, Memory, Disk on host

### Better Stack / Uptime Robot (if SaaS)

- Create status page: `status.flowmind.ai`
- Public: Uptime, response time (last 90 days)
- Private: All alerts, SSL monitoring

---

## 8. Key Commands

```bash
# View logs
docker compose logs -f app
docker compose logs -f worker
docker compose logs -f postgres

# Health check
curl http://localhost:3000/api/health
./scripts/health-check.sh
./scripts/health-check.sh --watch

# Monitor resources
docker stats flowmind-app flowmind-worker flowmind-postgres flowmind-redis

# Test alerts
docker compose stop app        # triggers health check failure
docker compose restart postgres # tests DB reconnection

# View Sentry errors
open "https://sentry.io/organizations/flowmind/issues/"

# Check backup integrity
pg_restore --list backups/latest.sql.gz | head -20
```

---

## 9. Runbooks

### App Down

```bash
ssh flowmind@host
cd /home/flowmind/flowmind
docker compose logs --tail=100 app    # check last errors
docker compose restart app             # quick restart
docker compose up -d --build app       # rebuild if needed
docker compose ps                      # verify running
```

### Database Corruption

```bash
# 1. Stop app to prevent writes
docker compose stop app worker

# 2. Restore latest backup
./scripts/restore.sh backups/$(ls -t backups/ | head -1)/*.sql.gz

# 3. Verify data
docker compose exec postgres psql -U flowmind -d flowmind -c "SELECT count(*) FROM users;"

# 4. Restart services
docker compose up -d
```

### Redis Data Loss (BullMQ Jobs)

BullMQ persists job state in Redis. If Redis is lost:

1. Jobs in active/waiting state will be lost
2. Completed/failed jobs are recoverable from PostgreSQL (if you persist them)
3. Restart worker to re-queue any pending jobs from database:

```bash
docker compose restart worker
```

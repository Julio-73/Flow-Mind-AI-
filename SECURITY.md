# FlowMind AI — Security Policy

## Table of Contents
1. [Authentication](#1-authentication)
2. [Authorization (RBAC)](#2-authorization-rbac)
3. [Data Protection](#3-data-protection)
4. [HTTP Security Headers](#4-http-security-headers)
5. [Rate Limiting](#5-rate-limiting)
6. [CORS Policy](#6-cors-policy)
7. [Input Validation & Injection Prevention](#7-input-validation--injection-prevention)
8. [XSS Prevention](#8-xss-prevention)
9. [CSRF Prevention](#9-csrf-prevention)
10. [Webhook Security](#10-webhook-security)
11. [API Key Management](#11-api-key-management)
12. [WebSocket Security](#12-websocket-security)
13. [AI Copilot Security](#13-ai-copilot-security)
14. [Logging & Monitoring](#14-logging--monitoring)
15. [Dependency Security](#15-dependency-security)
16. [Secrets Management](#16-secrets-management)
17. [Incident Response](#17-incident-response)

---

## 1. Authentication

### JWT Tokens

| Property | Access Token | Refresh Token |
|---|---|---|
| Expiry | 15 minutes | 7 days |
| Algorithm | HS256 | HS256 |
| Storage | HttpOnly Secure SameSite cookie | HttpOnly Secure SameSite cookie |
| Rotation | — | On each use (rotated + old invalidated) |
| Blacklist | jti stored in Redis until expiry | jti stored in Redis until expiry |

### JWT Payload Structure

```typescript
interface JWTPayload {
  sub: string;        // userId (UUID)
  orgId: string;      // organizationId (UUID)
  workspaceId: string; // workspaceId (UUID)
  role: Role;          // ADMIN_ORG | DEVELOPER | BUSINESS_USER | VIEWER
  jti: string;        // unique token ID (UUID v4)
  iat: number;        // issued at (epoch seconds)
  exp: number;        // expires at (epoch seconds)
}
```

### Validation Flow
1. Verify signature with `JWT_ACCESS_SECRET`
2. Check `exp` — reject if expired
3. Check `jti` against Redis blacklist — reject if blacklisted
4. Extract `sub`, `orgId`, `workspaceId`, `role` — attach to request context
5. For refresh: verify refresh token, rotate (issue new pair), blacklist old `jti`

### Password Policy
- Minimum 12 characters, at least one uppercase, one lowercase, one digit, one special character
- Hashed with bcrypt, cost factor 12
- Never stored in plain text
- Rate limited: 5 attempts per IP per minute, 10 per user per hour
- Account lockout after 10 failed attempts for 30 minutes

### Magic Links
- Single-use, expires in 15 minutes
- Signed with `JWT_ACCESS_SECRET`, contains `sub` + `jti` + `purpose: "magic-link"`
- On use: invalidate immediately, authenticate user, issue full JWT pair

### Session Management
- Logout invalidates all tokens for user (adds all `jti` to blacklist)
- Password change invalidates all sessions
- Maximum 10 concurrent sessions per user

---

## 2. Authorization (RBAC)

### Roles & Permissions Matrix

| Permission | ADMIN_ORG | DEVELOPER | BUSINESS_USER | VIEWER |
|---|---|---|---|---|
| Manage organization settings | ✅ | ❌ | ❌ | ❌ |
| Manage workspace | ✅ | ✅ | ❌ | ❌ |
| Create/Edit workflows | ✅ | ✅ | ❌ | ❌ |
| Execute workflows | ✅ | ✅ | ✅ | ❌ |
| View workflow results | ✅ | ✅ | ✅ | ✅ |
| Manage connectors | ✅ | ✅ | ❌ | ❌ |
| Manage API keys | ✅ | ✅ | ❌ | ❌ |
| Manage team members | ✅ | ❌ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ✅ | ✅ |
| View audit logs | ✅ | ✅ | ❌ | ❌ |

### Enforcement
- **Every** API endpoint validates authorization server-side
- Middleware extracts role from JWT and checks permission matrix
- Multi-tenancy isolation: user can only access resources within their `orgId` and `workspaceId`
- All permission checks are logged for audit

---

## 3. Data Protection

### Encryption at Rest
- **User secrets** (variable values marked as `secret`): AES-256-GCM with 96-bit IV
- Encryption key stored in `ENCRYPTION_KEY` env var (64 hex chars = 256 bits)
- Each secret encrypted with unique random IV, stored as `iv:ciphertext:authTag` (hex)
- Encryption key rotated every 90 days

### Encryption in Transit
- TLS 1.3 minimum (TLS 1.2 disabled)
- HSTS: `max-age=63072000; includeSubDomains; preload`
- Certificates via Let's Encrypt with auto-renewal

### PII Handling
- **Identified PII**: email, name, IP address, user agent
- PII is encrypted at rest using the same AES-256-GCM scheme
- PII fields are tagged in the database schema with `@pii` doc comment
- PII is never logged (see Logging section)
- PII is excluded from analytics exports by default

### Data Retention
| Data Type | Retention | Action After |
|---|---|---|
| User accounts | Until deletion request | Anonymized after 30 days |
| Workflow executions | 90 days | Deleted |
| Execution logs | 90 days | Deleted |
| Audit logs | 365 days | Aggregated & anonymized |
| API key usage logs | 90 days | Deleted |
| Webhook payloads | 30 days | Deleted |
| Session tokens | Until expiry | Auto-deleted from Redis |

### Backup Security
- Daily encrypted backups (AES-256-GCM)
- Backup encryption key separate from application key
- Backups retained for 30 days
- Monthly restore test required

---

## 4. HTTP Security Headers

Implemented in `next.config.js`:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.openai.com https://api.anthropic.com wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```

---

## 5. Rate Limiting

### Limits (sliding window via Redis)

| Endpoint Group | Window | Max Requests | Key |
|---|---|---|---|
| Auth (login, register, magic-link) | 1 minute | 5 | `rl:auth:{ip}` |
| Auth (refresh, logout) | 1 minute | 20 | `rl:auth:{userId}` |
| API — Read (GET) | 1 minute | 100 | `rl:api:{userId}:read` |
| API — Write (POST/PUT/PATCH/DELETE) | 1 minute | 30 | `rl:api:{userId}:write` |
| Webhooks (inbound) | 1 minute | 200 | `rl:webhook:{sourceId}` |
| AI Copilot (chat) | 1 minute | 20 | `rl:ai:{userId}` |
| API Key (per key) | 1 minute | 100 | `rl:apikey:{keyPrefix}` |

### Response
- Status: `429 Too Many Requests`
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`
- Body: `{ "error": "RATE_LIMITED", "message": "Too many requests. Try again in X seconds.", "retryAfter": X }`

---

## 6. CORS Policy

```typescript
{
  origin: [/* whitelist from CORS_ORIGINS env var */],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Api-Key"],
  exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
  credentials: true,
  maxAge: 86400,
}
```

- Strict whitelist in `CORS_ORIGINS` env var (comma-separated)
- Never use `origin: "*"` with credentials
- WebSocket connections validated against same origin policy

---

## 7. Input Validation & Injection Prevention

### SQL Injection
- **Always** use Drizzle ORM prepared statements — never raw SQL with string interpolation
- Drizzle parameterized queries: `db.select().from(users).where(eq(users.email, email))`
- Raw SQL only via Drizzle's `sql` template literal tag (escaped)
- Database user has minimum required privileges (no `DROP`, `CREATE`, `ALTER`)

### Input Validation
- All inputs validated server-side with Zod schemas
- HTML stripped from text inputs (sanitize before storage)
- Strict type checking for all parameters (UUID format, ISO dates, enum values)
- Maximum input sizes enforced (e.g., workflow name: 100 chars, description: 2000 chars)

---

## 8. XSS Prevention

- React's built-in output escaping (default behavior)
- CSP header restricts script sources to `'self'` — no inline scripts without nonce
- `dangerouslySetInnerHTML` is banned — use DOMPurify if HTML rendering is absolutely required
- All user-generated content is escaped on output
- Cookies are `HttpOnly` + `Secure` + `SameSite=Strict`

---

## 9. CSRF Prevention

- All cookies use `SameSite=Strict` (or `Lax` for GET-safety)
- API endpoints that mutate state require custom header (`X-CSRF-Token` or `Content-Type: application/json`)
- Origin/Referer header validation on sensitive endpoints
- No CSRF-only endpoints — mutations require either a non-idempotent method (POST/PUT/DELETE) or a custom header

---

## 10. Webhook Security

### Inbound Webhooks
- **HMAC verification**: Each connector (Slack, Gmail, custom HTTP) signs payloads with a secret
- **Token-based URL**: Each webhook URL contains a unique, unpredictable token: `https://app.flowmind.ai/api/webhooks/slack/{token}`
- **Payload size limit**: 256 KB per payload
- **Timeout**: 10 seconds for acknowledgment (202) — async processing via BullMQ queue
- **IP allowlisting**: Documentation recommends customers whitelist FlowMind IPs
- **Replay protection**: Webhook ID (`X-Webhook-Id`) tracked in Redis for 24h to prevent replay

### Outbound Webhooks (user-configured)
- **Signing**: Each outbound webhook signed with HMAC-SHA256 (user's webhook secret)
- **Retry**: Exponential backoff (1s, 2s, 4s, 8s, 16s, max 5 attempts)
- **Timeout**: 30 seconds per request
- **TLS only**: Never sent over HTTP

---

## 11. API Key Management

### Key Generation
```
Format: fm_[prefix]_[random]
Example: fm_prod_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
- Prefix: 4-8 char human-readable label (e.g., "prod", "dev", "staging")
- Random: 48 bytes (384 bits) of cryptographically secure random data, base62-encoded
- Stored hash: SHA-256 hash of the full key (never store the raw key)
```

### Scopes
| Scope | Permissions |
|---|---|
| `read` | Read workflows, executions, variables |
| `write` | Read + Create/Edit/Delete workflows and variables |
| `admin` | Read + Write + Manage team members, connectors, API keys |

### Key Lifecycle
- **Create**: Generate key, return raw key once, store SHA-256 hash
- **Revoke**: Immediately invalidated, rate limit block enforced from Redis
- **Rotate**: Old key revoked, new key generated
- **Usage tracking**: Every request logged with key prefix, timestamp, endpoint, IP

---

## 12. WebSocket Security

- Connections authenticated via JWT in the `auth` handshake payload
- Connection per user scoped to their `orgId` and `workspaceId`
- No cross-organization message broadcasting
- Rate limit: 100 messages per minute per connection
- Heartbeat: ping/pong every 25 seconds, timeout after 60 seconds
- Max payload: 128 KB per message

---

## 13. AI Copilot Security

- OpenAI/Anthropic API calls routed server-side — never from the browser
- API keys stored in `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` env vars (never exposed to client)
- User data in prompts is scoped: only the current workflow definition and context are sent
- Prompt injection prevention: system prompt includes guardrails, user input is clearly delimited
- Rate limited separately: 20 requests per minute per user
- PII stripping: email addresses, phone numbers, and API keys are redacted from prompts before sending
- Response validation: structured responses parsed with Zod before returning to client

---

## 14. Logging & Monitoring

### What We Log
- Authentication events (login, logout, failed attempts, token refresh)
- Authorization failures (permission denied)
- Mutations (create, update, delete) with resource type, ID, and action
- Rate limit violations
- API key usage (prefix only, never full key)
- Webhook receipts (source, status, duration)

### What We NEVER Log
- Passwords or password hashes
- JWT tokens or refresh tokens
- Full API keys (log prefix only)
- PII (email, name, IP) — IP may be logged for security events with explicit justification
- Encryption keys
- Secret variable values

### Log Format (structured JSON via pino)
```typescript
{
  timestamp: "2026-07-11T10:30:00.000Z",
  level: "info",
  event: "user.login.success",
  userId: "usr_abc123",
  orgId: "org_xyz789",
  ip: "***.***.***.***",  // masked
  requestId: "req_uuid",
  duration: 145
}
```

### Monitoring
- Sentry for error tracking (PII stripping enabled)
- Alerts on: spike in 401/403/429 errors, suspicious login patterns, failed webhook deliveries
- Weekly security log review

---

## 15. Dependency Security

### Automated Checks
- **npm audit** runs on every `npm install` and in CI
- **Dependabot** enabled for security updates (weekly)
- **Snyk** (optional) for advanced vulnerability scanning
- **SBOM** generated with `npm sbom` or `cyclonedx-npm`

### Policy
- `npm audit` failures with severity `critical` or `high` block CI
- Dependencies pinned to exact versions in `package.json`
- `package-lock.json` / `pnpm-lock.yaml` committed to repository
- Monthly full dependency audit

---

## 16. Secrets Management

### Environment Variables
- `.env` files never committed to repository
- `.env*.local` in `.gitignore`
- Production secrets stored in GitHub Actions secrets or vault
- Secrets encrypted at rest (see Data Protection)
- Encryption key stored separately from application code

### Key Rotation
| Secret | Rotation Period |
|---|---|
| `JWT_ACCESS_SECRET` | Every 90 days |
| `JWT_REFRESH_SECRET` | Every 90 days |
| `ENCRYPTION_KEY` | Every 90 days |
| Database password | Every 180 days |
| Redis password | Every 180 days |

---

## 17. Incident Response

### Severity Levels
| Level | Definition | Response Time |
|---|---|---|
| **CRITICAL** | Data breach, service outage, unauthorized access | < 1 hour |
| **HIGH** | Security vulnerability in production, auth bypass | < 4 hours |
| **MEDIUM** | XSS/CSRF in non-critical path, dependency vuln | < 24 hours |
| **LOW** | Missing header, info leak, best practice gap | < 7 days |

### Response Steps
1. **Identify** — detect via monitoring or user report
2. **Contain** — disable affected service, revoke tokens, block IPs
3. **Investigate** — review audit logs, determine scope
4. **Remediate** — fix vulnerability, rotate affected secrets
5. **Communicate** — notify affected users (if data involved)
6. **Post-mortem** — root cause analysis, prevent recurrence

### Contact
- **Security team**: security@flowmind.ai
- **Bug bounty**: https://flowmind.ai/security.txt
- **PGP key**: Available at `/.well-known/security.txt`

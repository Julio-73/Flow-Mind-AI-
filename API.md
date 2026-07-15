# FlowMind AI — API Documentation

## Overview

FlowMind exposes two API surfaces:

1. **tRPC** (`/api/trpc`) — Primary API for the web app. Type-safe, Zod-validated, superjson-serialized.
2. **REST** — Auth endpoints (`/api/auth/*`), webhooks (`/api/webhooks/*`), health check (`/api/health`).

---

## tRPC Routers

All tRPC procedures require authentication unless marked as `public`. Auth is handled via JWT in `HttpOnly` cookies.

### flows

```typescript
router = {
  list:         .query(input: { workspaceId, page?, pageSize?, search?, tags?, status? })      → PaginatedResult<Flow>
  getById:      .query(input: { id })                                                          → Flow
  create:       .mutation(input: { workspaceId, name, description?, nodes?, edges?, triggerType,
                                   triggerConfig? })                                            → Flow
  update:       .mutation(input: { id, name?, description?, nodes?, edges?, triggerType?,
                                   triggerConfig?, isActive?, isDraft? })                       → Flow
  delete:       .mutation(input: { id })                                                        → { success: boolean }
  duplicate:    .mutation(input: { id, name? })                                                 → Flow
  toggleActive: .mutation(input: { id, isActive })                                              → Flow
  export:       .query(input: { id })                                                           → { nodes, edges, triggerType, triggerConfig }
  import:       .mutation(input: { workspaceId, data: { nodes, edges, triggerType, triggerConfig },
                                   name? })                                                     → Flow
}
```

**Errors**: `NOT_FOUND`, `VALIDATION_ERROR`, `FORBIDDEN`

### executions

```typescript
router = {
  list:        .query(input: { flowId?, workspaceId?, status?, page?, pageSize?,
                                from?, to? })                                                    → PaginatedResult<Execution>
  getById:     .query(input: { id })                                                            → Execution
  getSteps:    .query(input: { executionId })                                                    → ExecutionStep[]
  run:         .mutation(input: { flowId, triggerData? })                                        → Execution
  cancel:      .mutation(input: { id })                                                          → Execution
  retry:       .mutation(input: { id, fromNodeId? })                                             → Execution
  getStats:    .query(input: { workspaceId, period?: "24h" | "7d" | "30d" })                     → ExecutionStats
}
```

**Errors**: `NOT_FOUND`, `FLOW_EXECUTION_ERROR`, `VALIDATION_ERROR`

### connectors

```typescript
router = {
  listAvailable: .query(input: void)                                                             → Connector[]
  getById:       .query(input: { id })                                                           → Connector
  listInstalled: .query(input: { organizationId })                                               → InstalledConnector[]
  install:       .mutation(input: { organizationId, connectorId, label, config })                 → InstalledConnector
  updateConfig:  .mutation(input: { id, config })                                                → InstalledConnector
  test:          .mutation(input: { id })                                                         → { success: boolean, error?: string }
  uninstall:     .mutation(input: { id })                                                         → { success: boolean }
}
```

**Errors**: `NOT_FOUND`, `CONNECTOR_ERROR`, `VALIDATION_ERROR`

### templates

```typescript
router = {
  list:       .query(input: { category?, search?, page?, pageSize? })                          → PaginatedResult<Template>
  getById:    .query(input: { id })                                                            → Template
  install:    .mutation(input: { templateId, workspaceId, name? })                              → Flow
  create:     .mutation(input: { name, description, category, icon, flowData,
                                 requiredConnectors? })                                          → Template
  votePopular:.mutation(input: { id })                                                          → { popularity: number }
}
```

**Errors**: `NOT_FOUND`, `VALIDATION_ERROR`

### variables

```typescript
router = {
  list:         .query(input: { workspaceId, type?, search?, page?, pageSize? })                → PaginatedResult<Variable>
  getById:      .query(input: { id })                                                           → Variable
  create:       .mutation(input: { workspaceId, key, value, type?, description?, isSecret? })    → Variable
  update:       .mutation(input: { id, value?, type?, description?, isSecret? })                 → Variable
  delete:       .mutation(input: { id })                                                         → { success: boolean }
  getAuditLog:  .query(input: { variableId })                                                    → VariableAuditLog[]
}
```

**Secret variables**: `value` is encrypted with AES-256-GCM before storage. `value` is never returned in read responses — only `[REDACTED]`.

**Errors**: `NOT_FOUND`, `VALIDATION_ERROR`, `FORBIDDEN`

### notifications

```typescript
router = {
  list:       .query(input: { organizationId, page?, pageSize?, unreadOnly? })                 → PaginatedResult<Notification>
  markRead:   .mutation(input: { id })                                                          → Notification
  markAllRead:.mutation(input: { organizationId })                                               → { success: boolean }
  getUnread:  .query(input: { organizationId })                                                  → { count: number }
}
```

**Errors**: `NOT_FOUND`

### users

```typescript
router = {
  me:             .query(input: void)                                                           → User
  updateProfile:  .mutation(input: { name?, avatarUrl? })                                       → User
  getMembers:     .query(input: { organizationId })                                              → OrganizationMember[]
  removeMember:   .mutation(input: { organizationId, userId })                                   → { success: boolean }
  changeRole:     .mutation(input: { organizationId, userId, role })                             → OrganizationMember
  invite:         .mutation(input: { organizationId, email, role? })                             → Invitation
  listInvitations:.query(input: { organizationId })                                              → Invitation[]
  revokeInvite:   .mutation(input: { id })                                                       → { success: boolean }
}
```

**Errors**: `NOT_FOUND`, `VALIDATION_ERROR`, `FORBIDDEN`, `CONFLICT`

### workspaces

```typescript
router = {
  list:            .query(input: { organizationId })                                             → Workspace[]
  getById:         .query(input: { id })                                                        → Workspace
  create:          .mutation(input: { organizationId, name })                                    → Workspace
  update:          .mutation(input: { id, name })                                                → Workspace
  delete:          .mutation(input: { id })                                                      → { success: boolean }
  getMembers:      .query(input: { workspaceId })                                                → WorkspaceMember[]
  addMember:       .mutation(input: { workspaceId, userId, role? })                              → WorkspaceMember
  removeMember:    .mutation(input: { workspaceId, userId })                                     → { success: boolean }
  changeMemberRole:.mutation(input: { workspaceId, userId, role })                               → WorkspaceMember
}
```

**Errors**: `NOT_FOUND`, `VALIDATION_ERROR`, `FORBIDDEN`

### settings

```typescript
router = {
  getOrganization:   .query(input: { organizationId })                                           → Organization
  updateOrganization:.mutation(input: { organizationId, name?, slug?, logoUrl?, features? })     → Organization
  getApiKeys:        .query(input: { organizationId })                                           → ApiKeyRecord[]
  createApiKey:      .mutation(input: { organizationId, name, prefix, scope,
                                         expiresInDays? })                                       → { id, rawKey, keyPrefix }
  revokeApiKey:      .mutation(input: { id })                                                    → { success: boolean }
  getUsageStats:     .query(input: { organizationId, period?: "7d" | "30d" | "90d" })            → UsageStats
}
```

**Important**: `createApiKey` returns `rawKey` only once. Store it immediately — it cannot be retrieved again.

**Errors**: `NOT_FOUND`, `VALIDATION_ERROR`, `FORBIDDEN`

### ai

```typescript
router = {
  generateFlow: .mutation(input: { action: CopilotAction, systemPrompt, userPrompt, context? })  → CopilotResponse
  optimizeFlow: .mutation(input: { flowId })                                                     → OptimizationSuggestion[]
  explainFlow:  .mutation(input: { flowId })                                                     → { explanation: string }
  debugFlow:    .mutation(input: { flowId, error? })                                             → { diagnosis: string, fix?: string }
  getUsage:     .query(input: { organizationId, period?: "7d" | "30d" })                         → AIUsageStats
}
```

`CopilotAction`: `"generate_flow" | "optimize_flow" | "explain_flow" | "debug_flow"`

**Rate limited**: 20 requests per minute per user.

**Errors**: `RATE_LIMIT`, `VALIDATION_ERROR`, `AI_ERROR`

### search

```typescript
router = {
  search: .query(input: { workspaceId, query, type?: "flows" | "templates" | "connectors"
                           | "all", limit? })                                                    → SearchResults
}
```

Searches across flows (by name, description, tags), templates, and connectors. Full-text search via PostgreSQL.

---

## REST Endpoints

### Auth

#### POST /api/auth/register

```typescript
Input:  { email: string, name: string, password: string }
Output: { user: User, organization: Organization, workspace: Workspace }
Status: 201
Errors: VALIDATION_ERROR, CONFLICT (email exists)
Rate limit: 5/min per IP
```

#### POST /api/auth/login

```typescript
Input:  { email: string, password: string }
Output: { user: User }
Status: 200
Cookies: Set-Cookie (access_token + refresh_token, HttpOnly, Secure, SameSite=Strict)
Errors: AUTH_ERROR (invalid credentials), RATE_LIMIT
Rate limit: 5/min per IP, 10/min per user
```

#### POST /api/auth/magic-link

```typescript
Input:  { email: string }
Output: { message: "If the email exists, a magic link has been sent" }
Status: 200 (always the same response to prevent email enumeration)
Rate limit: 3/min per email
```

#### POST /api/auth/refresh

```typescript
Input:  (cookie: refresh_token)
Output: { user: User }
Cookies: Set-Cookie (rotated access + refresh tokens)
Errors: AUTH_ERROR (expired/blacklisted)
```

### Webhooks

#### POST /api/webhooks/slack/:token

Accepts Slack Events API payloads. Validates via `SLACK_SIGNING_SECRET`.

```typescript
Input:  Slack event payload (JSON)
Output: { received: true }
Status: 202 (async processing)
Headers: X-Slack-Signature, X-Slack-Request-Timestamp
Errors: 401 (invalid signature), 413 (payload too large)
```

#### POST /api/webhooks/gmail/:token

Accepts Google Pub/Sub push notifications for Gmail.

```typescript
Input:  Google Pub/Sub push payload (JSON with base64-encoded data)
Output: { received: true }
Status: 202
Errors: 401 (invalid token), 413 (payload too large)
```

#### POST /api/webhooks/generic/:token

Generic HTTPS webhook for custom integrations.

```typescript
Input:  Any JSON payload
Output: { received: true }
Status: 202
Headers: X-Webhook-Signature (HMAC-SHA256), X-Webhook-Timestamp, X-Webhook-Id
Errors: 401 (invalid signature), 413 (payload too large)
```

### Health Check

#### GET /api/health

```typescript
Output: {
  status: "ok" | "degraded" | "down",
  version: string,
  uptime: number,
  checks: {
    database: { status: "ok" | "error", latencyMs: number },
    redis:    { status: "ok" | "error", latencyMs: number },
    ai:       { configured: boolean, provider: string | null }
  },
  timestamp: string
}
Status: 200 (ok), 503 (degraded/down)
```

---

## Rate Limiting

| Endpoint Group | Window | Max Requests | Key |
|---|---|---|---|
| Auth (login, register, magic-link) | 1 min | 5 | `rl:auth:{ip}` |
| Auth (refresh, logout) | 1 min | 20 | `rl:auth:{userId}` |
| tRPC — Read (query) | 1 min | 100 | `rl:api:{userId}:read` |
| tRPC — Write (mutation) | 1 min | 30 | `rl:api:{userId}:write` |
| Webhooks (inbound) | 1 min | 200 | `rl:webhook:{sourceId}` |
| AI Copilot | 1 min | 20 | `rl:ai:{userId}` |
| API Key (per key) | 1 min | 100 | `rl:apikey:{keyPrefix}` |

**Response when limited**:

```
Status: 429 Too Many Requests
Headers:
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset: 1689087600
  Retry-After: 45

Body:
{
  "error": "RATE_LIMITED",
  "message": "Too many requests. Try again in 45 seconds.",
  "retryAfter": 45
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Zod validation failed |
| `AUTH_ERROR` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions (RBAC) |
| `RATE_LIMIT` | 429 | Rate limit exceeded |
| `CONFLICT` | 409 | Resource already exists |
| `CONNECTOR_ERROR` | 502 | External connector failed |
| `FLOW_EXECUTION_ERROR` | 500 | Flow execution failed |
| `AI_ERROR` | 502 | AI provider returned an error |

All errors follow the format:

```typescript
{
  error: string,      // Machine-readable error code
  message: string,    // Human-readable description
  details?: object    // Optional additional context (field errors, etc.)
}
```

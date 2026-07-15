# FlowMind AI — Database Documentation

**Database**: PostgreSQL 16  
**ORM**: Drizzle ORM 0.30  
**Migration Tool**: drizzle-kit 0.21

---

## Entity-Relationship Diagram

```
┌─────────────────┐       ┌──────────────────────┐
│   organizations  │1──N──│  organization_members  │
│                  │       │                       │
│ id (PK)          │       │ id (PK)               │
│ name             │       │ userId (FK)           │
│ slug (UQ)        │       │ organizationId (FK)   │
│ logoUrl          │       │ role (enum)           │
│ ownerId          │       │ joinedAt              │
│ maxSeats         │  N──1 │                       │
│ features (JSONB) │       └──────────────────────┘
│ createdAt        │                │
│ updatedAt        │                │ 1
└────────┬────────┘                │
         │ 1                       │
         │                         │
         │ 1──N  ┌───────────────┐ │
         ├───────│  workspaces   │ │
         │       │               │ │
         │       │ id (PK)       │ │
         │       │ name          │ │
         │       │ organizationId│ │
         │       │ createdBy     │ │
         │       │ createdAt     │ │
         │       │ updatedAt     │ │
         │       └───────┬───────┘ │
         │               │ 1       │
         │               │         │
         │               │ 1──N  ┌──────────────────────┐
         │               ├───────│  workspace_members   │
         │               │       │                      │
         │               │       │ id (PK)              │
         │               │       │ userId (FK)          │
         │               │       │ workspaceId (FK)     │
         │               │       │ role (enum)          │
         │               │       │ joinedAt             │
         │               │       └──────────────────────┘
         │               │
         │     ┌─────────┼──────────┐
         │     │         │          │
         │     ▼         ▼          ▼
         │  ┌──────┐ ┌────────┐ ┌──────────┐
         │  │flows │ │variables││installed │
         │  │      │ │        │ │connectors│
         │  │      │ │        │ └──────────┘
         │  └──┬───┘ └────────┘
         │     │ 1
         │     │
         │  ┌──┼──────────────┐
         │  │  │              │
         │  ▼  ▼              ▼
         │  ┌──────────┐  ┌───────────┐
         │  │executions│  │ schedules │
         │  │          │  │           │
         │  └────┬─────┘  └───────────┘
         │       │ 1
         │       │
         │       ▼
         │  ┌────────────────┐
         │  │ execution_steps │
         │  │                 │
         │  └────────────────┘
         │
         │  ┌────────────────┐
         │  │ flow_versions  │
         │  │                │
         │  └────────────────┘
         │
         │  ┌──────────────────┐
         │  │   templates      │
         │  └──────────────────┘
         │
         │  ┌─────────────────┐
         │  │  activity_log   │
         │  └─────────────────┘
         │
         │  ┌─────────────────┐
         │  │ notifications   │
         │  └─────────────────┘
         │
         │  ┌──────────────────┐
         │  │  ai_suggestions  │
         │  └──────────────────┘
         │
         │  ┌───────────────┐  ┌─────────────┐
         │  │  invitations  │  │ connectors  │
         │  └───────────────┘  └─────────────┘
         │
    ┌────┴────┐
    │  users  │
    │         │
    │ id (PK) │────┐
    │ email   │    │
    │ name    │    │
    │ pwdHash │    │
    │ avatar  │    │
    │ isActive│    │
    │ lastLogin│   │
    └─────────┘    │
                   │
      ┌────────────┴───────────┐
      │                        │
      ▼                        ▼
┌──────────────┐      ┌───────────────┐
│ notifications │      │ variable_     │
│ (userId FK)   │      │ audit_log     │
└──────────────┘      │ (changedBy FK)│
                      └───────────────┘
```

---

## Tables

### organizations

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | `org_` prefix, nanoid |
| name | `text` | NOT NULL | Organization name |
| slug | `text` | NOT NULL, UNIQUE | URL-friendly identifier |
| logoUrl | `text` | | Organization logo |
| ownerId | `text` | NOT NULL | User ID who owns the org |
| maxSeats | `integer` | NOT NULL, DEFAULT 10 | Maximum member count |
| features | `jsonb` | NOT NULL, DEFAULT `{}` | Feature flags |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |
| updatedAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

**Indexes**: `unique` on `slug`, `index` on `ownerId`

### users

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | `usr_` prefix, nanoid |
| email | `text` | NOT NULL, UNIQUE | User email (PII, encrypted at rest) |
| name | `text` | NOT NULL | Display name (PII) |
| passwordHash | `text` | NOT NULL | bcrypt hash (cost factor 12) |
| avatarUrl | `text` | | Avatar image URL |
| isActive | `boolean` | NOT NULL, DEFAULT true | Account active flag |
| lastLoginAt | `timestamp with tz` | | Last successful login |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |
| updatedAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

**Indexes**: `unique` on `email`

### organization_members

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | nanoid |
| userId | `text` | NOT NULL, FK → users.id ON DELETE CASCADE | |
| organizationId | `text` | NOT NULL, FK → organizations.id ON DELETE CASCADE | |
| role | `text` | NOT NULL, DEFAULT `VIEWER` | Enum: ADMIN_ORG, DEVELOPER, BUSINESS_USER, VIEWER |
| joinedAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

**Indexes**: `unique` on `(userId, organizationId)`

### workspaces

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | `ws_` prefix, nanoid |
| name | `text` | NOT NULL | Workspace name |
| organizationId | `text` | NOT NULL, FK → organizations.id ON DELETE CASCADE | |
| createdBy | `text` | NOT NULL | User ID who created it |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |
| updatedAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

**Indexes**: `index` on `organizationId`

### workspace_members

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | nanoid |
| userId | `text` | NOT NULL, FK → users.id ON DELETE CASCADE | |
| workspaceId | `text` | NOT NULL, FK → workspaces.id ON DELETE CASCADE | |
| role | `text` | NOT NULL, DEFAULT `VIEWER` | Per-workspace role override |
| joinedAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

**Indexes**: `unique` on `(userId, workspaceId)`

### flows

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | `flw_` prefix, nanoid |
| name | `text` | NOT NULL | Flow name (max 100 chars) |
| description | `text` | | Flow description |
| workspaceId | `text` | NOT NULL, FK → workspaces.id ON DELETE CASCADE | |
| organizationId | `text` | NOT NULL, FK → organizations.id ON DELETE CASCADE | |
| createdBy | `text` | NOT NULL | User ID who created |
| nodes | `jsonb` | NOT NULL, DEFAULT `[]` | Array of node objects |
| edges | `jsonb` | NOT NULL, DEFAULT `[]` | Array of edge objects |
| triggerType | `text` | NOT NULL | SCHEDULE, WEBHOOK, SLACK, GMAIL, MANUAL, FORM, DATABASE |
| triggerConfig | `jsonb` | NOT NULL, DEFAULT `{}` | Trigger-specific configuration |
| isActive | `boolean` | NOT NULL, DEFAULT false | Whether flow is actively listening |
| isDraft | `boolean` | NOT NULL, DEFAULT true | Draft vs published |
| version | `integer` | NOT NULL, DEFAULT 1 | Current version number |
| tags | `jsonb` | NOT NULL, DEFAULT `[]` | Tag array for organization |
| lastRunAt | `timestamp with tz` | | Last execution timestamp |
| lastRunStatus | `text` | | Last execution status |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |
| updatedAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

**Indexes**:
- `idx_flows_workspace ON flows(workspace_id)`
- `idx_flows_org_trigger ON flows(organization_id, trigger_type)`
- `idx_flows_active ON flows(organization_id, is_active)`

### executions

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | `exec_` prefix, nanoid |
| flowId | `text` | NOT NULL, FK → flows.id ON DELETE CASCADE | |
| workspaceId | `text` | NOT NULL, FK → workspaces.id ON DELETE CASCADE | |
| organizationId | `text` | NOT NULL, FK → organizations.id ON DELETE CASCADE | |
| triggeredBy | `text` | | User ID or `system` or `webhook` |
| status | `text` | NOT NULL, DEFAULT `PENDING` | PENDING, RUNNING, PAUSED, SUCCESS, FAILED, CANCELLED, TIMED_OUT, RETRYING |
| triggerData | `jsonb` | | Data that triggered the flow |
| error | `text` | | Error message if failed |
| durationMs | `text` | | Total execution duration |
| startedAt | `timestamp with tz` | | Execution start |
| completedAt | `timestamp with tz` | | Execution completion |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |
| updatedAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

**Indexes**:
- `idx_executions_flow_status ON executions(flow_id, status)`
- `idx_executions_org_status ON executions(organization_id, status)`
- `idx_executions_started ON executions(started_at DESC)`

### execution_steps

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | nanoid |
| executionId | `text` | NOT NULL, FK → executions.id ON DELETE CASCADE | |
| nodeId | `text` | NOT NULL | Node ID from the flow definition |
| status | `text` | NOT NULL, DEFAULT `PENDING` | PENDING, RUNNING, SUCCESS, FAILED, SKIPPED |
| input | `jsonb` | NOT NULL, DEFAULT `{}` | Resolved input variables |
| output | `jsonb` | | Node execution output |
| error | `text` | | Error if failed |
| attempt | `integer` | NOT NULL, DEFAULT 1 | Retry attempt number |
| durationMs | `integer` | | Node execution duration |
| startedAt | `timestamp with tz` | | |
| completedAt | `timestamp with tz` | | |

**Indexes**: `idx_execution_steps_execution ON execution_steps(execution_id)`

### schedules

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | nanoid |
| flowId | `text` | NOT NULL, FK → flows.id ON DELETE CASCADE | |
| cronExpression | `text` | NOT NULL | Standard cron expression |
| timezone | `text` | NOT NULL, DEFAULT `UTC` | IANA timezone |
| config | `jsonb` | NOT NULL, DEFAULT `{}` | Additional schedule config |
| isActive | `boolean` | NOT NULL, DEFAULT true | Schedule active flag |
| lastRunAt | `timestamp with tz` | | Last scheduled execution |
| nextRunAt | `timestamp with tz` | | Next scheduled execution |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |
| updatedAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

**Indexes**: `idx_schedules_next_run ON schedules(next_run_at) WHERE is_active = true`

### variables

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | `var_` prefix, nanoid |
| workspaceId | `text` | NOT NULL, FK → workspaces.id ON DELETE CASCADE | |
| organizationId | `text` | NOT NULL, FK → organizations.id ON DELETE CASCADE | |
| key | `text` | NOT NULL | Variable name (uppercase, snake_case) |
| value | `jsonb` | NOT NULL | Value (string, number, boolean, JSON, or encrypted string for secrets) |
| type | `text` | NOT NULL, DEFAULT `string` | string, number, boolean, json, secret |
| description | `text` | | Human-readable description |
| isSecret | `boolean` | NOT NULL, DEFAULT false | If true, value is AES-256-GCM encrypted |
| createdBy | `text` | NOT NULL | |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |
| updatedAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

**Indexes**: `idx_variables_workspace_key ON variables(workspace_id, key)`

**Security**: When `isSecret = true`, the `value` is encrypted with AES-256-GCM before storage. The raw value is never returned via API — only `[REDACTED]` is shown.

### variable_audit_log

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | nanoid |
| variableId | `text` | NOT NULL, FK → variables.id ON DELETE CASCADE | |
| action | `text` | NOT NULL | created, updated, deleted |
| oldValue | `jsonb` | | Previous value (encrypted if secret) |
| newValue | `jsonb` | | New value (encrypted if secret) |
| changedBy | `text` | NOT NULL, FK → users.id ON DELETE CASCADE | |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

### connectors

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | System-defined connector ID |
| type | `text` | NOT NULL, UNIQUE | slack, gmail, http, etc. |
| name | `text` | NOT NULL | Display name |
| description | `text` | NOT NULL | Connector description |
| icon | `text` | NOT NULL | Icon identifier |
| authType | `text` | NOT NULL | oauth2, api_key, basic, none |
| triggers | `jsonb` | NOT NULL, DEFAULT `[]` | Array of trigger definitions |
| actions | `jsonb` | NOT NULL, DEFAULT `[]` | Array of action definitions |
| configSchema | `jsonb` | NOT NULL, DEFAULT `{}` | JSON Schema for configuration |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |
| updatedAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

### installed_connectors

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | nanoid |
| organizationId | `text` | NOT NULL, FK → organizations.id ON DELETE CASCADE | |
| connectorId | `text` | NOT NULL, FK → connectors.id ON DELETE CASCADE | |
| label | `text` | NOT NULL | User-defined label (e.g., "Production Slack") |
| config | `jsonb` | NOT NULL, DEFAULT `{}` | Encrypted connector-specific config |
| isEnabled | `boolean` | NOT NULL, DEFAULT true | |
| lastTestedAt | `timestamp with tz` | | Last connection test |
| lastTestSuccess | `boolean` | | Result of last test |
| createdBy | `text` | NOT NULL | |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |
| updatedAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

### templates

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | nanoid |
| name | `text` | NOT NULL | Template name |
| description | `text` | NOT NULL | Template description |
| category | `text` | NOT NULL | Customer Support, Data Processing, Marketing, DevOps, Finance, HR, Sales, AI/ML |
| icon | `text` | NOT NULL | Icon identifier |
| flowData | `jsonb` | NOT NULL | Complete flow definition (nodes + edges) |
| requiredConnectors | `jsonb` | NOT NULL, DEFAULT `[]` | Connectors needed |
| popularity | `integer` | NOT NULL, DEFAULT 0 | Installation count |
| isOfficial | `boolean` | NOT NULL, DEFAULT false | FlowMind-official template |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |
| updatedAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

### notifications

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | nanoid |
| userId | `text` | NOT NULL, FK → users.id ON DELETE CASCADE | |
| organizationId | `text` | NOT NULL, FK → organizations.id ON DELETE CASCADE | |
| type | `text` | NOT NULL | execution_success, execution_failed, invite, alert |
| title | `text` | NOT NULL | Notification title |
| body | `text` | NOT NULL | Notification body |
| data | `jsonb` | | Additional context (execution ID, etc.) |
| isRead | `boolean` | NOT NULL, DEFAULT false | |
| readAt | `timestamp with tz` | | |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

**Indexes**: `idx_notifications_user_read ON notifications(user_id, is_read)`

### activity_log

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | nanoid |
| organizationId | `text` | NOT NULL, FK → organizations.id ON DELETE CASCADE | |
| userId | `text` | NOT NULL, FK → users.id ON DELETE CASCADE | |
| action | `text` | NOT NULL | flow.created, flow.deleted, connector.installed, etc. |
| entityType | `text` | NOT NULL | flow, execution, connector, variable, workspace, user |
| entityId | `text` | | ID of the affected resource |
| metadata | `jsonb` | | Additional context |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

**Indexes**: `idx_activity_log_org ON activity_log(organization_id, created_at DESC)`

### flow_versions

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | nanoid |
| flowId | `text` | NOT NULL, FK → flows.id ON DELETE CASCADE | |
| version | `integer` | NOT NULL | Monotonic version number |
| nodes | `jsonb` | NOT NULL | Snapshot of nodes |
| edges | `jsonb` | NOT NULL | Snapshot of edges |
| config | `jsonb` | NOT NULL, DEFAULT `{}` | Snapshot of flow config |
| createdBy | `text` | NOT NULL, FK → users.id ON DELETE CASCADE | |
| changelog | `text` | | Description of changes |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

**Indexes**: `idx_flow_versions_flow ON flow_versions(flow_id, version DESC)`

### invitations

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | nanoid |
| organizationId | `text` | NOT NULL, FK → organizations.id ON DELETE CASCADE | |
| email | `text` | NOT NULL | Invitee email |
| role | `text` | NOT NULL, DEFAULT `VIEWER` | Role to assign |
| token | `text` | NOT NULL, UNIQUE | Unique invitation token |
| invitedBy | `text` | NOT NULL, FK → users.id ON DELETE CASCADE | |
| acceptedAt | `timestamp with tz` | | When invitation was accepted |
| expiresAt | `timestamp with tz` | NOT NULL | Invitation expiry (default 7 days) |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

**Indexes**: `idx_invitations_token ON invitations(token)`, `idx_invitations_email ON invitations(email)`

### ai_suggestions

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | `text` | PK | nanoid |
| userId | `text` | NOT NULL, FK → users.id ON DELETE CASCADE | |
| workspaceId | `text` | NOT NULL, FK → workspaces.id ON DELETE CASCADE | |
| type | `text` | NOT NULL | generate_flow, optimize_flow, explain_flow, debug_flow |
| prompt | `text` | NOT NULL | User's prompt |
| result | `jsonb` | | AI response (parsed) |
| modelUsed | `text` | | Model name (gpt-4o, claude-3-opus) |
| tokensUsed | `text` | | Token usage summary |
| accepted | `text` | | Whether user accepted the suggestion |
| feedback | `text` | | User feedback |
| createdAt | `timestamp with tz` | NOT NULL, DEFAULT now() | |

---

## Enums

### Role (users, members)

```
ADMIN_ORG     (100) — Full access to org settings, billing, members
DEVELOPER     (80)  — Create/edit flows, manage connectors, API keys
BUSINESS_USER (50)  — Execute flows, view results
VIEWER        (10)  — Read-only access to flows and executions
```

### TriggerType (flows)

```
SCHEDULE — Cron-based scheduled execution
WEBHOOK  — HTTP request trigger
SLACK    — Slack event subscription
GMAIL    — Gmail push notification
MANUAL   — Manual trigger via UI
FORM     — Web form submission
DATABASE — Database change event
```

### ExecutionStatus (executions, execution_steps)

```
PENDING   — Queued, not started
RUNNING   — Actively executing
PAUSED    — Execution paused (manual or conditional)
SUCCESS   — Completed successfully
FAILED    — Completed with errors
CANCELLED — Cancelled by user
TIMED_OUT — Exceeded timeout
RETRYING  — Currently retrying
```

### NodeType (flow nodes)

```
TRIGGER    — Entry point (webhook, schedule, event)
ACTION     — Perform an action (HTTP request, transform, notify)
CONDITION  — Branch logic (if/else, switch, filter)
DELAY      — Wait before proceeding
AI         — LLM call, embeddings, classification, extraction
WEBHOOK    — Inbound webhook listener
LOOP       — Iterate over data
TRANSFORM  — Data transformation
```

---

## Row-Level Security (RLS)

RLS is enforced at the application layer (not PostgreSQL RLS policies) to maintain compatibility with connection pooling and keep logic in TypeScript. The enforcement is:

1. **Authentication** — Every tRPC procedure and REST endpoint validates JWT
2. **Tenant isolation** — All queries filter by `organizationId` (and optionally `workspaceId`) derived from JWT
3. **RBAC checks** — Every mutation checks the user's role against the required permission level
4. **Soft deletes** — Some resources use `deletedAt` for recoverability

---

## Migration Strategy

- **Schema definition**: `packages/database/src/schema/*.ts` — each table in its own file
- **Generate migration**: `pnpm db:generate` — runs `drizzle-kit generate`
- **Apply migration**: `pnpm db:migrate` — runs `drizzle-kit migrate`
- **Push (dev only)**: `pnpm db:push` — runs `drizzle-kit push` (no migration files)
- **Studio (dev)**: `pnpm db:studio` — runs Drizzle Studio GUI
- **Migration files**: Stored in `packages/database/src/migrations/` — committed to version control

### Best Practices

- Do NOT edit migration files manually after creation
- Each PR that changes schema must include a new migration
- Test migrations on a staging database before applying to production
- Rollback: `drizzle-kit` does not support rollback natively — write a down migration manually if needed

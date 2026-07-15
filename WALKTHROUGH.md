# FlowMind AI — Product Walkthrough

---

## 1. Create Account

1. Navigate to `[app.flowmind.ai/register](http://app.flowmind.ai/register)`
2. Enter your **email**, **name**, and **password** (min 12 chars, must include uppercase, lowercase, digit, special char)
3. Click **Create Account**
4. You're automatically signed in and redirected to your new workspace

**What happens behind the scenes**:
- Your account is created with `ADMIN_ORG` role
- An organization is created with your name
- A default workspace ("General") is created
- A JWT pair (access + refresh) is set as HttpOnly cookies

---

## 2. Create Workspace

Workspaces let you organize flows by team or project.

1. Click the workspace dropdown in the top-left corner of the sidebar
2. Click **+ New Workspace**
3. Enter a name (e.g., "Engineering", "Marketing", "Personal")
4. Click **Create**

You can switch between workspaces anytime from the dropdown. Each workspace has its own flows, variables, and members.

---

## 3. Dashboard Overview

The Dashboard is your command center:

```
┌──────────────────────────────────────────────────────────┐
│  Top Bar: Workspace | Search (Cmd+K) | Notifications | User │
├──────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│  │Total │ │Active│ │Failed│ │Success│ ← Stat cards      │
│  │Flows │ │Flows │  │Today │ │Rate   │                    │
│  └──────┘ └──────┘ └──────┘ └──────┘                    │
│                                                          │
│  ┌────────────────────────┐ ┌────────────────────────┐   │
│  │  Recent Flows          │ │  Recent Activity       │   │
│  │  ├─ Support Bot        │ │  ├─ Flow "X" ran       │   │
│  │  ├─ Daily Report       │ │  ├─ Flow "Y" failed    │   │
│  │  └─ View All →         │ │  └─ View All →         │   │
│  └────────────────────────┘ └────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Execution Chart (24h / 7d / 30d)                │   │
│  │  ▁▃▂▅▇▆▄▃▁▂▄▆▇▅▃▂▁                                 │   │
│  └──────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────┤
│  Sidebar: Dashboard | Flows | Templates | Connectors     │
│           Variables | Monitor | Activity | Settings | Help│
└──────────────────────────────────────────────────────────┘
```

**Key actions**:
- **Search** (Cmd+K) — Quick search across flows, templates, and connectors
- **Create Flow** — The big CTA button in the Flows page
- **Notifications** — Bell icon shows execution results and invites

---

## 4. Create Your First Flow with the AI Copilot

This is where FlowMind AI shines. Let's build a flow that sends a Slack notification when a high-priority email arrives.

### Step 1: Go to Flows → New Flow

Click **Flows** in the sidebar, then **+ New Flow**.

### Step 2: Name your flow

```
Name: "Slack Alert for VIP Emails"
```

### Step 3: Use the AI Copilot

Click the **AI Copilot** button (sparkle icon) in the canvas header. A chat panel opens on the right.

Type:

```
When a new email arrives in Gmail from my boss (priority = high),
send a Slack message to the #alerts channel with the subject and summary.
```

The AI Copilot will:
1. Analyze your request using GPT-4o
2. Generate a complete flow with nodes and edges
3. Auto-place them on the canvas

### Step 4: Review and edit

After the AI generates the flow, you can:
- **Drag nodes** to rearrange
- **Click a node** to edit its configuration
- **Add/remove nodes** from the left panel
- **Connect nodes** by dragging from output handles to input handles

The generated flow might look like:

```
[Gmail Trigger] ──→ [AI: Extract] ──→ [Condition: Is VIP?]
                                              │
                                    ┌─────────┴─────────┐
                                    ▼                   ▼
                             [Slack: Alert]       [End]
```

### Step 5: Configure nodes

- **Gmail Trigger**: Select your connected Gmail account, filter by sender
- **AI Extract**: Tells the AI to extract the subject and a 1-line summary
- **Condition**: `{{nodes.extract.isVip}}` equals `true`
- **Slack Action**: Select channel `#alerts`, message template using `{{nodes.extract.subject}}` and `{{nodes.extract.summary}}`

### Step 6: Save

Click **Save** (Cmd+S). The flow is saved as a draft.

---

## 5. Configure Nodes and Connections

### Node Types

| Icon | Type | Purpose |
|---|---|---|
| ⚡ | **Trigger** | Flow entry point (Webhook, Schedule, Event) |
| ▶️ | **Action** | Perform an action (HTTP Request, Notify, Transform) |
| 🔀 | **Condition** | Branch logic (If/Else, Switch, Filter) |
| ⏱ | **Delay** | Wait X seconds/minutes/hours |
| 🧠 | **AI** | LLM Call, Embeddings, Classify, Extract |
| 🌐 | **Webhook** | Listen for HTTP requests |
| 🔄 | **Loop** | Iterate over arrays |
| 🔧 | **Transform** | Modify data with JSONata or JavaScript |

### Configuring a Node

Click any node to open its configuration panel on the right side:

1. **Label** — Human-readable name for the node
2. **Inputs** — Each node type has its own inputs (validated by Zod)
3. **Variables** — Use `{{variable_name}}` to reference workspace variables
4. **Previous nodes** — Use `{{nodes.node_id.field}}` to reference outputs from previous nodes

### Connecting Nodes

- Drag from the **output handle** (right side circle) of one node
- Drop on the **input handle** (left side circle) of another node
- For condition nodes, you get **true** and **false** output handles

---

## 6. Schedule a Flow

Once your flow is ready:

1. Click the **Trigger** node → configure trigger type
2. Select **Schedule** as trigger type
3. Enter a **cron expression** or use presets:
   - `*/5 * * * *` — Every 5 minutes
   - `0 9 * * 1-5` — Weekdays at 9 AM
   - `0 0 * * *` — Daily at midnight
4. Select your **timezone**
5. Toggle **Active** to enable the schedule
6. Save the flow

The flow will now execute automatically on the schedule.

---

## 7. Monitor Executions

### Running a Flow Manually

1. Open the flow in the canvas
2. Click **Run** (Cmd+Enter)
3. Watch nodes highlight in real-time as they execute
4. Green = success, Red = failed, Yellow = running

### Viewing Execution History

1. Click **Monitor** in the sidebar
2. See all executions with status, duration, and trigger source
3. Click any execution for **detailed logs**:

```
Execution #exec_abc123 — Status: SUCCESS — Duration: 2.3s

┌─────────────────────────────────────────────────────────┐
│ Step 1: Gmail Trigger              ✓ 0.2s               │
│   Input:  { sender: "boss@co.com", priority: "high" }    │
│   Output: { messageId: "msg_1", subject: "Urgent: ..." } │
├─────────────────────────────────────────────────────────┤
│ Step 2: AI Extract                 ✓ 1.1s               │
│   Input:  { text: "Urgent: please review..." }           │
│   Output: { summary: "Review Q3 report", isVip: true }   │
├─────────────────────────────────────────────────────────┤
│ Step 3: Condition (isVip)          ✓ 0.1s               │
│   Result: true → Slack branch                            │
├─────────────────────────────────────────────────────────┤
│ Step 4: Slack: #alerts             ✓ 0.3s               │
│   Output: { sent: true, timestamp: "..." }               │
└─────────────────────────────────────────────────────────┘
```

### Filters

- Filter by status (Success, Failed, Running)
- Filter by time range (24h, 7d, 30d)
- Search by flow name

### Real-Time Updates

When an execution runs, the Monitor page updates in real-time via WebSocket. You can watch:

- Live execution progress (node-by-node)
- Live logs streaming
- Notification badges update

---

## 8. Templates and Marketplace

### Using a Template

1. Click **Templates** in the sidebar
2. Browse categories: Customer Support, Data Processing, Marketing, DevOps, Finance, HR, Sales, AI/ML
3. Click any template to preview
4. Click **Use Template** → Select a workspace → **Install**

The template creates a new flow in your workspace with all nodes pre-configured. You can:
- Modify any node's configuration
- Add new nodes
- Connect your own connectors

### Template Categories

| Category | Example Templates |
|---|---|
| Customer Support | Auto-reply to support emails, Slack ticket alerts |
| Data Processing | CSV to database, ETL pipelines, data validation |
| Marketing | Social media posting, email campaign triggers |
| DevOps | Deploy notifications, incident alerts, log monitoring |
| Finance | Invoice processing, expense report automation |
| HR | Onboarding flows, leave request approvals |
| Sales | Lead enrichment, CRM sync, follow-up reminders |
| AI/ML | Content summarization, sentiment analysis, translation |

### Creating Templates

Admins and Developers can create templates:
1. Open any flow
2. Click **Export** → **Save as Template**
3. Set category, description, icon
4. Publish (private to your org or submit for official review)

export const APP_NAME = "FlowMind";
export const APP_TAGLINE = "No hay barreras. Solo tu mente y el flujo.";
export const APP_DESCRIPTION = "Build intelligent automation flows with AI";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Flows", href: "/flows", icon: "GitBranch" },
  { label: "Templates", href: "/templates", icon: "LayoutTemplate" },
  { label: "Connectors", href: "/connectors", icon: "PlugZap" },
  { label: "Variables", href: "/variables", icon: "Variable" },
  { label: "Monitor", href: "/monitor", icon: "Activity" },
  { label: "Activity", href: "/activity", icon: "Bell" },
] as const;

export const BOTTOM_NAV_ITEMS = [
  { label: "Settings", href: "/settings/general", icon: "Settings" },
  { label: "Help", href: "/help", icon: "LifeBuoy" },
] as const;

export const FLOW_NODE_CATEGORIES = [
  {
    id: "triggers",
    label: "Triggers",
    icon: "Zap",
    items: [
      { type: "webhook", label: "Webhook", description: "Receive HTTP request" },
      { type: "schedule", label: "Schedule", description: "Time-based trigger" },
      { type: "event", label: "Event", description: "Watch for events" },
    ],
  },
  {
    id: "actions",
    label: "Actions",
    icon: "Play",
    items: [
      { type: "http", label: "HTTP Request", description: "Make an API call" },
      { type: "transform", label: "Transform", description: "Modify data" },
      { type: "delay", label: "Delay", description: "Wait before next step" },
      { type: "notify", label: "Notify", description: "Send notification" },
    ],
  },
  {
    id: "conditions",
    label: "Conditions",
    icon: "GitFork",
    items: [
      { type: "ifelse", label: "If/Else", description: "Branch logic" },
      { type: "switch", label: "Switch", description: "Multi-branch" },
      { type: "filter", label: "Filter", description: "Filter data" },
    ],
  },
  {
    id: "ai",
    label: "AI",
    icon: "Brain",
    items: [
      { type: "llm", label: "LLM Call", description: "Query any LLM" },
      { type: "embed", label: "Embeddings", description: "Generate embeddings" },
      { type: "classify", label: "Classify", description: "Text classification" },
      { type: "extract", label: "Extract", description: "Extract structured data" },
    ],
  },
] as const;

export const TEMPLATE_CATEGORIES = [
  "All",
  "Customer Support",
  "Data Processing",
  "Marketing",
  "DevOps",
  "Finance",
  "HR",
  "Sales",
  "AI/ML",
] as const;

export const WORKSPACE_ROLES = ["owner", "admin", "member", "viewer"] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const AUTO_SAVE_DELAY = 3000;

export const KEYBOARD_SHORTCUTS = [
  { keys: "Cmd+S", action: "Save flow" },
  { keys: "Cmd+Z", action: "Undo" },
  { keys: "Cmd+Shift+Z", action: "Redo" },
  { keys: "Cmd+D", action: "Duplicate node" },
  { keys: "Delete", action: "Delete selected" },
  { keys: "Cmd+K", action: "Search" },
  { keys: "Cmd+Enter", action: "Run flow" },
  { keys: "Escape", action: "Close panel" },
] as const;

export const EXECUTION_STATUS_COLORS = {
  pending: "text-yellow-500",
  running: "text-biolume",
  success: "text-emerald-500",
  error: "text-ember",
  cancelled: "text-zinc-500",
} as const;

export const FLOW_STATUS_COLORS = {
  draft: "text-zinc-400",
  active: "text-biolume",
  paused: "text-amber-500",
} as const;

export const CHART_PERIODS = [
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
] as const;

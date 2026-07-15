export type ConnectorCategory =
  | "ai"
  | "communication"
  | "storage"
  | "crm"
  | "analytics"
  | "payment"
  | "social"
  | "database"
  | "devops"
  | "marketing";

export type ConnectorAuthType = "oauth" | "apiKey" | "basic" | "none";

export type ConnectorStatus = "installed" | "available" | "updating";

export interface ConnectorTrigger {
  id: string;
  name: string;
  description: string;
  type: "webhook" | "polling" | "event";
  inputSchema?: Record<string, unknown>;
}

export interface ConnectorAction {
  id: string;
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

export interface Connector {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  icon: string;
  category: ConnectorCategory;
  authType: ConnectorAuthType;
  status: ConnectorStatus;
  version: string;
  isCore: boolean;
  triggers: ConnectorTrigger[];
  actions: ConnectorAction[];
  configFields?: ConnectorConfigField[];
  docsUrl?: string;
  installedAt?: string;
  updatedAt: string;
}

export interface ConnectorConfigField {
  key: string;
  label: string;
  type: "text" | "password" | "select" | "toggle";
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export interface ConnectorConfig {
  connectorId: string;
  values: Record<string, string>;
  label?: string;
}

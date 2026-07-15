import { z } from "zod";
import type { JsonValue } from "@flowmind/shared";

export type ConnectorAuthType = "oauth2" | "api_key" | "basic" | "none";

export interface ConnectorDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  authType: ConnectorAuthType;
  triggers: string[];
  actions: string[];
  configSchema: Record<string, unknown>;
}

export interface ConnectorProps {
  id: string;
  organizationId: string;
  connectorType: string;
  label: string;
  config: Record<string, JsonValue>;
  isEnabled: boolean;
  lastTestedAt?: Date | null;
  lastTestSuccess?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Connector {
  private constructor(private readonly props: ConnectorProps) {}

  static create(props: Omit<ConnectorProps, "createdAt" | "updatedAt" | "isEnabled">): Connector {
    return new Connector({
      ...props,
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static from(props: ConnectorProps): Connector {
    return new Connector(props);
  }

  get id(): string { return this.props.id; }
  get organizationId(): string { return this.props.organizationId; }
  get connectorType(): string { return this.props.connectorType; }
  get label(): string { return this.props.label; }
  get config(): Record<string, JsonValue> { return { ...this.props.config }; }
  get isEnabled(): boolean { return this.props.isEnabled; }
  get lastTestedAt(): Date | null | undefined { return this.props.lastTestedAt; }
  get lastTestSuccess(): boolean | null | undefined { return this.props.lastTestSuccess; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  enable(): void { this.props.isEnabled = true; this.props.updatedAt = new Date(); }
  disable(): void { this.props.isEnabled = false; this.props.updatedAt = new Date(); }

  recordTest(success: boolean): void {
    this.props.lastTestedAt = new Date();
    this.props.lastTestSuccess = success;
    this.props.updatedAt = new Date();
  }

  updateConfig(config: Record<string, JsonValue>): void {
    this.props.config = config;
    this.props.updatedAt = new Date();
  }

  toJSON(): ConnectorProps {
    return { ...this.props };
  }
}

export const CreateConnectorSchema = z.object({
  connectorType: z.string(),
  label: z.string().min(1).max(100),
  config: z.record(z.unknown()),
});

export const CONNECTOR_DEFINITIONS: ConnectorDefinition[] = [
  {
    type: "slack",
    name: "Slack",
    description: "Send messages, read channels, react to events",
    icon: "slack",
    authType: "oauth2",
    triggers: ["message_received", "reaction_added", "channel_joined"],
    actions: ["send_message", "create_channel", "add_reaction", "get_messages"],
    configSchema: {
      type: "object",
      properties: {
        accessToken: { type: "string", secret: true },
        teamId: { type: "string" },
      },
    },
  },
  {
    type: "gmail",
    name: "Gmail",
    description: "Send and read emails, manage labels",
    icon: "gmail",
    authType: "oauth2",
    triggers: ["email_received"],
    actions: ["send_email", "create_draft", "add_label", "search_emails"],
    configSchema: {
      type: "object",
      properties: {
        accessToken: { type: "string", secret: true },
        refreshToken: { type: "string", secret: true },
        emailAddress: { type: "string" },
      },
    },
  },
  {
    type: "http",
    name: "HTTP Request",
    description: "Make HTTP requests to any API",
    icon: "http",
    authType: "none",
    triggers: [],
    actions: ["get", "post", "put", "patch", "delete"],
    configSchema: {
      type: "object",
      properties: {
        baseUrl: { type: "string" },
        headers: { type: "object" },
      },
    },
  },
  {
    type: "webhook",
    name: "Webhook",
    description: "Receive and send webhook events",
    icon: "webhook",
    authType: "none",
    triggers: ["incoming_webhook"],
    actions: ["send_webhook"],
    configSchema: {
      type: "object",
      properties: {
        secret: { type: "string", secret: true },
      },
    },
  },
  {
    type: "delay",
    name: "Delay",
    description: "Wait for a specified duration",
    icon: "clock",
    authType: "none",
    triggers: [],
    actions: ["wait", "wait_until"],
    configSchema: { type: "object", properties: {} },
  },
  {
    type: "ai",
    name: "AI Action",
    description: "Use AI to process, transform, or generate data",
    icon: "sparkles",
    authType: "none",
    triggers: [],
    actions: ["transform", "generate", "classify", "extract"],
    configSchema: {
      type: "object",
      properties: {
        model: { type: "string" },
        temperature: { type: "number" },
      },
    },
  },
];

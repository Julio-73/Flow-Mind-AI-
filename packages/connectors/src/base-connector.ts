import type { JsonValue } from "@flowmind/shared";

export interface ConnectorAction {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}

export interface ConnectorTrigger {
  id: string;
  name: string;
  description: string;
  configSchema: Record<string, unknown>;
}

export abstract class BaseConnector {
  abstract readonly type: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly icon: string;

  abstract getActions(): ConnectorAction[];
  abstract getTriggers(): ConnectorTrigger[];

  abstract executeAction(
    actionId: string,
    config: Record<string, JsonValue>,
    input: Record<string, JsonValue>,
  ): Promise<Record<string, JsonValue>>;

  abstract validateConfig(config: Record<string, JsonValue>): Promise<{ valid: boolean; errors: string[] }>;

  abstract testConnection(config: Record<string, JsonValue>): Promise<{ success: boolean; message: string }>;
}

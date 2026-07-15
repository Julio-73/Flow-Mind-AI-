import { BaseConnector, type ConnectorAction, type ConnectorTrigger } from "../base-connector.js";
import type { JsonValue } from "@flowmind/shared";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("connectors:http");

export class HttpConnector extends BaseConnector {
  readonly type = "http";
  readonly name = "HTTP Request";
  readonly description = "Make HTTP requests to any API";
  readonly icon = "http";

  getActions(): ConnectorAction[] {
    return [
      { id: "get", name: "GET", description: "Make a GET request", inputSchema: { url: { type: "string", required: true }, headers: { type: "object" } }, outputSchema: { status: { type: "number" }, data: { type: "object" } } },
      { id: "post", name: "POST", description: "Make a POST request", inputSchema: { url: { type: "string", required: true }, body: { type: "object" }, headers: { type: "object" } }, outputSchema: { status: { type: "number" }, data: { type: "object" } } },
      { id: "put", name: "PUT", description: "Make a PUT request", inputSchema: { url: { type: "string", required: true }, body: { type: "object" }, headers: { type: "object" } }, outputSchema: { status: { type: "number" }, data: { type: "object" } } },
      { id: "delete", name: "DELETE", description: "Make a DELETE request", inputSchema: { url: { type: "string", required: true }, headers: { type: "object" } }, outputSchema: { status: { type: "number" } } },
    ];
  }

  getTriggers(): ConnectorTrigger[] { return []; }

  async executeAction(
    actionId: string,
    config: Record<string, JsonValue>,
    input: Record<string, JsonValue>,
  ): Promise<Record<string, JsonValue>> {
    logger.debug({ actionId, url: input["url"] }, "Executing HTTP request");

    const method = actionId.toUpperCase();
    const url = input["url"] as string;
    const headers = { ...(config["headers"] as Record<string, string> ?? {}), ...(input["headers"] as Record<string, string> ?? {}) };
    const body = input["body"];

    return {
      status: 200,
      method,
      url,
      headers: headers as any,
      body: body ?? null,
      data: { mocked: true, message: `HTTP ${method} ${url}` },
      timestamp: new Date().toISOString(),
    };
  }

  async validateConfig(config: Record<string, JsonValue>): Promise<{ valid: boolean; errors: string[] }> {
    return { valid: true, errors: [] };
  }

  async testConnection(config: Record<string, JsonValue>): Promise<{ success: boolean; message: string }> {
    return { success: true, message: "HTTP connector ready" };
  }
}

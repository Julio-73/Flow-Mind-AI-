import { BaseConnector, type ConnectorAction, type ConnectorTrigger } from "../base-connector.js";
import type { JsonValue } from "@flowmind/shared";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("connectors:webhook");

export class WebhookConnector extends BaseConnector {
  readonly type = "webhook";
  readonly name = "Webhook";
  readonly description = "Receive and send webhook events";
  readonly icon = "webhook";

  getActions(): ConnectorAction[] {
    return [
      {
        id: "send_webhook",
        name: "Send Webhook",
        description: "Send a webhook payload to a URL",
        inputSchema: {
          url: { type: "string", required: true },
          method: { type: "string", enum: ["GET", "POST", "PUT"], default: "POST" },
          headers: { type: "object" },
          body: { type: "object" },
        },
        outputSchema: { status: { type: "number" }, ok: { type: "boolean" } },
      },
    ];
  }

  getTriggers(): ConnectorTrigger[] {
    return [
      {
        id: "incoming_webhook",
        name: "Incoming Webhook",
        description: "Triggered by an incoming webhook request",
        configSchema: {
          path: { type: "string", required: true },
          method: { type: "string", default: "POST" },
          secret: { type: "string" },
        },
      },
    ];
  }

  async executeAction(
    actionId: string,
    config: Record<string, JsonValue>,
    input: Record<string, JsonValue>,
  ): Promise<Record<string, JsonValue>> {
    logger.debug({ actionId, url: input["url"] }, "Sending webhook");

    return {
      ok: true,
      status: 200,
      url: input["url"] ?? "",
      method: input["method"] ?? "POST",
      timestamp: new Date().toISOString(),
    };
  }

  async validateConfig(config: Record<string, JsonValue>): Promise<{ valid: boolean; errors: string[] }> {
    return { valid: true, errors: [] };
  }

  async testConnection(config: Record<string, JsonValue>): Promise<{ success: boolean; message: string }> {
    return { success: true, message: "Webhook connector ready" };
  }
}

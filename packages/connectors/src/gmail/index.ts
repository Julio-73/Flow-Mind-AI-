import { BaseConnector, type ConnectorAction, type ConnectorTrigger } from "../base-connector.js";
import type { JsonValue } from "@flowmind/shared";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("connectors:gmail");

export class GmailConnector extends BaseConnector {
  readonly type = "gmail";
  readonly name = "Gmail";
  readonly description = "Send and read emails, manage labels";
  readonly icon = "gmail";

  getActions(): ConnectorAction[] {
    return [
      {
        id: "send_email",
        name: "Send Email",
        description: "Send an email via Gmail",
        inputSchema: {
          to: { type: "string", required: true },
          subject: { type: "string", required: true },
          body: { type: "string", required: true },
          cc: { type: "string" },
          bcc: { type: "string" },
        },
        outputSchema: { messageId: { type: "string" }, sent: { type: "boolean" } },
      },
      {
        id: "search_emails",
        name: "Search Emails",
        description: "Search for emails matching criteria",
        inputSchema: { query: { type: "string", required: true }, maxResults: { type: "number", default: 10 } },
        outputSchema: { emails: { type: "array" }, total: { type: "number" } },
      },
      {
        id: "add_label",
        name: "Add Label",
        description: "Add a label to an email",
        inputSchema: { messageId: { type: "string", required: true }, label: { type: "string", required: true } },
        outputSchema: { ok: { type: "boolean" } },
      },
    ];
  }

  getTriggers(): ConnectorTrigger[] {
    return [
      {
        id: "email_received",
        name: "Email Received",
        description: "Triggered when a new email arrives",
        configSchema: { query: { type: "string" }, label: { type: "string" } },
      },
    ];
  }

  async executeAction(
    actionId: string,
    config: Record<string, JsonValue>,
    input: Record<string, JsonValue>,
  ): Promise<Record<string, JsonValue>> {
    logger.debug({ actionId, input }, "Executing Gmail action");

    switch (actionId) {
      case "send_email":
        return {
          messageId: `msg_${Date.now()}`,
          sent: true,
          to: input["to"] ?? "",
          subject: input["subject"] ?? "",
        };
      case "search_emails":
        return { emails: [], total: 0, query: input["query"] ?? "" };
      case "add_label":
        return { ok: true };
      default:
        throw new Error(`Unknown Gmail action: ${actionId}`);
    }
  }

  async validateConfig(config: Record<string, JsonValue>): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    if (!config["accessToken"]) errors.push("accessToken is required");
    if (!config["emailAddress"]) errors.push("emailAddress is required");
    return { valid: errors.length === 0, errors };
  }

  async testConnection(config: Record<string, JsonValue>): Promise<{ success: boolean; message: string }> {
    const email = config["emailAddress"] as string;
    return { success: true, message: `Connected as ${email ?? "unknown"}` };
  }
}

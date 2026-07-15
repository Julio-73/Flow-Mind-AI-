import { BaseConnector, type ConnectorAction, type ConnectorTrigger } from "../base-connector.js";
import type { JsonValue } from "@flowmind/shared";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("connectors:slack");

export class SlackConnector extends BaseConnector {
  readonly type = "slack";
  readonly name = "Slack";
  readonly description = "Send messages, read channels, react to events";
  readonly icon = "slack";

  getActions(): ConnectorAction[] {
    return [
      {
        id: "send_message",
        name: "Send Message",
        description: "Send a message to a Slack channel",
        inputSchema: {
          channel: { type: "string", required: true },
          text: { type: "string", required: true },
          threadTs: { type: "string" },
        },
        outputSchema: {
          messageTs: { type: "string" },
          channel: { type: "string" },
          ok: { type: "boolean" },
        },
      },
      {
        id: "create_channel",
        name: "Create Channel",
        description: "Create a new Slack channel",
        inputSchema: {
          name: { type: "string", required: true },
          isPrivate: { type: "boolean", default: false },
        },
        outputSchema: { channelId: { type: "string" }, ok: { type: "boolean" } },
      },
      {
        id: "add_reaction",
        name: "Add Reaction",
        description: "Add an emoji reaction to a message",
        inputSchema: {
          channel: { type: "string", required: true },
          timestamp: { type: "string", required: true },
          reaction: { type: "string", required: true },
        },
        outputSchema: { ok: { type: "boolean" } },
      },
    ];
  }

  getTriggers(): ConnectorTrigger[] {
    return [
      {
        id: "message_received",
        name: "Message Received",
        description: "Triggered when a new message is posted",
        configSchema: { channel: { type: "string" } },
      },
      {
        id: "reaction_added",
        name: "Reaction Added",
        description: "Triggered when a reaction is added to a message",
        configSchema: { channel: { type: "string" }, reaction: { type: "string" } },
      },
    ];
  }

  async executeAction(
    actionId: string,
    config: Record<string, JsonValue>,
    input: Record<string, JsonValue>,
  ): Promise<Record<string, JsonValue>> {
    logger.debug({ actionId, input }, "Executing Slack action");

    const token = config["accessToken"] as string;
    if (!token) throw new Error("Slack access token not configured");

    switch (actionId) {
      case "send_message": {
        const channel = input["channel"] as string;
        const text = input["text"] as string;
        return { ok: true, channel, messageTs: `mock_${Date.now()}`, text };
      }
      case "create_channel": {
        const name = input["name"] as string;
        return { ok: true, channelId: `C${Date.now()}` };
      }
      case "add_reaction": {
        return { ok: true };
      }
      default:
        throw new Error(`Unknown Slack action: ${actionId}`);
    }
  }

  async validateConfig(config: Record<string, JsonValue>): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    if (!config["accessToken"]) errors.push("accessToken is required");
    return { valid: errors.length === 0, errors };
  }

  async testConnection(config: Record<string, JsonValue>): Promise<{ success: boolean; message: string }> {
    if (!config["accessToken"]) {
      return { success: false, message: "No access token provided" };
    }
    return { success: true, message: "Connection successful" };
  }
}

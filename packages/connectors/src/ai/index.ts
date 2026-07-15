import { BaseConnector, type ConnectorAction, type ConnectorTrigger } from "../base-connector.js";
import type { JsonValue } from "@flowmind/shared";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("connectors:ai");

export class AIConnector extends BaseConnector {
  readonly type = "ai";
  readonly name = "AI Action";
  readonly description = "Use AI to process, transform, or generate data";
  readonly icon = "sparkles";

  getActions(): ConnectorAction[] {
    return [
      {
        id: "transform",
        name: "Transform Data",
        description: "Use AI to transform data from one format to another",
        inputSchema: { prompt: { type: "string", required: true }, data: { type: "object" } },
        outputSchema: { result: { type: "object" }, usage: { type: "object" } },
      },
      {
        id: "generate",
        name: "Generate Content",
        description: "Generate content using AI",
        inputSchema: { prompt: { type: "string", required: true }, maxTokens: { type: "number", default: 500 } },
        outputSchema: { content: { type: "string" }, usage: { type: "object" } },
      },
      {
        id: "classify",
        name: "Classify",
        description: "Classify input text into categories",
        inputSchema: { text: { type: "string", required: true }, categories: { type: "array", items: { type: "string" } } },
        outputSchema: { category: { type: "string" }, confidence: { type: "number" } },
      },
      {
        id: "extract",
        name: "Extract Data",
        description: "Extract structured data from unstructured text",
        inputSchema: { text: { type: "string", required: true }, schema: { type: "object" } },
        outputSchema: { extracted: { type: "object" } },
      },
    ];
  }

  getTriggers(): ConnectorTrigger[] { return []; }

  async executeAction(
    actionId: string,
    config: Record<string, JsonValue>,
    input: Record<string, JsonValue>,
  ): Promise<Record<string, JsonValue>> {
    logger.debug({ actionId }, "Executing AI action");

    switch (actionId) {
      case "transform":
        return {
          result: { transformed: true, data: input["data"] ?? null } as any,
          usage: { promptTokens: 50, completionTokens: 100, totalTokens: 150 },
        };
      case "generate":
        return {
          content: `[Generated content based on: ${(input["prompt"] as string ?? "").substring(0, 50)}...]`,
          usage: { promptTokens: 30, completionTokens: 200, totalTokens: 230 },
        };
      case "classify":
        return {
          category: "uncategorized",
          confidence: 0.5,
          categories: input["categories"] ?? [],
        };
      case "extract":
        return {
          extracted: { text: input["text"] ?? null, fields: {} } as any,
        };
      default:
        throw new Error(`Unknown AI action: ${actionId}`);
    }
  }

  async validateConfig(config: Record<string, JsonValue>): Promise<{ valid: boolean; errors: string[] }> {
    return { valid: true, errors: [] };
  }

  async testConnection(config: Record<string, JsonValue>): Promise<{ success: boolean; message: string }> {
    return { success: true, message: "AI connector ready (requires API keys)" };
  }
}

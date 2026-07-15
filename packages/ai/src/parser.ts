import { z } from "zod";
import { createLogger } from "@flowmind/shared";
import type { JsonValue } from "@flowmind/shared";

const logger = createLogger("ai:parser");

const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(["TRIGGER", "ACTION", "CONDITION", "DELAY", "AI", "WEBHOOK", "LOOP", "TRANSFORM"]),
  label: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  config: z.record(z.unknown()),
});

const EdgeSchema = z.object({
  id: z.string(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  label: z.string().optional(),
  condition: z.string().optional(),
});

const FlowResultSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  description: z.string().optional(),
});

export interface ParsedFlowResult {
  nodes: Array<{
    id: string;
    type: string;
    label: string;
    position: { x: number; y: number };
    config: Record<string, JsonValue>;
  }>;
  edges: Array<{
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    label?: string;
    condition?: string;
  }>;
  description?: string;
}

export class CopilotParser {
  parseFlowGeneration(raw: string): ParsedFlowResult {
    try {
      const cleaned = this.cleanJsonString(raw);
      const parsed = JSON.parse(cleaned);
      const validated = FlowResultSchema.parse(parsed);
      return validated as ParsedFlowResult;
    } catch (error) {
      logger.error({ error, raw }, "Failed to parse AI flow generation");
      throw new Error("Failed to parse AI-generated flow: invalid format");
    }
  }

  parseToolCall(
    toolCall: { name: string; arguments: string },
  ): Record<string, JsonValue> {
    try {
      return JSON.parse(toolCall.arguments) as Record<string, JsonValue>;
    } catch (error) {
      logger.error({ error, toolCall }, "Failed to parse tool call arguments");
      throw new Error("Failed to parse AI tool call response");
    }
  }

  private cleanJsonString(raw: string): string {
    let cleaned = raw.trim();

    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }

    return cleaned.trim();
  }
}

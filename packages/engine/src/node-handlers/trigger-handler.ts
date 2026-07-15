import type { FlowNodeData } from "@flowmind/core";
import type { JsonValue } from "@flowmind/shared";

export class TriggerHandler {
  async execute(
    node: FlowNodeData,
    input: Record<string, JsonValue>,
  ): Promise<Record<string, JsonValue>> {
    return {
      triggered: true,
      timestamp: new Date().toISOString(),
      ...input,
      ...node.config,
    };
  }
}

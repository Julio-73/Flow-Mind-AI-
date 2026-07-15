import type { FlowNodeData } from "@flowmind/core";
import type { JsonValue } from "@flowmind/shared";

export class LoopHandler {
  async execute(
    node: FlowNodeData,
    input: Record<string, JsonValue>,
    context: Record<string, JsonValue>,
  ): Promise<Record<string, JsonValue>> {
    const iterations = (node.config["iterations"] as number) ?? 1;
    const itemsField = node.config["itemsField"] as string | undefined;
    const items = itemsField ? (context[itemsField] as unknown[] | undefined) ?? [] : [];

    const loopCount = items.length > 0 ? items.length : iterations;
    const results: JsonValue[] = [];

    for (let i = 0; i < loopCount; i++) {
      const item = items[i] ?? { index: i };
      results.push({
        iteration: i,
        item: item as JsonValue,
        processed: true,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      loopCount,
      iterations: loopCount,
      results,
      completed: true,
    };
  }
}

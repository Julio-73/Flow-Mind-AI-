import type { FlowNodeData } from "@flowmind/core";
import type { JsonValue } from "@flowmind/shared";
import { sleep } from "@flowmind/shared";

export class DelayHandler {
  async execute(
    node: FlowNodeData,
    input: Record<string, JsonValue>,
  ): Promise<Record<string, JsonValue>> {
    const durationMs = (node.config["durationMs"] as number) ?? 1000;
    const maxDelay = 300000;
    const actualDelay = Math.min(durationMs, maxDelay);

    await sleep(actualDelay);

    return {
      delayed: true,
      durationMs: actualDelay,
      waitedFrom: new Date(Date.now() - actualDelay).toISOString(),
      waitedUntil: new Date().toISOString(),
    };
  }
}

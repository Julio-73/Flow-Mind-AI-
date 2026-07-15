import { BaseConnector, type ConnectorAction, type ConnectorTrigger } from "../base-connector.js";
import type { JsonValue } from "@flowmind/shared";
import { sleep } from "@flowmind/shared";

export class DelayConnector extends BaseConnector {
  readonly type = "delay";
  readonly name = "Delay";
  readonly description = "Wait for a specified duration";
  readonly icon = "clock";

  getActions(): ConnectorAction[] {
    return [
      {
        id: "wait",
        name: "Wait",
        description: "Wait for a specified number of milliseconds",
        inputSchema: { durationMs: { type: "number", required: true, min: 100, max: 300000 } },
        outputSchema: { waitedMs: { type: "number" }, timestamp: { type: "string" } },
      },
      {
        id: "wait_until",
        name: "Wait Until",
        description: "Wait until a specific date/time",
        inputSchema: { timestamp: { type: "string", required: true } },
        outputSchema: { waitedMs: { type: "number" }, targetTime: { type: "string" } },
      },
    ];
  }

  getTriggers(): ConnectorTrigger[] { return []; }

  async executeAction(
    actionId: string,
    config: Record<string, JsonValue>,
    input: Record<string, JsonValue>,
  ): Promise<Record<string, JsonValue>> {
    if (actionId === "wait") {
      const durationMs = Math.min((input["durationMs"] as number) ?? 1000, 300000);
      await sleep(durationMs);
      return { waitedMs: durationMs, timestamp: new Date().toISOString() };
    }

    if (actionId === "wait_until") {
      const target = new Date(input["timestamp"] as string);
      const now = Date.now();
      const waitMs = Math.max(0, Math.min(target.getTime() - now, 300000));
      if (waitMs > 0) await sleep(waitMs);
      return { waitedMs: waitMs, targetTime: target.toISOString(), currentTime: new Date().toISOString() };
    }

    throw new Error(`Unknown delay action: ${actionId}`);
  }

  async validateConfig(): Promise<{ valid: boolean; errors: string[] }> {
    return { valid: true, errors: [] };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return { success: true, message: "Delay connector ready" };
  }
}

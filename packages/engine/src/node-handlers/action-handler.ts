import type { FlowNodeData } from "@flowmind/core";
import type { JsonValue } from "@flowmind/shared";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("engine:action");

export class ActionHandler {
  async execute(
    node: FlowNodeData,
    input: Record<string, JsonValue>,
  ): Promise<Record<string, JsonValue>> {
    const connectorType = node.config["connectorType"] as string | undefined;
    const action = node.config["action"] as string | undefined;
    const params = node.config["params"] as Record<string, JsonValue> | undefined;

    logger.debug({ nodeId: node.id, connectorType, action }, "Executing action");

    return {
      actionPerformed: action ?? "unknown",
      connectorType: connectorType ?? "unknown",
      params: params ?? {},
      result: params ?? ({} as Record<string, JsonValue>),
      timestamp: new Date().toISOString(),
    };
  }
}

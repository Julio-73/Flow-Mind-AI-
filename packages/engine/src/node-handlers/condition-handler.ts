import type { FlowNodeData } from "@flowmind/core";
import type { JsonValue } from "@flowmind/shared";

export class ConditionHandler {
  async execute(
    node: FlowNodeData,
    input: Record<string, JsonValue>,
  ): Promise<Record<string, JsonValue>> {
    const field = node.config["field"] as string | undefined;
    const operator = node.config["operator"] as string ?? "equals";
    const compareValue = node.config["value"];

    const actualValue = field ? input[field] : undefined;
    let matched = false;

    switch (operator) {
      case "equals":
        matched = actualValue === compareValue;
        break;
      case "not_equals":
        matched = actualValue !== compareValue;
        break;
      case "contains":
        matched = String(actualValue ?? "").includes(String(compareValue ?? ""));
        break;
      case "greater_than":
        matched = Number(actualValue) > Number(compareValue);
        break;
      case "less_than":
        matched = Number(actualValue) < Number(compareValue);
        break;
      case "is_empty":
        matched = actualValue === undefined || actualValue === null || actualValue === "";
        break;
      case "is_not_empty":
        matched = actualValue !== undefined && actualValue !== null && actualValue !== "";
        break;
      default:
        matched = actualValue === compareValue;
    }

    return {
      matched,
      operator,
      field: field ?? null,
      actualValue: actualValue ?? null,
      compareValue: compareValue ?? null,
    };
  }
}

import { VariableEvaluator } from "@flowmind/core";
import type { FlowNodeData, VariableProvider } from "@flowmind/core";
import type { JsonValue } from "@flowmind/shared";

export class VariableResolver {
  private evaluator: VariableEvaluator;

  constructor(providers: VariableProvider[] = []) {
    this.evaluator = new VariableEvaluator(providers);
  }

  resolveNodeInput(
    node: FlowNodeData,
    context: Record<string, JsonValue>,
  ): Record<string, JsonValue> {
    const resolved: Record<string, JsonValue> = {};

    for (const [key, value] of Object.entries(node.config)) {
      if (typeof value === "string") {
        resolved[key] = this.evaluator.evaluateJson(value, context);
      } else if (typeof value === "object" && value !== null) {
        resolved[key] = this.resolveDeep(value as Record<string, JsonValue>, context);
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  private resolveDeep(
    obj: Record<string, JsonValue>,
    context: Record<string, JsonValue>,
  ): Record<string, JsonValue> {
    const result: Record<string, JsonValue> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        result[key] = this.evaluator.evaluateJson(value, context);
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        result[key] = this.resolveDeep(value as Record<string, JsonValue>, context);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  extractReferences(node: FlowNodeData): string[] {
    const refs: string[] = [];
    const extract = (obj: unknown): void => {
      if (typeof obj === "string") {
        refs.push(...this.evaluator.extractVariableReferences(obj));
      } else if (typeof obj === "object" && obj !== null) {
        for (const val of Object.values(obj)) {
          extract(val);
        }
      }
    };
    extract(node.config);
    return [...new Set(refs)];
  }
}

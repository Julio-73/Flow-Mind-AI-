import type { FlowNodeData } from "@flowmind/core";
import type { JsonValue } from "@flowmind/shared";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("engine:transform");

export class TransformHandler {
  async execute(
    node: FlowNodeData,
    input: Record<string, JsonValue>,
  ): Promise<Record<string, JsonValue>> {
    const mappings = node.config["mappings"] as Record<string, string> | undefined;
    const transformType = node.config["type"] as string ?? "map";
    const sourceField = node.config["sourceField"] as string | undefined;

    const source = sourceField ? (input[sourceField] as Record<string, JsonValue> | undefined) ?? input : input;

    if (transformType === "map" && mappings) {
      const result: Record<string, JsonValue> = {};
      for (const [targetKey, sourcePath] of Object.entries(mappings)) {
        result[targetKey] = this.resolvePath(source, sourcePath);
      }
      return { transformed: true, type: "map", output: result };
    }

    if (transformType === "pluck" && sourceField) {
      const values = (input[sourceField] as JsonValue[] | undefined) ?? [];
      const pluckKey = node.config["pluckKey"] as string ?? "";
      return {
        transformed: true,
        type: "pluck",
        output: values.map((v: any) => v?.[pluckKey]),
      };
    }

    if (transformType === "aggregate") {
      const values = (input[sourceField ?? "input"] as number[] | undefined) ?? [];
      const method = node.config["method"] as string ?? "sum";
      let result: number;
      switch (method) {
        case "sum": result = values.reduce((a, b) => a + b, 0); break;
        case "avg": result = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0; break;
        case "min": result = Math.min(...values); break;
        case "max": result = Math.max(...values); break;
        case "count": result = values.length; break;
        default: result = values.reduce((a, b) => a + b, 0);
      }
      return { transformed: true, type: "aggregate", method, result };
    }

    logger.warn({ nodeId: node.id, transformType }, "Unknown transform type");
    return { transformed: false, output: input };
  }

  private resolvePath(obj: Record<string, JsonValue>, path: string): JsonValue {
    const parts = path.split(".");
    let current: any = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined as any;
      current = current[part];
    }
    return current;
  }
}

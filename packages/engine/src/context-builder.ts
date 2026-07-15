import type { NodeResult } from "@flowmind/core";
import type { JsonValue } from "@flowmind/shared";

export class ContextBuilder {
  buildNodeContext(
    globalContext: Record<string, JsonValue>,
    dependencyIds: string[],
    nodeResults: Map<string, NodeResult>,
  ): Record<string, JsonValue> {
    const context: Record<string, JsonValue> = {
      ...globalContext,
      trigger: globalContext["trigger"] ?? {},
      variables: globalContext["variables"] ?? {},
    };

    for (const depId of dependencyIds) {
      const result = nodeResults.get(depId);
      if (result?.output) {
        context[`node_${depId}`] = result.output as JsonValue;
      }
    }

    return context;
  }

  buildGlobalContext(
    triggerData: Record<string, JsonValue>,
    variables: Record<string, JsonValue>,
    flowConfig: Record<string, JsonValue>,
  ): Record<string, JsonValue> {
    return {
      trigger: triggerData,
      variables,
      flow: flowConfig,
      now: new Date().toISOString(),
      env: process.env["NODE_ENV"] ?? "development",
    };
  }

  extractOutputs(
    nodeResults: Map<string, NodeResult>,
  ): Record<string, JsonValue> {
    const outputs: Record<string, JsonValue> = {};
    for (const [nodeId, result] of nodeResults) {
      if (result.output) {
        outputs[nodeId] = result.output as JsonValue;
      }
    }
    return outputs;
  }
}

import type { FlowNodeData } from "@flowmind/core";
import type { JsonValue } from "@flowmind/shared";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("engine:ai");

export class AIHandler {
  async execute(
    node: FlowNodeData,
    input: Record<string, JsonValue>,
  ): Promise<Record<string, JsonValue>> {
    const prompt = node.config["prompt"] as string ?? "";
    const model = node.config["model"] as string ?? "gpt-4o";
    const temperature = (node.config["temperature"] as number) ?? 0.2;
    const inputData = node.config["inputData"] as string ?? "input";

    const dataToProcess = input[inputData] ?? input;

    logger.debug({ nodeId: node.id, model }, "Executing AI node");

    return {
      prompt,
      model,
      temperature,
      inputProcessed: true,
      result: {
        content: `[AI processed: ${prompt.substring(0, 100)}...]`,
        model,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      },
      timestamp: new Date().toISOString(),
    };
  }
}

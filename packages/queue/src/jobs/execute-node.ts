import { createLogger } from "@flowmind/shared";

const logger = createLogger("queue:job:execute-node");

export interface ExecuteNodePayload {
  flowId: string;
  executionId: string;
  nodeId: string;
  input: Record<string, unknown>;
}

export async function executeNodeJob(payload: ExecuteNodePayload): Promise<Record<string, unknown>> {
  const { flowId, executionId, nodeId, input } = payload;
  logger.info({ flowId, executionId, nodeId }, "Executing individual node");

  return {
    nodeId,
    status: "completed",
    output: input,
    timestamp: new Date().toISOString(),
  };
}

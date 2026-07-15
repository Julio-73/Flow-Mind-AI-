import { Executor } from "@flowmind/engine";
import { getConnection } from "@flowmind/database";
import { DrizzleFlowRepository, DrizzleExecutionRepository } from "@flowmind/database";
import { createLogger } from "@flowmind/shared";
import type { Flow } from "@flowmind/core";

const logger = createLogger("queue:job:execute-flow");

const executor = new Executor();
const flowRepo = new DrizzleFlowRepository();
const execRepo = new DrizzleExecutionRepository();

export interface ExecuteFlowPayload {
  flowId: string;
  executionId: string;
  triggerData: Record<string, unknown>;
}

export async function executeFlowJob(payload: ExecuteFlowPayload): Promise<Record<string, unknown>> {
  const { flowId, executionId, triggerData } = payload;
  logger.info({ flowId, executionId }, "Executing flow");

  const flow = await flowRepo.findById(flowId);
  if (!flow) {
    throw new Error(`Flow ${flowId} not found`);
  }

  const state = await executor.execute(flow, triggerData, executionId);

  const execution = await execRepo.findById(executionId);
  if (execution) {
    if (state.status === "SUCCESS") {
      execution.transitionTo("SUCCESS");
    } else if (state.status === "FAILED") {
      execution.transitionTo("FAILED");
      if (state.errors && state.errors.length > 0) {
        execution.setError(state.errors.map((e) => e.message).join("; "));
      }
    }
    await execRepo.update(execution);
  }

  logger.info({ flowId, executionId, status: state.status }, "Flow execution completed");
  return { status: state.status, executionId, nodeCount: state.nodeResults.size };
}

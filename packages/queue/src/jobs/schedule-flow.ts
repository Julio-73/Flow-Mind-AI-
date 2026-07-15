import { randomBytes } from "node:crypto";
import { queueManager } from "../queues.js";
import { DrizzleFlowRepository } from "@flowmind/database";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("queue:job:schedule-flow");
const flowRepo = new DrizzleFlowRepository();

export interface ScheduleFlowPayload {
  flowId: string;
  scheduleId: string;
}

export async function scheduleFlowJob(payload: ScheduleFlowPayload): Promise<Record<string, unknown>> {
  const { flowId } = payload;
  logger.info({ flowId }, "Scheduled flow triggered");

  const flow = await flowRepo.findById(flowId);
  if (!flow) {
    throw new Error(`Scheduled flow ${flowId} not found`);
  }

  if (!flow.isActive) {
    logger.warn({ flowId }, "Scheduled flow is not active, skipping");
    return { skipped: true, reason: "inactive" };
  }

  const executionId = `exec_${randomBytes(12).toString("base64url")}`;
  await queueManager.addFlowExecution(flowId, executionId, {
    trigger: {
      type: "SCHEDULE",
      scheduledAt: new Date().toISOString(),
    },
  });

  return { triggered: true, flowId, executionId };
}

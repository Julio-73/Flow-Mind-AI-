import { randomBytes } from "node:crypto";
import { queueManager } from "../queues.js";
import { DrizzleFlowRepository } from "@flowmind/database";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("queue:job:webhook-trigger");
const flowRepo = new DrizzleFlowRepository();

export interface WebhookTriggerPayload {
  webhookId: string;
  flowId: string;
  payload: Record<string, unknown>;
}

export async function webhookTriggerJob(payload: WebhookTriggerPayload): Promise<Record<string, unknown>> {
  const { flowId, webhookId, payload: webhookPayload } = payload;
  logger.info({ flowId, webhookId }, "Webhook flow triggered");

  const flow = await flowRepo.findById(flowId);
  if (!flow) {
    throw new Error(`Webhook flow ${flowId} not found`);
  }

  if (!flow.isActive) {
    logger.warn({ flowId }, "Webhook flow is not active");
    return { skipped: true, reason: "inactive" };
  }

  const executionId = `exec_${randomBytes(12).toString("base64url")}`;
  await queueManager.addFlowExecution(flowId, executionId, {
    trigger: { type: "WEBHOOK", webhookId, ...webhookPayload },
  });

  return { triggered: true, flowId, executionId };
}

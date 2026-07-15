import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { webhookTriggerJob } from "../jobs/webhook-trigger.js";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("queue:webhook-worker");

export function createWebhookWorker(connection: Redis): Worker {
  const worker = new Worker(
    "webhook-queue",
    async (job) => {
      logger.info({ jobId: job.id, data: job.data }, "Processing webhook trigger");
      return webhookTriggerJob(job.data);
    },
    {
      connection: connection as any,
      prefix: process.env["BULLMQ_PREFIX"] ?? "flowmind",
      concurrency: 10,
    },
  );

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Webhook trigger completed");
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, "Webhook trigger failed");
  });

  return worker;
}

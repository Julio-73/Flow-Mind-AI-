import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("queue:cleanup-worker");

export function createCleanupWorker(connection: Redis): Worker {
  const worker = new Worker(
    "cleanup-queue",
    async (job) => {
      logger.info({ jobId: job.id, data: job.data }, "Processing cleanup job");
      const { action } = job.data as { action: string };

      switch (action) {
        case "cleanup_old_executions":
          logger.info("Cleaning up old executions...");
          break;
        case "cleanup_expired_tokens":
          logger.info("Cleaning up expired tokens...");
          break;
        default:
          logger.warn({ action }, "Unknown cleanup action");
      }

      return { cleaned: true, action };
    },
    {
      connection: connection as any,
      prefix: process.env["BULLMQ_PREFIX"] ?? "flowmind",
      concurrency: 1,
    },
  );

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Cleanup completed");
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, "Cleanup failed");
  });

  return worker;
}

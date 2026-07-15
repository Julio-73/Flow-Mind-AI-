import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { executeFlowJob } from "../jobs/execute-flow.js";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("queue:flow-worker");

export function createFlowWorker(connection: Redis): Worker {
  const worker = new Worker(
    "flow-queue",
    async (job) => {
      logger.info({ jobId: job.id, data: job.data }, "Processing flow execution job");
      return executeFlowJob(job.data);
    },
    {
      connection: connection as any,
      prefix: process.env["BULLMQ_PREFIX"] ?? "flowmind",
      concurrency: 5,
      lockDuration: 60000,
      stalledInterval: 30000,
      maxStalledCount: 3,
    },
  );

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Flow execution completed");
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, "Flow execution failed");
  });

  worker.on("error", (err) => {
    logger.error({ error: err.message }, "Flow worker error");
  });

  logger.info("Flow worker created");
  return worker;
}

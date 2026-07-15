import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { scheduleFlowJob } from "../jobs/schedule-flow.js";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("queue:schedule-worker");

export function createScheduleWorker(connection: Redis): Worker {
  const worker = new Worker(
    "schedule-queue",
    async (job) => {
      logger.info({ jobId: job.id, data: job.data }, "Processing schedule job");
      return scheduleFlowJob(job.data);
    },
    {
      connection: connection as any,
      prefix: process.env["BULLMQ_PREFIX"] ?? "flowmind",
      concurrency: 3,
    },
  );

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Schedule job completed");
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, "Schedule job failed");
  });

  return worker;
}

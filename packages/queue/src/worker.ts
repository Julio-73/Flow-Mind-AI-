import { Redis } from "ioredis";
import { createFlowWorker } from "./workers/flow-worker.js";
import { createScheduleWorker } from "./workers/schedule-worker.js";
import { createWebhookWorker } from "./workers/webhook-worker.js";
import { createCleanupWorker } from "./workers/cleanup-worker.js";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("queue:worker");

async function main() {
  logger.info("Starting FlowMind workers...");

  const redisUrl = process.env["REDIS_URL"];
  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is required for workers");
  }
  const connection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  const workers = [
    createFlowWorker(connection),
    createScheduleWorker(connection),
    createWebhookWorker(connection),
    createCleanupWorker(connection),
  ];

  logger.info(`Started ${workers.length} workers`);

  const shutdown = async () => {
    logger.info("Shutting down workers...");
    await Promise.all(workers.map((w) => w.close()));
    await connection.quit();
    logger.info("All workers shut down");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  logger.error({ err }, "Failed to start workers");
  process.exit(1);
});

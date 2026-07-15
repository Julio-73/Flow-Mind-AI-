import { Queue, QueueEvents } from "bullmq";
import { Redis } from "ioredis";
import { createLogger } from "@flowmind/shared";

const logger = createLogger("queue");

let connection: Redis | null = null;

function getConnection(): Redis {
  if (!connection) {
    const redisUrl = process.env["REDIS_URL"];
    if (!redisUrl) {
      throw new Error("REDIS_URL environment variable is required for queue manager");
    }
    connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return connection;
}

const prefix = process.env["BULLMQ_PREFIX"] ?? "flowmind";
const defaultAttempts = parseInt(process.env["BULLMQ_DEFAULT_ATTEMPTS"] ?? "3", 10);
const backoffDelay = parseInt(process.env["BULLMQ_BACKOFF_DELAY"] ?? "2000", 10);

class QueueManager {
  private queues = new Map<string, Queue>();
  private events = new Map<string, QueueEvents>();
  private conn: Redis;

  constructor() {
    this.conn = getConnection();
  }

  private getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: this.conn as any,
        prefix,
        defaultJobOptions: {
          attempts: defaultAttempts,
          backoff: { type: "exponential", delay: backoffDelay },
          removeOnComplete: { age: 3600 * 24 * 7, count: 1000 },
          removeOnFail: { age: 3600 * 24 * 30, count: 100 },
        },
      });
      this.queues.set(name, queue);
      logger.info({ queue: name }, "Queue initialized");
    }
    return this.queues.get(name)!;
  }

  get flowQueue(): Queue {
    return this.getQueue("flow-queue");
  }

  get scheduleQueue(): Queue {
    return this.getQueue("schedule-queue");
  }

  get webhookQueue(): Queue {
    return this.getQueue("webhook-queue");
  }

  get cleanupQueue(): Queue {
    return this.getQueue("cleanup-queue");
  }

  async addFlowExecution(
    flowId: string,
    executionId: string,
    triggerData: Record<string, unknown>,
    delayMs?: number,
  ) {
    await this.flowQueue.add(
      "execute-flow",
      { flowId, executionId, triggerData },
      { delay: delayMs },
    );
    logger.info({ flowId, executionId }, "Flow execution queued");
  }

  async addScheduledFlow(
    flowId: string,
    scheduleId: string,
    scheduledAt: Date,
  ) {
    await this.scheduleQueue.add(
      "schedule-flow",
      { flowId, scheduleId },
      { delay: Math.max(0, scheduledAt.getTime() - Date.now()) },
    );
  }

  async addWebhookTrigger(
    webhookId: string,
    flowId: string,
    payload: Record<string, unknown>,
  ) {
    await this.webhookQueue.add(
      "webhook-trigger",
      { webhookId, flowId, payload },
    );
  }

  async closeAll(): Promise<void> {
    for (const [name, queue] of this.queues) {
      await queue.close();
      logger.info({ queue: name }, "Queue closed");
    }
    for (const [name, eq] of this.events) {
      await eq.close();
    }
    this.queues.clear();
    this.events.clear();
    if (this.conn) {
      await this.conn.quit();
      connection = null;
    }
  }
}

export const queueManager = new QueueManager();

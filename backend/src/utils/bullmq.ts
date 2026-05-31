import { config } from "@/config";
import { Job, Queue, QueueEvents, QueueOptions, Worker } from "bullmq";
import Redis from "ioredis";
import { logger } from "./logger";

export { Redis } from "ioredis";

const redisConnection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  enableReadyCheck: false,
  maxRetriesPerRequest: null, // BullMQ requires this to be null
});

/**
 * Default job options for all queues
 */
export const defaultJobOptions = {
  removeOnComplete: 100, // Keep last 100 completed jobs
  removeOnFail: 50, // Keep last 50 failed jobs
  attempts: 3, // Retry failed jobs 3 times
  backoff: {
    type: "exponential" as const,
    delay: 2000,
  },
};

/**
 * Default worker options for all workers
 */
export const defaultWorkerOptions = {
  connection: redisConnection,
  concurrency: 5, // Process up to 5 jobs concurrently
};

/**
 * Creates a new BullMQ queue with default configuration
 *
 * @param queueName - Name of the queue
 * @param customJobOptions - Custom default job options (optional)
 * @param queueOptions - Additional BullMQ queue options (optional)
 * @returns BullMQ Queue instance
 */
export function createQueue<T = any, R = any>(
  queueName: string,
  customJobOptions?: Partial<typeof defaultJobOptions>,
  queueOptions?: QueueOptions,
): Queue<T, R> {
  const queue = new Queue<T, R>(queueName, {
    connection: redisConnection,
    ...queueOptions,
    defaultJobOptions: {
      ...defaultJobOptions,
      ...customJobOptions,
    },
  });

  logger.info(`BullMQ queue created: ${queueName}`);
  return queue;
}

/**
 * Creates a new BullMQ worker with default configuration
 *
 * @param queueName - Name of the queue to process
 * @param processor - Job processor function
 * @param customOptions - Custom worker options (optional)
 * @returns BullMQ Worker instance
 */
export function createWorker<T = any, R = any>(
  queueName: string,
  processor: (job: Job<T>) => Promise<R>,
  customOptions?: Partial<typeof defaultWorkerOptions>,
): Worker<T, R> {
  const worker = new Worker<T, R>(queueName, processor, {
    ...defaultWorkerOptions,
    ...customOptions,
  });

  logger.info(`BullMQ worker created: ${queueName}`);
  return worker;
}

/**
 * Gracefully shuts down a worker
 *
 * @param worker - BullMQ Worker instance
 * @param queueName - Name of the queue (for logging)
 */
export async function shutdownWorker<T = any, R = any>(
  worker: Worker<T, R>,
  queueName: string,
): Promise<void> {
  try {
    logger.info(`Shutting down worker for queue: ${queueName}`);
    await worker.close();
    logger.info(`Worker shutdown complete for queue: ${queueName}`);
  } catch (error) {
    logger.error(`Error shutting down worker for queue: ${queueName}`, {
      error,
    });
  }
}

/**
 * Creates queue events listener for monitoring
 *
 * @param queueName - Name of the queue to monitor
 * @returns BullMQ QueueEvents instance
 */
export function createQueueEvents(queueName: string): QueueEvents {
  const queueEvents = new QueueEvents(queueName, {
    connection: redisConnection,
  });

  logger.info(`BullMQ queue events created: ${queueName}`);
  return queueEvents;
}

/**
 * Sets up standard event handlers for a worker
 *
 * @param worker - BullMQ Worker instance
 * @param queueName - Name of the queue (for logging)
 */
export function setupWorkerEvents<T = any, R = any>(
  worker: Worker<T, R>,
  queueName: string,
): void {
  worker.on("ready", () => {
    logger.info(`Worker ready for queue: ${queueName}`);
  });

  worker.on("active", (job) => {
    logger.info(`Job started in ${queueName}`, {
      jobId: job.id,
      jobName: job.name,
      attempts: job.attemptsMade,
    });
  });

  worker.on("completed", (job, result) => {
    logger.info(`Job completed in ${queueName}`, {
      jobId: job.id,
      jobName: job.name,
      duration:
        job.processedOn && job.finishedOn
          ? job.finishedOn - job.processedOn
          : undefined,
    });
  });

  worker.on("failed", (job, err) => {
    logger.error(`Job failed in ${queueName}`, {
      jobId: job?.id,
      jobName: job?.name,
      error: err.message,
      attempts: job?.attemptsMade,
    });
  });

  worker.on("stalled", (jobId) => {
    logger.warn(`Job stalled in ${queueName}`, { jobId });
  });
}

/**
 * Sets up standard event handlers for queue events
 *
 * @param queueEvents - BullMQ QueueEvents instance
 * @param queueName - Name of the queue (for logging)
 */
export function setupQueueEvents(
  queueEvents: QueueEvents,
  queueName: string,
): void {
  queueEvents.on("waiting", ({ jobId }) => {
    logger.info(`Job waiting in ${queueName}`, { jobId });
  });

  queueEvents.on("active", ({ jobId }) => {
    logger.info(`Job became active in ${queueName}`, { jobId });
  });

  queueEvents.on("completed", ({ jobId, returnvalue }) => {
    logger.info(`Job completed via events in ${queueName}`, { jobId });
  });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    logger.error(`Job failed via events in ${queueName}`, {
      jobId,
      reason: failedReason,
    });
  });

  queueEvents.on("stalled", ({ jobId }) => {
    logger.warn(`Job stalled via events in ${queueName}`, { jobId });
  });
}

/**
 * Adds a job to a queue with error handling
 *
 * @param queue - BullMQ Queue instance
 * @param jobName - Name of the job
 * @param jobData - Job data
 * @param options - Job options (optional)
 * @returns Promise<Job> The created job
 */
export async function addJob<T = any, R = any>(
  queue: Queue<T, R>,
  jobName: string,
  jobData: T,
  options?: any,
): Promise<Job<T, R>> {
  try {
    const job = await queue.add(jobName as any, jobData as any, options);
    logger.info(`Job added to queue: ${queue.name}`, {
      jobId: job.id,
      jobName,
    });
    return job as Job<T, R>;
  } catch (error: unknown) {
    logger.error(`Error adding job to queue: ${queue.name}`, {
      error,
      jobName,
      jobData,
    });
    throw error;
  }
}

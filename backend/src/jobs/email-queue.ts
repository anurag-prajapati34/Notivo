import { Email, NewEmailAttempt } from "@/database/schema";
import { EmailJobData, EmailResult, sendUserEmail } from "@/email";
import {
  insertEmailAttemptQuery,
  updateEmailQuery,
} from "@/routes/v1/email/queries";
import { addJob, createQueue, createWorker } from "@/utils/bullmq";
import { emailStatus } from "@/utils/enum";
import { logger } from "@/utils/logger";
import { Job, JobsOptions, Queue, Worker } from "bullmq";

/**
 * The unique name designation for the BullMQ email processing queue.
 * Used to isolate email jobs from other background tasks in Redis.
 */
export const EMAIL_QUEUE_NAME = "email-queue";

/**
 * BullMQ Queue instance managing the lifecycle of asynchronous email jobs.
 * Acts as the producer interface to buffer email payloads in Redis before worker consumption.
 * * @type {Queue<EmailJobData, EmailResult>}
 */
export const emailQueue = createQueue<EmailJobData, EmailResult>(
  EMAIL_QUEUE_NAME,
);

/**
 * Functional message consumer execution block triggered by BullMQ whenever an active job reservation lands on the thread pool.
 * Integrates directly with downstream email client abstractions to execute formatting and transmission routines.
 * * @async
 * @param {Job<EmailJobData, EmailResult>} job - The underlying metadata instance unsealed directly from Redis storage parameters.
 * @returns {Promise<EmailResult>} Resolves with receipt payload indicating message completion vectors and server receipt IDs.
 * @throws {Error} Throws explicit runtime delivery errors, automatically signaling BullMQ to evaluate backoff logic cycles.
 */
export const processEmailJob = async (
  job: Job<EmailJobData>,
): Promise<EmailResult> => {
  const attemptNumber = job.attemptsMade + 1;
  const { emailData } = job.data;
  try {
    //Update status to processing
    await updateEmailQuery(emailData.emailId, {
      emailStatus: emailStatus.PROCESSING,
      attempts: attemptNumber,
      lastErrorMessage: null,
    });

    logger.info("Processing email job", { jobId: job.id });
    const result = await sendUserEmail(job.data);

    const emalAttempt = {
      emailId: emailData.emailId,
      attemptNumber,
      attemptedAt: new Date(),
      emailStatus: result.success ? emailStatus.DELIVERED : emailStatus.FAILED,
      errorMessage: result.success ? null : result.error,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as NewEmailAttempt;

    const updatedEmail = {
      attempts: attemptNumber,
      updatedAt: new Date(),
      ...(result.success
        ? {
            emailStatus: emailStatus.DELIVERED,
            deliveredAt: new Date(),
          }
        : {
            emailStatus: emailStatus.FAILED,
            lastErrorMessage: result.error,
          }),
    } as Partial<Email>;

    await Promise.all([
      updateEmailQuery(emailData.emailId, updatedEmail),
      insertEmailAttemptQuery([emalAttempt]),
    ]);

    logger.info("Email job processed", { jobId: job.id, result });
    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Error processing email job", { jobId: job.id, error });
    const emalAttempt = {
      emailId: emailData.emailId,
      attemptNumber,
      attemptedAt: new Date(),
      emailStatus: emailStatus.FAILED,
      errorMessage: errorMessage,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as NewEmailAttempt;

    const updatedEmail = {
      attempts: attemptNumber,
      updatedAt: new Date(),
      emailStatus: emailStatus.FAILED,
      lastErrorMessage: errorMessage,
    } as Partial<Email>;
    await Promise.all([
      updateEmailQuery(emailData.emailId, updatedEmail),
      insertEmailAttemptQuery([emalAttempt]),
    ]);
    throw error;
  }
};
/**
 * Pushes a new email payload into the asynchronous background queue with automated retry safety nets.
 * Includes a deliberate 1-second delay execution window to guarantee database transactions
 * (like initial user provisioning) have concluded before notification dispatch.
 * * @async
 * @param {EmailJobData} jobData - Complete payload containing recipient address, subject line, and structural data variables.
 * @param {string} [jobName="email-job"] - Logical descriptor name for distinguishing job mutations within dashboard utilities.
 * @param {Partial<JobsOptions>} [options={}] - Secondary runtime runtime configuration overrides (e.g., localized scheduling or priority bumps).
 * @returns {Promise<Job<EmailJobData, EmailResult>>} Resolves with the newly tracked BullMQ job metadata receipt object.
 * @throws {Error} Bubbles up raw integration faults if communication or serialization with the underlying Redis pool breaks down.
 * * @example
 * ```typescript
 * await addEmailJob({ to: "user@example.com", subject: "Welcome!", templateId: "welcome-id" });
 * ```
 */
export const addEmailJob = async (
  jobData: EmailJobData,
  jobName: string = "email-job",
  options: Partial<JobsOptions> = {},
) => {
  try {
    const jobOptions: JobsOptions = {
      priority: 0,
      attempts: 3, // Retry up to 3 times on failure
      backoff: {
        type: "exponential" as const,
        delay: 2000, // Base wait before retrying (2s, then 4s, etc.)
      },
      removeOnComplete: 50, // Keep historical trail of the last 50 successful executions
      removeOnFail: 25, // Keep historical trail of the last 25 failed executions
      ...options, // Caller-supplied overrides take precedence
    };
    const job = addJob(emailQueue, jobName, jobData, jobOptions);
    return job;
  } catch (error: unknown) {
    logger.error("Error adding email job to queue", {
      error,
      jobName,
      jobData,
      options,
    });
    throw error;
  }
};

/**
 * Cached background singleton reference holding onto the primary active consumer worker registration.
 * Prevents multiple socket bindings from initializing over identical queue targets on individual service boundaries.
 * * @type {Worker<EmailJobData, EmailResult> | null}
 * @private
 */
let _emailWorker: ReturnType<
  typeof createWorker<EmailJobData, EmailResult>
> | null = null;

/**
 * Accessor method using lazy evaluation rules to initialize or retrieve the active queue processing consumer.
 * Isolates consumer threads from web APIs, making sure execution boundaries only trigger within specialized environments.
 * * @returns {Worker<EmailJobData, EmailResult>} The persistent BullMQ worker reference configured to digest automated communication traffic.
 */
export const getEmailWorker = () => {
  if (!_emailWorker) {
    _emailWorker = createWorker<EmailJobData, EmailResult>(
      EMAIL_QUEUE_NAME,
      processEmailJob,
    );
    logger.info("Email worker initialized (worker-only)");
  }
  return _emailWorker;
};

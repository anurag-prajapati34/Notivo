import { logger } from "@/utils/logger";
import { EMAIL_QUEUE_NAME, getEmailWorker } from "./email-queue";
import { shutdownWorker } from "@/utils/bullmq";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Starts the background job worker and sets up event handlers
 */
async function startBackgroundWorker() {
  try {
    await getEmailWorker();
    logger.info("Background job worker started successfully");
    // Keep the process running
    process.on("SIGINT", async () => {
      logger.info("Shutting down background job worker...");
      await shutdownWorker(getEmailWorker(), EMAIL_QUEUE_NAME);
      process.exit(0);
    });
    process.on("SIGTERM", async () => {
      logger.info("Shutting down background job worker...");
      await shutdownWorker(getEmailWorker(), EMAIL_QUEUE_NAME);
      process.exit(0);
    });
  } catch (error: unknown) {
    logger.error("Failed to start background job worker", { error });
    process.exit(1);
  }
}

/**
 * Robust cross-platform check to see if this file was run directly.
 * Works seamlessly across Windows (backslash) and POSIX systems.
 */
const executionFilePath = process.argv[1];
const currentFilePath = fileURLToPath(import.meta.url);
if (
  executionFilePath &&
  currentFilePath === fileURLToPath(pathToFileURL(executionFilePath))
) {
  startBackgroundWorker();
}
export { startBackgroundWorker };

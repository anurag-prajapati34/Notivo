import express from "express";
import { logger } from "@/utils/logger.js";
import { EMAIL_QUEUE_NAME, getEmailWorker } from "./email-queue.js";
import { shutdownWorker } from "@/utils/bullmq.js";
import { fileURLToPath, pathToFileURL } from "node:url";
import { config } from "@/config/index.js";
import { startScheduledSelfPinging } from "@/utils/server-helper.js";

const app = express();
const PORT = process.env.PORT || 3002;

// Render will hit this URL to confirm the container is alive
app.get("/health", (req, res) => {
  res.status(200).send("Worker is actively polling queues.");
});

/**
 * Starts the background job worker and sets up event handlers
 */
async function startBackgroundWorker() {
  try {
    await getEmailWorker();
    logger.info("Background job worker started successfully");

    // 2. Start the HTTP health check server
    app.listen(PORT, () => {
      logger.info(`✅ Render health check listener active on port ${PORT}`);
    });
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

    // 3. Start the scheduled self-pinging daemon
    // Activate in production mode
    if (process.env.NODE_ENV) {
      if (config.workerUrl) {
        startScheduledSelfPinging(`${config.workerUrl}/health`);
      } else {
        logger.error("❌ Server URL not found in config.");
      }
    } else {
      logger.info("⏭️NODE_ENV not set. Skipping scheduled self-pinging.");
    }
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

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { config } from "./config/index.js";
import { testConnection } from "./database/connection.js";
import { initializeDatabase } from "./database/init.js";
import v1 from "./routes/v1/index.js";
import { apiRequestLogger, logger } from "./utils/logger.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://notivo-q59p1jej0-anurag-prajapatis-projects.vercel.app",
      "https://notivo-gilt.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders: ["Content-Length", "X-Requested-With"],
  }),
);

/**
 * Smart self-ping scheduler designed to keep Render Free Tier containers awake
 * strictly during high-visibility daytime hours to optimize free instance limits.
 * * @param {string} url - The complete target destination health check endpoint.
 */
const startScheduledSelfPinging = (url: string) => {
  const minutes = Number(process.env.healthPingInterval || "12");
  const INTERVAL_MINUTES = minutes * 60 * 1000; // Keeps container warm before the 15-minute sleep deadline

  logger.info(
    `📡 [Engine Wakeup] Scheduled self-ping daemon active. Target window: 09:00 - 21:00 server time for every ${minutes} minutes. Endpoint: ${url}`,
  );

  setInterval(async () => {
    const now = new Date();
    const currentHour = now.getHours();
    const timestamp = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // ⏰ Restrict active processing pings strictly between 9:00 AM and 9:00 PM
    if (currentHour >= 11 && currentHour < 19) {
      try {
        const startTime = performance.now();
        const response = await fetch(url);
        const duration = (performance.now() - startTime).toFixed(0);

        if (response.ok) {
          logger.info(
            `📡 [Ping Success] [${timestamp}] Inbound heartbeat received by ${url} | Status: ${response.status} | Latency: ${duration}ms`,
          );
        } else {
          logger.warn(
            `⚠️ [Ping Warning] [${timestamp}] Destination reached but returned non-200 status | URL: ${url} | Status: ${response.status}`,
          );
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown network exception";
        logger.error(
          `❌ [Ping Failure] [${timestamp}] Egress connection timeout or handshake drop | Target: ${url} | Reason: ${message}`,
        );
      }
    } else {
      // Quiet window throttling block
      logger.info(
        `💤 [Ping Sleep] [${timestamp}] Current hour (${currentHour}:00) falls outside active window. Throttling outbound requests to conserve free tier hours.`,
      );
    }
  }, INTERVAL_MINUTES);
};

/**
 * Preflight CORS handling for all routes.
 *
 * @description
 * Handles CORS preflight requests for all routes to ensure
 * proper cross-origin request handling.
 *
 * @since 1.0.0
 * @author System Administrator
 */
// app.options("*", cors()); // ✅ handles preflight

//Start Server
async function startServer() {
  try {
    // Initialize database (check existence, create if needed, run setup)
    const dbInitialized = await initializeDatabase();

    if (!dbInitialized) {
      logger.error("❌ Database initialization failed. Shutting down...");
      process.exit(1);
    }

    // Test database connection before starting server
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error("❌ Failed to connect to database. Shutting down...");
      process.exit(1);
    }
    logger.info("✅ Database connection pool initialized");
    // Log application startup information
    logger.info("Application started", {
      cwd: process.cwd(),
      nodeEnv: config.nodeEnv,
    });

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${config.nodeEnv}`);
    });
    // Handle server errors
    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        logger.error(`❌ Port ${PORT} is already in use`);
      } else {
        logger.error("❌ Server error:", error.message);
      }
      process.exit(1);
    });

    // Activate in production mode
    if (process.env.NODE_ENV) {
      if (config.url) {
        startScheduledSelfPinging(`${config.url}/health`);
      } else {
        logger.error("❌ Server URL not found in config.");
      }
    } else {
      logger.info("⏭️NODE_ENV not set. Skipping scheduled self-pinging.");
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error("❌ Failed to start server:", errorMessage);
    process.exit(1);
  }
}

/**
 * Starts the application with comprehensive error handling.
 *
 * @description
 * Initiates the application startup sequence with proper error
 * handling and process management. Catches any unhandled errors
 * during startup and provides appropriate logging.
 *
 * @since 1.0.0
 * @author System Administrator
 */
startServer().catch((error) => {
  logger.error("❌ Unhandled error during startup:", error);
  process.exit(1);
});

// Log any incomming api requests
app.use(apiRequestLogger);
// Register routes
app.use("/api/v1", v1);
app.get("/health", (req, res) => res.send("OK"));

export default app;

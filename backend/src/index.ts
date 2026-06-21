import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { config } from "./config";
import { testConnection } from "./database/connection";
import { initializeDatabase } from "./database/init";
import v1 from "./routes/v1/index.ts";
import { apiRequestLogger, logger } from "./utils/logger";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
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

export default app;

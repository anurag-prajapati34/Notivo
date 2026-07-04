//Databse initialization

import { config } from "@/config/index.js";
import { logger } from "@/utils/logger.js";
import mysql from "mysql2/promise";

/**
 * Check if database initialization is enabled
 * Controlled via AUTO_SETUP_DB environment variable
 */
export const isDatabaseInitEnabled = (): boolean => {
  return process.env.AUTO_SETUP_DB === "true";
};

/**
 * Check if a database exists
 *
 * @param connection - MySQL connection (without database specified)
 * @param databaseName - Name of the database to check
 * @returns Promise<boolean> - True if database exists, false otherwise
 */
export async function databaseExists(
  connection: mysql.Connection,
  databaseName: string,
): Promise<boolean> {
  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [databaseName],
    );
    return rows.length > 0;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`❌ Error checking database existence: ${errorMessage}`);
    return false;
  }
}

/**
 * Create a database
 *
 * @param connection - MySQL connection (without database specified)
 * @param databaseName - Name of the database to create
 * @returns Promise<void>
 */
export async function createDatabase(
  connection: mysql.Connection,
  databaseName: string,
): Promise<void> {
  try {
    // Escape database name to prevent SQL injection
    const escapedName = connection.escapeId(databaseName);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${escapedName}`);
    logger.info(`✅ Database '${databaseName}' created successfully`);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`❌ Error creating database: ${errorMessage}`);
    throw error;
  }
}
export async function initializeDatabase() {
  //Check if auto -setup is enabled
  if (!isDatabaseInitEnabled()) {
    logger.info(
      "⏭️  Database auto-initialization is disabled (AUTO_SETUP_DB not set to true)",
    );
    return false;
  }

  //Initialize the database
  logger.info("🔍 Checking database initialization...");
  logger.info(`🌐 Database host: ${config.DB.HOST}:${config.DB.PORT}`);
  logger.info(`📦 Database name: ${config.DB.DATABASE}`);

  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
      host: config.DB.HOST,
      user: config.DB.USER,
      password: config.DB.PASSWORD,
      port: config.DB.PORT,
    });

    logger.info("✅ Connected to MySQL server (without database)");
    const databaseName = config.DB.DATABASE;

    //check if database exists
    const exists = await databaseExists(connection, databaseName);
    if (!exists) {
      // Database doesn't exist, create it
      logger.info(`📦 Database '${databaseName}' not found. Creating...`);
      await createDatabase(connection, databaseName);
    } else {
      logger.info(`📦 Database '${databaseName}' already exists`);
    }

    // Close the connection without database
    await connection.end();
    connection = null;
    logger.info("✅ Database initialization completed successfully");
    return true;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`❌ Database initialization failed: ${errorMessage}`);

    if (error instanceof Error && error.stack) {
      logger.error("Stack trace:", error.stack);
    }

    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        logger.error("❌ Error closing connection:", closeError);
      }
    }

    return false;
  }
}

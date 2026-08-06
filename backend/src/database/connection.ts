import { config } from "@/config/index.js";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

/**This file to be used to connect to the database */
const pool = mysql.createPool({
  host: config.DB.HOST,
  user: config.DB.USER,
  password: config.DB.PASSWORD,
  database: config.DB.DATABASE,
  port: config.DB.PORT,

  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const db = drizzle(pool);

// Validate required environment variables
const validateDatabaseConfig = () => {
  const required = ["DB_HOST", "DB_USERNAME", "DB_PASSWORD", "DB_NAME"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      "❌ Missing required database environment variables:",
      missing.join(", "),
    );
    console.error("💡 Please set the following environment variables:");
    missing.forEach((key) => {
      console.error(`   ${key}=your_value`);
    });
    console.error("💡 Or create a .env file with these variables");
    return false;
  }
  return true;
};

// Note: MySQL TIMESTAMP columns always store values in UTC internally
// We handle timezone conversions in application code when reading/writing dates
// Test connection pool with modern error handling
export async function testConnection(): Promise<boolean> {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log("✅ Database connection pool successful");
    return true;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Database connection pool failed:", errorMessage);

    // Check if it's a configuration issue
    if (!validateDatabaseConfig()) {
      console.error("💡 This might be due to missing environment variables");
    }

    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

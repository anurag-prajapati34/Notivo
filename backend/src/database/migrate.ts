import { db } from "./connection.js";
import { migrate } from "drizzle-orm/mysql2/migrator";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log("⏳ Starting database migrations...");
  try {
    const migrationsFolder = path.resolve(__dirname, "../../drizzle");
    console.log(`📂 Migrations folder path: ${migrationsFolder}`);

    await migrate(db, { migrationsFolder });

    console.log("✅ Database migrations applied successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Migration failed with error:", error);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

runMigrations();

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "notivo",
  port: Number(process.env.DB_PORT) || 3306,
});

async function run() {
  try {
    const [sendgridCols] = await pool.query("DESCRIBE `sendgrid_email_creds`");
    console.log("--- sendgrid_email_creds columns ---");
    console.log(sendgridCols);

    const [smtpCols] = await pool.query("DESCRIBE `smtp_email_creds`");
    console.log("\n--- smtp_email_creds columns ---");
    console.log(smtpCols);
  } catch (err: any) {
    console.error("Error:", err.message);
  }
  process.exit(0);
}
run();

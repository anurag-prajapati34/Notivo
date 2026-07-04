import {
  bigint,
  boolean,
  foreignKey,
  index,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users.js";
import { auditFields } from "@/utils/db-schema-helpers.js";

export const emails = mysqlTable(
  "emails",
  {
    emailId: bigint("email_id", { mode: "number" })
      .primaryKey()
      .autoincrement(),
    userId: bigint("user_id", { mode: "number" }),
    templateId: varchar("template_id", { length: 100 }),

    toEmail: varchar("to_email", { length: 255 }),
    subject: varchar("subject", { length: 500 }),
    body: text("body"),

    // Tracking
    emailStatus: varchar("email_status", { length: 100 }), //EmailStatus
    attempts: bigint("attempts", { mode: "number" }).default(0),
    lastErrorMessage: varchar("last_error_message", { length: 1000 }),
    // bullJobId: varchar("bull_job_id", { length: 255 }),

    deliveredAt: timestamp("delivered_at"),

    ...auditFields,
  },
  (table) => [
    index("idx_emails_to_email").on(table.toEmail),
    index("idx_email_status").on(table.emailStatus),
    index("idx_emails_user_id").on(table.userId),
    index("idx_emails_created_at").on(table.createdAt),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.userId],
      name: "fk_emails_users",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export type Email = typeof emails.$inferSelect;
export type NewEmail = typeof emails.$inferInsert;

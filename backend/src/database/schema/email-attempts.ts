// src/db/schema/emailAttempts.ts
import {
  bigint,
  foreignKey,
  index,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { emails } from "./emails.js";
import { auditFields } from "@/utils/db-schema-helpers.js";

export const emailAttempts = mysqlTable(
  "email_attempts",
  {
    emailAttemptId: bigint("attempt_id", { mode: "number" })
      .primaryKey()
      .autoincrement(),
    emailId: bigint("email_id", { mode: "number" }).notNull(),
    attemptNumber: bigint("attempt_number", { mode: "number" }).notNull(),
    emailStatus: varchar("email_status", { length: 100 }).notNull(), //EmailStatus
    errorMessage: text("error_message"),
    attemptedAt: timestamp("attempted_at").defaultNow(),
    ...auditFields,
  },
  (table) => [
    index("idx_attempts_email_id").on(table.emailId),
    foreignKey({
      columns: [table.emailId],
      foreignColumns: [emails.emailId],
      name: "fk_attempts_emails",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export type EmailAttempt = typeof emailAttempts.$inferSelect;
export type NewEmailAttempt = typeof emailAttempts.$inferInsert;

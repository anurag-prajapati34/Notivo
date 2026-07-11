import { auditFields } from "@/utils/db-schema-helpers.js";
import {
  bigint,
  boolean,
  foreignKey,
  index,
  mysqlTable,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users.js";

export const smtpEmailCreds = mysqlTable(
  "smtp_email_creds",
  {
    smtpEmailCredsId: bigint("smtp_email_creds_id", { mode: "number" })
      .primaryKey()
      .autoincrement(),
    userId: bigint("user_id", { mode: "number" }),
    username: varchar("username", { length: 255 }).notNull(),
    passKey: varchar("pass_key", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    host: varchar("host", { length: 255 }).notNull(),
    port: bigint("port", { mode: "number" }).notNull(),
    secure: boolean("secure").default(false).notNull(),
    ...auditFields,
  },
  (table) => [
    index("idx_smtp_email_creds_email").on(table.email),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.userId],
      name: "fk_smtp_email_creds_users",
    }),
  ],
);

export type SmtpEmailCreds = typeof smtpEmailCreds.$inferSelect;
export type NewSmtpEmailCreds = typeof smtpEmailCreds.$inferInsert;

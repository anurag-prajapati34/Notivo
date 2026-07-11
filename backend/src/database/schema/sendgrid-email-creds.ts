import { auditFields } from "@/utils/db-schema-helpers.js";
import {
  bigint,
  foreignKey,
  mysqlTable,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users";
export const sendgridEmailCreds = mysqlTable(
  "sendgrid_email_creds",
  {
    sendgridEmailCredsId: bigint("sendgrid_email_creds_id", { mode: "number" })
      .primaryKey()
      .autoincrement(),
    userId: bigint("user_id", { mode: "number" }),
    apiKey: varchar("api_key", { length: 255 }).notNull(),
    email: varchar("from", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    ...auditFields,
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.userId],
      name: "fk_sendgrid_email_creds_users",
    }),
  ],
);

export type SendgridEmailCreds = typeof sendgridEmailCreds.$inferSelect;
export type NewSendgridEmailCreds = typeof sendgridEmailCreds.$inferInsert;

import { auditFields } from "@/utils/db-schema-helpers";
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
import { users } from "./users";

export const emailCreds = mysqlTable(
  "email_creds",
  {
    emailCredsId: bigint("email_creds_id", { mode: "number" })
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
    index("idx_email_creds_email").on(table.email),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.userId],
      name: "fk_email_creds_users",
    }),
  ],
);

export type EmailCreds = typeof emailCreds.$inferSelect;
export type NewEmailCreds = typeof emailCreds.$inferInsert;

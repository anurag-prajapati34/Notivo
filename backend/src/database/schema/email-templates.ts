import { auditFields } from "@/utils/db-schema-helpers";
import {
  bigint,
  foreignKey,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

export const emailTemplates = mysqlTable(
  "email_templates",
  {
    emailTemplateId: bigint("email_template_id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    templateId: varchar("template_id", { length: 100 }).notNull().unique(),
    userId: bigint("user_id", { mode: "number" }),

    name: varchar("name", { length: 100 }).notNull(),

    slug: varchar("slug", { length: 100 }).notNull().unique(),

    subject: varchar("subject", { length: 255 }).notNull(),

    html: text("html").notNull(),

    description: text("description"),
    ...auditFields,
  },
  (table) => [
    uniqueIndex("uq_email_templates_slug").on(table.slug),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.userId],
      name: "fk_email_templates_users",
    }),
  ],
);

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;

import { auditFields } from "@/utils/db-schema-helpers.js";
import {
  bigint,
  foreignKey,
  index,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./users.js";

export const emailTemplates = mysqlTable(
  "email_templates",
  {
    emailTemplateId: bigint("email_template_id", { mode: "number" })
      .primaryKey()
      .autoincrement(),

    templateId: varchar("template_id", { length: 100 }).notNull(),
    userId: bigint("user_id", { mode: "number" }),

    name: varchar("name", { length: 100 }).notNull(),

    slug: varchar("slug", { length: 100 }).notNull(),

    subject: varchar("subject", { length: 255 }).notNull(),

    html: text("html").notNull(),

    description: text("description"),
    ...auditFields,
  },
  (table) => [
    index("idx_email_templates_slug").on(table.slug),
    uniqueIndex("uq_email_templates_template_id").on(table.templateId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.userId],
      name: "fk_email_templates_users",
    }),
  ],
);

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;

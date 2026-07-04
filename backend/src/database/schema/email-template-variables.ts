import { auditFields } from "@/utils/db-schema-helpers.js";
import {
  bigint,
  boolean,
  foreignKey,
  index,
  mysqlTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { emailTemplates } from "./email-templates.js";

export const emailTemplateVariables = mysqlTable(
  "email_template_variables",
  {
    emailTemplateVariableId: bigint("email_template_variable_id", {
      mode: "number",
    })
      .primaryKey()
      .autoincrement(),

    templateId: varchar("template_id", { length: 100 }).notNull(),

    variableName: varchar("variable_name", {
      length: 100,
    }).notNull(),

    isRequired: boolean("is_required").default(true).notNull(),

    defaultValue: varchar("default_value", {
      length: 255,
    }),

    ...auditFields,
  },
  (table) => [
    index("idx_email_template_variables_template").on(table.templateId),
    uniqueIndex("uq_email_template_variable").on(
      table.templateId,
      table.variableName,
    ),
    foreignKey({
      columns: [table.templateId],
      foreignColumns: [emailTemplates.templateId],
      name: "fk_email_template_variables_template",
    }),
  ],
);

export type EmailTemplateVariable = typeof emailTemplateVariables.$inferSelect;

export type NewEmailTemplateVariable =
  typeof emailTemplateVariables.$inferInsert;

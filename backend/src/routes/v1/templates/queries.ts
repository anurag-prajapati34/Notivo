import { db } from "@/database/connection.js";
import {
  emailTemplates,
  emailTemplateVariables,
  NewEmailTemplate,
  NewEmailTemplateVariable,
} from "@/database/schema/index.js";
import { TransactionContext } from "@/utils/types.js";
import { and, desc, eq, inArray, isNull, ne, or } from "drizzle-orm";

export const getTemplatesByUserIdQuery = async (
  userId: number,
  trx: TransactionContext = db,
) => {
  return await trx
    .select()
    .from(emailTemplates)
    .where(
      and(
        or(eq(emailTemplates.userId, userId), isNull(emailTemplates.userId)),
        eq(emailTemplates.status, true),
      ),
    )
    .orderBy(desc(emailTemplates.createdAt));
};

export const getTemplateByTemplateIdAndUserIdQuery = async (
  templateId: string,
  userId: number,
  trx: TransactionContext = db,
) => {
  const result = await trx
    .select()
    .from(emailTemplates)
    .where(
      and(
        eq(emailTemplates.templateId, templateId),
        or(eq(emailTemplates.userId, userId), isNull(emailTemplates.userId)),
        eq(emailTemplates.status, true),
      ),
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
};

export const checkTemplateSlugExistsQuery = async (
  slug: string,
  userId: number,
  excludeTemplateId?: string,
  trx: TransactionContext = db,
) => {
  const conditions = [
    eq(emailTemplates.slug, slug),
    eq(emailTemplates.userId, userId),
    eq(emailTemplates.status, true),
  ];

  if (excludeTemplateId) {
    conditions.push(ne(emailTemplates.templateId, excludeTemplateId));
  }

  const result = await trx
    .select({ templateId: emailTemplates.templateId })
    .from(emailTemplates)
    .where(and(...conditions))
    .limit(1);

  return result.length > 0;
};

export const createTemplateQuery = async (
  data: NewEmailTemplate,
  trx: TransactionContext = db,
) => {
  return await trx.insert(emailTemplates).values(data);
};

export const updateTemplateQuery = async (
  templateId: string,
  userId: number,
  data: Partial<NewEmailTemplate>,
  trx: TransactionContext = db,
) => {
  return await trx
    .update(emailTemplates)
    .set(data)
    .where(
      and(
        eq(emailTemplates.templateId, templateId),
        eq(emailTemplates.userId, userId),
      ),
    );
};

export const deleteTemplateQuery = async (
  templateId: string,
  userId: number,
  trx: TransactionContext = db,
) => {
  return await trx
    .delete(emailTemplates)
    .where(
      and(
        eq(emailTemplates.templateId, templateId),
        eq(emailTemplates.userId, userId),
      ),
    );
};

export const insertTemplateVariablesQuery = async (
  variables: NewEmailTemplateVariable[],
  trx: TransactionContext = db,
) => {
  if (variables.length === 0) return;
  return await trx.insert(emailTemplateVariables).values(variables);
};

export const deleteTemplateVariablesByTemplateIdQuery = async (
  templateId: string,
  trx: TransactionContext = db,
) => {
  return await trx
    .delete(emailTemplateVariables)
    .where(eq(emailTemplateVariables.templateId, templateId));
};

export const getTemplateVariablesByTemplateIdQuery = async (
  templateId: string,
  trx: TransactionContext = db,
) => {
  return await trx
    .select()
    .from(emailTemplateVariables)
    .where(
      and(
        eq(emailTemplateVariables.templateId, templateId),
        eq(emailTemplateVariables.status, true),
      ),
    );
};

export const getTemplateVariablesByTemplateIdsQuery = async (
  templateIds: string[],
  trx: TransactionContext = db,
) => {
  if (templateIds.length === 0) return [];
  return await trx
    .select()
    .from(emailTemplateVariables)
    .where(
      and(
        inArray(emailTemplateVariables.templateId, templateIds),
        eq(emailTemplateVariables.status, true),
      ),
    );
};

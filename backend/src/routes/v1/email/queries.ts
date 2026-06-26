import { db } from "@/database/connection";
import {
  Email,
  EmailCreds,
  emailCreds,
  emails,
  emailTemplates,
  emailTemplateVariables,
  NewEmail,
  NewEmailCreds,
} from "@/database/schema";
import { TransactionContext } from "@/utils/types";
import { and, eq, inArray, sql } from "drizzle-orm";

export const insertEmailsQuery = (
  payload: NewEmail[],
  trx: TransactionContext = db,
) => {
  return trx.insert(emails).values(payload);
};

export const updateEmailQuery = async (
  emailId: number,
  input: Partial<Email>,
  trx: TransactionContext = db,
) => {
  return await trx.update(emails).set(input).where(eq(emails.emailId, emailId));
};

export const insertEmailCredsQuery = async (input: NewEmailCreds) => {
  return await db.insert(emailCreds).values(input);
};

export const updateEmailCredsQuery = async (
  emailCredsId: number,
  input: Partial<EmailCreds>,
) => {
  return await db
    .update(emailCreds)
    .set(input)
    .where(eq(emailCreds.emailCredsId, emailCredsId));
};

export const getEmailCredsQuery = async (input: {
  emailCredsId?: number;
  userId?: number;
  email?: string;
}) => {
  const whereConditions = [eq(emailCreds.status, true)];

  if (input.userId) {
    whereConditions.push(eq(emailCreds.userId, input.userId));
  }
  if (input.email) {
    whereConditions.push(eq(emailCreds.email, input.email));
  }
  if (input.emailCredsId) {
    whereConditions.push(eq(emailCreds.emailCredsId, input.emailCredsId));
  }

  return await db
    .select({
      emailCredsId: emailCreds.emailCredsId,
      email: emailCreds.email,
      passKey: emailCreds.passKey,
      userId: emailCreds.userId,
    })
    .from(emailCreds)
    .where(and(...whereConditions));
};

export const getEmailTemplatesQuery = async (input?: {
  templateIds: string[];
}) => {
  const whereConditions = [eq(emailTemplates.status, true)];

  if (input && input.templateIds && input.templateIds.length > 0) {
    whereConditions.push(inArray(emailTemplates.templateId, input.templateIds));
  }
  return await db
    .select({
      templateId: emailTemplates.templateId,
      name: emailTemplates.name,
      subject: emailTemplates.subject,
      html: emailTemplates.html,
      slug: emailTemplates.slug,
      description: emailTemplates.description,
      userId: emailTemplates.userId,
    })
    .from(emailTemplates)
    .where(and(...whereConditions));
};

export const getEmailTemplateVariablesQuery = async (input: {
  templateIds?: string[];
}) => {
  const { templateIds } = input;
  const whereConditions = [eq(emailTemplateVariables.status, true)];

  if (templateIds && templateIds.length > 0) {
    whereConditions.push(
      inArray(emailTemplateVariables.templateId, templateIds),
    );
  }

  return await db
    .select({
      variableName: emailTemplateVariables.variableName,
      isRequired: emailTemplateVariables.isRequired,
      templateId: emailTemplateVariables.templateId,
      defaultValue: emailTemplateVariables.defaultValue,
    })
    .from(emailTemplateVariables)
    .where(and(...whereConditions));
};

export const getEmailTemplatesWithVariablesQuery = async () => {
  const emailTemplate = await getEmailTemplatesQuery();

  const templateIds = emailTemplate.map((template) => template.templateId);
  const variables = await getEmailTemplateVariablesQuery({
    templateIds,
  });
  const result = emailTemplate.map((template) => ({
    ...template,
    variables: variables.filter(
      (variable) => variable.templateId === template.templateId,
    ),
  }));

  return result;
};

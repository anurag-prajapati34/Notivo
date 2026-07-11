import { db } from "@/database/connection.js";
import {
  Email,
  emailAttempts,
  emails,
  emailTemplates,
  emailTemplateVariables,
  NewEmail,
  NewEmailAttempt,
  sendgridEmailCreds,
  smtpEmailCreds,
} from "@/database/schema/index.js";
import { TransactionContext } from "@/utils/types.js";
import { and, desc, eq, inArray } from "drizzle-orm";

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

export const getSmtpEmailCredsQuery = async (input: { userId?: number }) => {
  const whereConditions = [eq(smtpEmailCreds.status, true)];

  if (input.userId) {
    whereConditions.push(eq(smtpEmailCreds.userId, input.userId));
  }
  return await db
    .select()
    .from(smtpEmailCreds)
    .where(and(...whereConditions));
};

export const getSendgridEmailCredsQuery = async (input: {
  userId?: number;
}) => {
  const whereConditions = [eq(sendgridEmailCreds.status, true)];

  if (input.userId) {
    whereConditions.push(eq(sendgridEmailCreds.userId, input.userId));
  }
  return await db
    .select()
    .from(sendgridEmailCreds)
    .where(and(...whereConditions));
};

export const getEmailTemplatesQuery = async (input?: {
  templateIds?: string[];
  slugs?: string[];
}) => {
  const whereConditions = [eq(emailTemplates.status, true)];

  if (input && input.templateIds && input.templateIds.length > 0) {
    whereConditions.push(inArray(emailTemplates.templateId, input.templateIds));
  }

  if (input && input.slugs && input.slugs.length > 0) {
    whereConditions.push(inArray(emailTemplates.slug, input.slugs));
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
    .where(and(...whereConditions))
    .orderBy(desc(emailTemplates.createdAt));
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

export const getAllEmailsQuery = async (input: {
  userId?: number;
  emailId?: number;
}) => {
  const whereConditions = [eq(emails.status, true)];

  if (input.userId) {
    whereConditions.push(eq(emails.userId, input.userId));
  }

  if (input.emailId) {
    whereConditions.push(eq(emails.emailId, input.emailId));
  }

  return await db
    .select({
      templateId: emails.templateId,
      toEmail: emails.toEmail,
      subject: emails.subject,
      body: emails.body,
      emailStatus: emails.emailStatus,
      attempts: emails.attempts,
      lastErrorMessage: emails.lastErrorMessage,
      deliveredAt: emails.deliveredAt,
      createdAt: emails.createdAt,
      emailId: emails.emailId,
      provider: emails.provider,
    })
    .from(emails)
    .where(and(...whereConditions))
    .orderBy(desc(emails.createdAt));
};

export const insertEmailAttemptQuery = async (input: NewEmailAttempt[]) => {
  return await db.insert(emailAttempts).values(input);
};

export const getEmailAttemptsQuery = async (input: { emailId: number }) => {
  return await db
    .select({
      emailAttemptId: emailAttempts.emailAttemptId,
      emailId: emailAttempts.emailId,
      attemptNumber: emailAttempts.attemptNumber,
      emailStatus: emailAttempts.emailStatus,
      errorMessage: emailAttempts.errorMessage,
      attemptedAt: emailAttempts.attemptedAt,
      createdAt: emailAttempts.createdAt,
    })
    .from(emailAttempts)
    .where(eq(emailAttempts.emailId, input.emailId));
};

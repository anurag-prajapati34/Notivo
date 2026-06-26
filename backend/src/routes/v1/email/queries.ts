import { db } from "@/database/connection";
import {
  Email,
  EmailCreds,
  emailCreds,
  emails,
  NewEmail,
  NewEmailCreds,
} from "@/database/schema";
import { TransactionContext } from "@/utils/types";
import { and, eq } from "drizzle-orm";

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

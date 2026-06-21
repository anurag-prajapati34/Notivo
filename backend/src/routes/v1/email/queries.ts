import { db } from "@/database/connection";
import { Email, emails, NewEmail } from "@/database/schema";
import { TransactionContext } from "@/utils/types";
import { eq } from "drizzle-orm";

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

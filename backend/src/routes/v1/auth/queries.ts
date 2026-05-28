import { db } from "@/database/connection";
import { NewUser, users } from "@/database/schema";
import { TransactionContext } from "@/utils/types";
import { and, eq } from "drizzle-orm";

/**
 * Checks if an active user exists in the database with the specified email address.
 * * @param {string} email - The email address to look up.
 * @param {TransactionContext} [trx=db] - Optional Drizzle database or transaction client context.
 * @returns {Promise<boolean>} A promise that resolves to `true` if a matching active user is found, otherwise `false`.
 * * @example
 * const exists = await isUserExistsWithEmailQuery("user@example.com");
 */
export const isUserExistsWithEmailQuery = async (
  email: string,
  trx: TransactionContext = db,
): Promise<boolean> => {
  const result = await trx
    .select({
      email: users.email,
    })
    .from(users)
    .where(and(eq(users.email, email), eq(users.status, true)))
    .limit(1)
    .execute();

  return result.length > 0;
};

/**
 * Checks if an active user exists in the database with the specified mobile number.
 * * @param {string} mobile - The mobile number string to look up.
 * @param {TransactionContext} [trx=db] - Optional Drizzle database or transaction client context.
 * @returns {Promise<boolean>} A promise that resolves to `true` if a matching active user is found, otherwise `false`.
 * * @example
 * const exists = await isUserExistsWithMobileQuery("+1234567890");
 */
export const isUserExistsWithMobileQuery = async (
  mobile: string,
  trx: TransactionContext = db,
): Promise<boolean> => {
  const result = await trx
    .select({
      mobile: users.mobile,
    })
    .from(users)
    .where(and(eq(users.mobile, mobile), eq(users.status, true)))
    .limit(1)
    .execute();

  return result.length > 0;
};

/**
 * Inserts one or more new user records into the users table.
 * * @param {NewUser[]} input - An array of user records matching the database insertion schema shape.
 * @param {TransactionContext} [trx=db] - Optional Drizzle database or transaction client context.
 * @returns {Promise<any>} A promise resolving to the database adapter's raw insert result object (e.g., containing `insertId` or affected rows).
 * * @example
 * const [result] = await insertUsersQuery([{ firstName: "John", email: "john@example.com", ... }]);
 * const newId = result.insertId;
 */
export const insertUsersQuery = async (
  input: NewUser[],
  trx: TransactionContext = db,
) => {
  return await trx.insert(users).values(input);
};

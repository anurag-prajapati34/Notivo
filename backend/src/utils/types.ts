import { db } from "@/database/connection";
import { MySql2Transaction } from "drizzle-orm/mysql2";
import { JwtAuthPayload } from "./jwt-helpers";
import { Request } from "express";

/**
 * @description - User is a type that can be used to represent a user in the system.
 * It contains the user's ID, first name, middle name, last name, dial code, mobile number, and email address.
 * @type {User}
 * @property {number} userId - The unique identifier of the user.
 * @property {string} firstName - The first name of the user.
 * @property {string} middleName - The middle name of the user.
 * @property {string} lastName - The last name of the user.
 * @property {string} dialCode - The dial code of the user's mobile number.
 * @property {string} mobile - The mobile number of the user.
 * @property {string} email - The email address of the user.
 */
export interface User {
  userId: number;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  dialCode: string | null;
  mobile: string | null;
  email: string | null;
}
/**
 * @description - TransactionContext is a type that can be used to represent a database transaction.
 * It can be a MySql2Transaction object or the db object from drizzle-orm.
 * @type {TransactionContext}
 */
export type TransactionContext = MySql2Transaction<any, any> | typeof db;

export interface AuthRequest extends Request {
  user?: JwtAuthPayload;
}

import { db } from "@/database/connection";
import { MySql2Transaction } from "drizzle-orm/mysql2";

/**
 * @description - TransactionContext is a type that can be used to represent a database transaction.
 * It can be a MySql2Transaction object or the db object from drizzle-orm.
 * @type {TransactionContext}
 */
export type TransactionContext = MySql2Transaction<any, any> | typeof db;

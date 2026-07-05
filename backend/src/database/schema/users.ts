import { auditFields } from "@/utils/db-schema-helpers";
import {
  mysqlTable,
  bigint,
  timestamp,
  boolean,
  varchar,
  index,
} from "drizzle-orm/mysql-core";
export const users = mysqlTable(
  "users",
  {
    userId: bigint("user_id", { mode: "number" }).primaryKey().autoincrement(),
    userType: varchar("user_type", { length: 100 }), //UserType
    firstName: varchar("first_name", { length: 100 }),
    middleName: varchar("middle_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    dialCode: varchar("dial_code", { length: 100 }),
    mobile: varchar("mobile", { length: 100 }),
    email: varchar("email", { length: 255 }),
    password: varchar("password", { length: 500 }),

    apiKey: varchar("api_key", { length: 500 }),
    ...auditFields,
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_mobile_idx").on(table.mobile),
    index("users_user_type_idx").on(table.userType),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

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
    firstName: varchar("first_name", { length: 100 }),
    middleName: varchar("middle_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    dialCode: varchar("dial_code", { length: 100 }),
    mobile: varchar("mobile", { length: 100 }),
    email: varchar("email", { length: 255 }),
    password: varchar("password", { length: 500 }),

    //Audit fields
    status: boolean("status").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_mobile_idx").on(table.mobile),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

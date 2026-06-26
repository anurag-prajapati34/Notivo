import { bigint, boolean, foreignKey, timestamp } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { users } from "@/database/schema";

// Common audit fields used across all tables
// Note: MySQL TIMESTAMP columns store values in UTC internally
// CURRENT_TIMESTAMP uses MySQL server timezone (UTC in docker-compose.yml)
// Application timezone is IST (Asia/Kolkata), but MySQL stores in UTC
// When reading: MySQL converts UTC to session timezone, application handles IST conversion
// When writing: Application should use UTC or let MySQL handle conversion
export const auditFields = {
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  createdBy: bigint("created_by", { mode: "number" }),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
  updatedBy: bigint("updated_by", { mode: "number" }),
  deletedAt: timestamp("deleted_at"),
  deletedBy: bigint("deleted_by", { mode: "number" }),
  status: boolean("status").notNull().default(true),
};

export const createFks = (
  tableName: string,
  table: any,
): ReturnType<typeof foreignKey>[] => [
  foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.userId],
    name: `fk_${tableName}_created_by`,
  }).onUpdate("cascade"),
  foreignKey({
    columns: [table.updatedBy],
    foreignColumns: [users.userId],
    name: `fk_${tableName}_updated_by`,
  }).onUpdate("cascade"),
  foreignKey({
    columns: [table.deletedBy],
    foreignColumns: [users.userId],
    name: `fk_${tableName}_deleted_by`,
  }).onUpdate("cascade"),
];

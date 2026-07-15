import { pgTable, text, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { flows } from "./flows.js";

export const schedules = pgTable("schedules", {
  id: text("id").primaryKey(),
  flowId: text("flow_id").notNull().references(() => flows.id, { onDelete: "cascade" }),
  cronExpression: text("cron_expression").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  config: jsonb("config").notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
  lastRunAt: timestamp("last_run_at", { withTimezone: true }),
  nextRunAt: timestamp("next_run_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

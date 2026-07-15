import { pgTable, text, jsonb, integer, timestamp } from "drizzle-orm/pg-core";
import { executions } from "./executions.js";

export const executionSteps = pgTable("execution_steps", {
  id: text("id").primaryKey(),
  executionId: text("execution_id").notNull().references(() => executions.id, { onDelete: "cascade" }),
  nodeId: text("node_id").notNull(),
  status: text("status").notNull().default("PENDING"),
  input: jsonb("input").notNull().default({}),
  output: jsonb("output"),
  error: text("error"),
  attempt: integer("attempt").notNull().default(1),
  durationMs: integer("duration_ms"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export type ExecutionStepSelect = typeof executionSteps.$inferSelect;
export type ExecutionStepInsert = typeof executionSteps.$inferInsert;

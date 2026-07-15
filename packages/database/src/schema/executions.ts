import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { flows } from "./flows.js";
import { workspaces } from "./workspaces.js";
import { organizations } from "./organizations.js";

export const executions = pgTable("executions", {
  id: text("id").primaryKey(),
  flowId: text("flow_id").notNull().references(() => flows.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  triggeredBy: text("triggered_by"),
  status: text("status").notNull().default("PENDING"),
  triggerData: jsonb("trigger_data"),
  error: text("error"),
  durationMs: text("duration_ms"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ExecutionSelect = typeof executions.$inferSelect;
export type ExecutionInsert = typeof executions.$inferInsert;

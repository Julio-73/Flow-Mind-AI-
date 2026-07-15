import { pgTable, text, boolean, jsonb, integer, timestamp } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces.js";
import { organizations } from "./organizations.js";

export const flows = pgTable("flows", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  createdBy: text("created_by").notNull(),
  nodes: jsonb("nodes").notNull().default([]),
  edges: jsonb("edges").notNull().default([]),
  triggerType: text("trigger_type").notNull(),
  triggerConfig: jsonb("trigger_config").notNull().default({}),
  isActive: boolean("is_active").notNull().default(false),
  isDraft: boolean("is_draft").notNull().default(true),
  version: integer("version").notNull().default(1),
  tags: jsonb("tags").notNull().default([]),
  lastRunAt: timestamp("last_run_at", { withTimezone: true }),
  lastRunStatus: text("last_run_status"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type FlowSelect = typeof flows.$inferSelect;
export type FlowInsert = typeof flows.$inferInsert;

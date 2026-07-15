import { pgTable, text, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces.js";
import { organizations } from "./organizations.js";

export const variables = pgTable("variables", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: jsonb("value").notNull(),
  type: text("type").notNull().default("string"),
  description: text("description"),
  isSecret: boolean("is_secret").notNull().default(false),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type VariableSelect = typeof variables.$inferSelect;
export type VariableInsert = typeof variables.$inferInsert;

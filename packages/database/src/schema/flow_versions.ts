import { pgTable, text, jsonb, integer, timestamp } from "drizzle-orm/pg-core";
import { flows } from "./flows.js";
import { users } from "./users.js";

export const flowVersions = pgTable("flow_versions", {
  id: text("id").primaryKey(),
  flowId: text("flow_id").notNull().references(() => flows.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  nodes: jsonb("nodes").notNull(),
  edges: jsonb("edges").notNull(),
  config: jsonb("config").notNull().default({}),
  createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  changelog: text("changelog"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

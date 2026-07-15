import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const connectors = pgTable("connectors", {
  id: text("id").primaryKey(),
  type: text("type").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  authType: text("auth_type").notNull(),
  triggers: jsonb("triggers").notNull().default([]),
  actions: jsonb("actions").notNull().default([]),
  configSchema: jsonb("config_schema").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

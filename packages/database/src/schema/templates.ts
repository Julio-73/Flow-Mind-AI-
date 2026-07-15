import { pgTable, text, jsonb, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  icon: text("icon").notNull(),
  flowData: jsonb("flow_data").notNull(),
  requiredConnectors: jsonb("required_connectors").notNull().default([]),
  popularity: integer("popularity").notNull().default(0),
  isOfficial: boolean("is_official").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

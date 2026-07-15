import { pgTable, text, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.js";
import { connectors } from "./connectors.js";

export const installedConnectors = pgTable("installed_connectors", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  connectorId: text("connector_id").notNull().references(() => connectors.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  config: jsonb("config").notNull().default({}),
  isEnabled: boolean("is_enabled").notNull().default(true),
  lastTestedAt: timestamp("last_tested_at", { withTimezone: true }),
  lastTestSuccess: boolean("last_test_success"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

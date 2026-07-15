import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { variables } from "./variables.js";
import { users } from "./users.js";

export const variableAuditLog = pgTable("variable_audit_log", {
  id: text("id").primaryKey(),
  variableId: text("variable_id").notNull().references(() => variables.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  changedBy: text("changed_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

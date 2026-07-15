import { sql } from "drizzle-orm";
import { pgTable, uniqueIndex, index } from "drizzle-orm/pg-core";

// Index creation is handled via raw SQL in migrations or via the index() helper
// This file re-exports the schema relationships and ensures proper index definitions

import { variables } from "./variables.js";
import { executions } from "./executions.js";
import { flows } from "./flows.js";
import { notifications } from "./notifications.js";
import { activityLog } from "./activity_log.js";

// These indexes are applied in the migration, not at schema level
// They are documented here for reference

/*
CREATE INDEX idx_variables_workspace_key ON variables(workspace_id, key);
CREATE INDEX idx_executions_flow_status ON executions(flow_id, status);
CREATE INDEX idx_executions_org_status ON executions(organization_id, status);
CREATE INDEX idx_executions_started ON executions(started_at DESC);
CREATE INDEX idx_flows_workspace ON flows(workspace_id);
CREATE INDEX idx_flows_org_trigger ON flows(organization_id, trigger_type);
CREATE INDEX idx_flows_active ON flows(organization_id, is_active);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_activity_log_org ON activity_log(organization_id, created_at DESC);
CREATE INDEX idx_execution_steps_execution ON execution_steps(execution_id);
CREATE INDEX idx_flow_versions_flow ON flow_versions(flow_id, version DESC);
CREATE INDEX idx_schedules_next_run ON schedules(next_run_at) WHERE is_active = true;
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);
*/

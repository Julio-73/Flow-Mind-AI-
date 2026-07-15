import type { ExecutionStatus } from "../value-objects/execution-status.js";
import type { JsonValue } from "@flowmind/shared";

export type ExecutionEventType =
  | "execution:started"
  | "execution:completed"
  | "execution:failed"
  | "execution:node_started"
  | "execution:node_completed"
  | "execution:node_failed"
  | "execution:cancelled"
  | "execution:paused"
  | "execution:retrying";

export interface ExecutionEvent {
  type: ExecutionEventType;
  executionId: string;
  flowId: string;
  workspaceId: string;
  organizationId: string;
  nodeId?: string;
  status: ExecutionStatus;
  timestamp: Date;
  data?: Record<string, JsonValue>;
}

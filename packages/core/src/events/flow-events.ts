import type { JsonValue } from "@flowmind/shared";

export type FlowEventType =
  | "flow:created"
  | "flow:updated"
  | "flow:deleted"
  | "flow:published"
  | "flow:activated"
  | "flow:deactivated"
  | "flow:version_created"
  | "flow:cloned";

export interface FlowEvent {
  type: FlowEventType;
  flowId: string;
  workspaceId: string;
  organizationId: string;
  triggeredBy: string;
  timestamp: Date;
  data?: Record<string, JsonValue>;
}

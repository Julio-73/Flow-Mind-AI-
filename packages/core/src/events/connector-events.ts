export type ConnectorEventType =
  | "connector:installed"
  | "connector:uninstalled"
  | "connector:configured"
  | "connector:tested"
  | "connector:test_failed"
  | "connector:error";

export interface ConnectorEvent {
  type: ConnectorEventType;
  connectorId: string;
  organizationId: string;
  connectorType: string;
  triggeredBy: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

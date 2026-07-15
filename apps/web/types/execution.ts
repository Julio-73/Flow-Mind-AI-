export type ExecutionStatus =
  | "pending"
  | "running"
  | "success"
  | "error"
  | "cancelled";

export type ExecutionTrigger = "manual" | "webhook" | "schedule" | "event";

export interface ExecutionStep {
  id: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: ExecutionStatus;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt: string;
  completedAt?: string;
  durationMs: number;
}

export interface Execution {
  id: string;
  flowId: string;
  flowName: string;
  status: ExecutionStatus;
  trigger: ExecutionTrigger;
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  steps: ExecutionStep[];
  error?: string;
  output?: Record<string, unknown>;
  createdById: string;
}

export interface ExecutionSummary {
  id: string;
  flowId: string;
  flowName: string;
  status: ExecutionStatus;
  trigger: ExecutionTrigger;
  startedAt: string;
  durationMs: number;
  stepsCount: number;
  errorCount: number;
}

export interface ExecutionFilter {
  flowId?: string;
  status?: ExecutionStatus;
  trigger?: ExecutionTrigger;
  from?: string;
  to?: string;
  search?: string;
}

export interface MonitorStats {
  activeExecutions: number;
  completedPerMin: number;
  failuresPerMin: number;
  avgDurationMs: number;
  successRate: number;
}

export interface LiveExecution {
  id: string;
  flowId: string;
  flowName: string;
  currentNodeName: string;
  currentNodeType: string;
  durationMs: number;
  startedAt: string;
}

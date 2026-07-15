import { ExecutionStatus } from "../value-objects/execution-status.js";
import type { Execution, ExecutionStep } from "../entities/execution.js";
import type { JsonValue } from "@flowmind/shared";

export interface ExecutionState {
  executionId: string;
  flowId: string;
  status: ExecutionStatus;
  currentNodeId: string | null;
  nodeResults: Map<string, NodeResult>;
  context: Record<string, unknown>;
  errors: Array<{ nodeId: string; message: string; attempt: number }>;
  startedAt: Date;
  retryCount: number;
}

export interface NodeResult {
  nodeId: string;
  status: ExecutionStatus;
  output: Record<string, unknown> | null;
  error: string | null;
  attempt: number;
  durationMs: number;
  startedAt: Date;
  completedAt: Date;
}

export class ExecutionEngine {
  createState(execution: Execution): ExecutionState {
    return {
      executionId: execution.id,
      flowId: execution.flowId,
      status: ExecutionStatus.PENDING,
      currentNodeId: null,
      nodeResults: new Map(),
      context: execution.triggerData ?? {},
      errors: [],
      startedAt: new Date(),
      retryCount: 0,
    };
  }

  startExecution(state: ExecutionState): void {
    state.status = ExecutionStatus.RUNNING;
  }

  completeNode(state: ExecutionState, result: NodeResult): void {
    state.nodeResults.set(result.nodeId, result);
    if (result.output) {
      state.context[`node_${result.nodeId}`] = result.output;
    }
  }

  setCurrentNode(state: ExecutionState, nodeId: string): void {
    state.currentNodeId = nodeId;
  }

  recordError(state: ExecutionState, nodeId: string, message: string): void {
    state.errors.push({ nodeId, message, attempt: state.retryCount + 1 });
  }

  shouldRetry(state: ExecutionState, maxRetries: number): boolean {
    return state.retryCount < maxRetries;
  }

  incrementRetry(state: ExecutionState): void {
    state.retryCount += 1;
    state.status = ExecutionStatus.RETRYING;
  }

  completeExecution(state: ExecutionState, success: boolean): void {
    state.status = success ? ExecutionStatus.SUCCESS : ExecutionStatus.FAILED;
    state.currentNodeId = null;
  }

  cancelExecution(state: ExecutionState): void {
    state.status = ExecutionStatus.CANCELLED;
    state.currentNodeId = null;
  }

  getStepFromResult(result: NodeResult, executionId: string): ExecutionStep {
    return {
      id: `step_${result.nodeId}_${Date.now()}`,
      executionId,
      nodeId: result.nodeId,
      status: result.status,
      input: {},
      output: result.output as Record<string, JsonValue> | null,
      error: result.error,
      startedAt: result.startedAt,
      completedAt: result.completedAt,
      attempt: result.attempt,
      durationMs: result.durationMs,
    };
  }
}

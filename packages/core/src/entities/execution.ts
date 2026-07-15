import { z } from "zod";
import { ExecutionStatus, ExecutionStatusSchema, canTransition } from "../value-objects/execution-status.js";
import type { JsonValue } from "@flowmind/shared";

export interface ExecutionStep {
  id: string;
  executionId: string;
  nodeId: string;
  status: ExecutionStatus;
  input: Record<string, JsonValue>;
  output: Record<string, JsonValue> | null;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  attempt: number;
  durationMs: number | null;
}

export interface ExecutionProps {
  id: string;
  flowId: string;
  workspaceId: string;
  organizationId: string;
  triggeredBy: string | null;
  status: ExecutionStatus;
  triggerData: Record<string, JsonValue> | null;
  steps: ExecutionStep[];
  error: string | null;
  durationMs: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Execution {
  private constructor(private readonly props: ExecutionProps) {}

  static create(props: Omit<ExecutionProps, "createdAt" | "updatedAt" | "status" | "steps" | "error" | "durationMs" | "startedAt" | "completedAt">): Execution {
    return new Execution({
      ...props,
      status: ExecutionStatus.PENDING,
      steps: [],
      error: null,
      durationMs: null,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static from(props: ExecutionProps): Execution {
    return new Execution(props);
  }

  get id(): string { return this.props.id; }
  get flowId(): string { return this.props.flowId; }
  get workspaceId(): string { return this.props.workspaceId; }
  get organizationId(): string { return this.props.organizationId; }
  get triggeredBy(): string | null { return this.props.triggeredBy; }
  get status(): ExecutionStatus { return this.props.status; }
  get triggerData(): Record<string, JsonValue> | null { return this.props.triggerData; }
  get steps(): ExecutionStep[] { return [...this.props.steps]; }
  get error(): string | null { return this.props.error; }
  get durationMs(): number | null { return this.props.durationMs; }
  get startedAt(): Date | null { return this.props.startedAt; }
  get completedAt(): Date | null { return this.props.completedAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  transitionTo(status: ExecutionStatus): void {
    if (!canTransition(this.props.status, status)) {
      throw new Error(`Cannot transition from ${this.props.status} to ${status}`);
    }
    this.props.status = status;
    this.props.updatedAt = new Date();

    if (status === ExecutionStatus.RUNNING && !this.props.startedAt) {
      this.props.startedAt = new Date();
    }

    if (status === ExecutionStatus.SUCCESS || status === ExecutionStatus.FAILED || status === ExecutionStatus.CANCELLED) {
      this.props.completedAt = new Date();
      if (this.props.startedAt) {
        this.props.durationMs = this.props.completedAt.getTime() - this.props.startedAt.getTime();
      }
    }
  }

  addStep(step: ExecutionStep): void {
    this.props.steps.push(step);
    this.props.updatedAt = new Date();
  }

  updateStep(nodeId: string, updates: Partial<ExecutionStep>): void {
    const idx = this.props.steps.findIndex((s) => s.nodeId === nodeId);
    if (idx !== -1) {
      this.props.steps[idx] = { ...this.props.steps[idx], ...updates } as ExecutionStep;
      this.props.updatedAt = new Date();
    }
  }

  setError(error: string): void {
    this.props.error = error;
    this.props.updatedAt = new Date();
  }

  toJSON(): ExecutionProps {
    return { ...this.props };
  }
}

export const CreateExecutionSchema = z.object({
  flowId: z.string(),
  workspaceId: z.string(),
  organizationId: z.string(),
  triggeredBy: z.string().nullable().optional(),
  triggerData: z.record(z.unknown()).nullable().optional(),
});

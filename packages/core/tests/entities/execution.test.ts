import { describe, it, expect } from "vitest";
import { Execution } from "../../src/entities/execution.js";
import { ExecutionStatus } from "../../src/value-objects/execution-status.js";

describe("Execution", () => {
  const baseProps = {
    id: "exec_001",
    flowId: "flw_001",
    workspaceId: "ws_001",
    organizationId: "org_001",
    triggeredBy: "usr_001",
    triggerData: { source: "manual" },
  };

  it("creates an execution with PENDING status", () => {
    const exec = Execution.create(baseProps);
    expect(exec.status).toBe(ExecutionStatus.PENDING);
    expect(exec.steps).toEqual([]);
    expect(exec.error).toBeNull();
    expect(exec.durationMs).toBeNull();
  });

  it("transitions from PENDING to RUNNING", () => {
    const exec = Execution.create(baseProps);
    exec.transitionTo(ExecutionStatus.RUNNING);
    expect(exec.status).toBe(ExecutionStatus.RUNNING);
    expect(exec.startedAt).not.toBeNull();
  });

  it("records duration on SUCCESS", () => {
    const exec = Execution.create(baseProps);
    exec.transitionTo(ExecutionStatus.RUNNING);
    exec.transitionTo(ExecutionStatus.SUCCESS);
    expect(exec.status).toBe(ExecutionStatus.SUCCESS);
    expect(exec.completedAt).not.toBeNull();
    expect(exec.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("throws on invalid transition", () => {
    const exec = Execution.create(baseProps);
    expect(() => exec.transitionTo(ExecutionStatus.SUCCESS)).toThrow(
      "Cannot transition from PENDING to SUCCESS"
    );
  });

  it("adds a step", () => {
    const exec = Execution.create(baseProps);
    exec.addStep({
      id: "step_1",
      executionId: "exec_001",
      nodeId: "n1",
      status: ExecutionStatus.RUNNING,
      input: { data: "test" },
      output: null,
      error: null,
      startedAt: new Date(),
      completedAt: null,
      attempt: 1,
      durationMs: null,
    });
    expect(exec.steps).toHaveLength(1);
  });

  it("sets error message", () => {
    const exec = Execution.create(baseProps);
    exec.setError("Something went wrong");
    expect(exec.error).toBe("Something went wrong");
  });

  it("updates an existing step", () => {
    const exec = Execution.create(baseProps);
    exec.addStep({
      id: "step_1",
      executionId: "exec_001",
      nodeId: "n1",
      status: ExecutionStatus.RUNNING,
      input: {},
      output: null,
      error: null,
      startedAt: new Date(),
      completedAt: null,
      attempt: 1,
      durationMs: null,
    });
    exec.updateStep("n1", { status: ExecutionStatus.SUCCESS, output: { result: "ok" } });
    const step = exec.steps[0]!;
    expect(step.status).toBe(ExecutionStatus.SUCCESS);
    expect(step.output).toEqual({ result: "ok" });
  });
});

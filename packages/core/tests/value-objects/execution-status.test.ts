import { describe, it, expect } from "vitest";
import {
  ExecutionStatus,
  isTerminalStatus,
  canTransition,
  ExecutionStatusSchema,
} from "../../src/value-objects/execution-status.js";

describe("ExecutionStatus", () => {
  it("has all expected statuses", () => {
    expect(ExecutionStatus.PENDING).toBe("PENDING");
    expect(ExecutionStatus.RUNNING).toBe("RUNNING");
    expect(ExecutionStatus.SUCCESS).toBe("SUCCESS");
    expect(ExecutionStatus.FAILED).toBe("FAILED");
    expect(ExecutionStatus.CANCELLED).toBe("CANCELLED");
    expect(ExecutionStatus.TIMED_OUT).toBe("TIMED_OUT");
    expect(ExecutionStatus.RETRYING).toBe("RETRYING");
    expect(ExecutionStatus.PAUSED).toBe("PAUSED");
  });

  it("identifies terminal statuses", () => {
    expect(isTerminalStatus(ExecutionStatus.SUCCESS)).toBe(true);
    expect(isTerminalStatus(ExecutionStatus.FAILED)).toBe(true);
    expect(isTerminalStatus(ExecutionStatus.CANCELLED)).toBe(true);
    expect(isTerminalStatus(ExecutionStatus.TIMED_OUT)).toBe(true);
    expect(isTerminalStatus(ExecutionStatus.PENDING)).toBe(false);
    expect(isTerminalStatus(ExecutionStatus.RUNNING)).toBe(false);
  });

  it("allows valid transitions", () => {
    expect(canTransition(ExecutionStatus.PENDING, ExecutionStatus.RUNNING)).toBe(true);
    expect(canTransition(ExecutionStatus.PENDING, ExecutionStatus.CANCELLED)).toBe(true);
    expect(canTransition(ExecutionStatus.RUNNING, ExecutionStatus.SUCCESS)).toBe(true);
    expect(canTransition(ExecutionStatus.RUNNING, ExecutionStatus.FAILED)).toBe(true);
    expect(canTransition(ExecutionStatus.RUNNING, ExecutionStatus.PAUSED)).toBe(true);
    expect(canTransition(ExecutionStatus.FAILED, ExecutionStatus.RETRYING)).toBe(true);
    expect(canTransition(ExecutionStatus.TIMED_OUT, ExecutionStatus.RETRYING)).toBe(true);
    expect(canTransition(ExecutionStatus.RETRYING, ExecutionStatus.RUNNING)).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(canTransition(ExecutionStatus.SUCCESS, ExecutionStatus.RUNNING)).toBe(false);
    expect(canTransition(ExecutionStatus.CANCELLED, ExecutionStatus.PENDING)).toBe(false);
    expect(canTransition(ExecutionStatus.PENDING, ExecutionStatus.SUCCESS)).toBe(false);
    expect(canTransition(ExecutionStatus.RUNNING, ExecutionStatus.PENDING)).toBe(false);
  });

  it("parses valid status from Zod schema", () => {
    const result = ExecutionStatusSchema.parse("RUNNING");
    expect(result).toBe(ExecutionStatus.RUNNING);
  });

  it("throws on invalid status string", () => {
    expect(() => ExecutionStatusSchema.parse("UNKNOWN")).toThrow();
  });
});

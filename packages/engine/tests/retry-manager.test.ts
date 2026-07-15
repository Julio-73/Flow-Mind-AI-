import { describe, it, expect } from "vitest";
import { RetryManager } from "../src/retry-manager.js";
import type { ExecutionState } from "@flowmind/core";

function createMockState(retryCount = 0): ExecutionState {
  return {
    executionId: "exec_001",
    flowId: "flw_001",
    status: "RUNNING",
    currentNodeId: "n1",
    nodeResults: new Map(),
    context: {},
    errors: [],
    startedAt: new Date(),
    retryCount,
  };
}

describe("RetryManager", () => {
  it("allows retry when under max retries", () => {
    const manager = new RetryManager(3);
    const state = createMockState(0);
    expect(manager.shouldRetry(state)).toBe(true);
  });

  it("rejects retry when at max retries", () => {
    const manager = new RetryManager(3);
    const state = createMockState(3);
    expect(manager.shouldRetry(state)).toBe(false);
  });

  it("respects current attempt parameter over state", () => {
    const manager = new RetryManager(3);
    const state = createMockState(5);
    expect(manager.shouldRetry(state, 1)).toBe(true);
    expect(manager.shouldRetry(state, 3)).toBe(false);
  });

  it("computes exponential backoff", () => {
    const manager = new RetryManager(3, 1000);
    expect(manager.getBackoff(1)).toBe(1000);
    expect(manager.getBackoff(2)).toBe(2000);
    expect(manager.getBackoff(3)).toBe(4000);
  });

  it("caps backoff at 30 seconds", () => {
    const manager = new RetryManager(10, 10000);
    expect(manager.getBackoff(5)).toBe(30000);
  });

  it("jitter adds variance to backoff", () => {
    const manager = new RetryManager(3, 1000);
    const backoff = manager.getBackoff(1);
    const jittered = manager.getJitteredBackoff(1);
    expect(jittered).toBeGreaterThanOrEqual(backoff);
    expect(jittered).toBeLessThanOrEqual(backoff * 1.1);
  });

  it("resets retry count on state", () => {
    const manager = new RetryManager(3);
    const state = createMockState(3);
    expect(manager.shouldRetry(state)).toBe(false);
    manager.resetRetries(state);
    expect(manager.shouldRetry(state)).toBe(true);
  });
});

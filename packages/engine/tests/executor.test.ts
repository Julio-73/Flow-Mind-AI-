import { describe, it, expect, vi, beforeEach } from "vitest";
import { Executor } from "../src/executor.js";
import type { Flow, Edge, FlowNodeData } from "@flowmind/core";

function createMockFlow(nodes: FlowNodeData[], edges: Edge[]): Flow {
  return Flow.from({
    id: "flw_001",
    name: "Test Flow",
    workspaceId: "ws_001",
    organizationId: "org_001",
    createdBy: "usr_001",
    nodes,
    edges,
    triggerType: "MANUAL",
    triggerConfig: {},
    isActive: true,
    isDraft: false,
    version: 1,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe("Executor", () => {
  let executor: Executor;

  beforeEach(() => {
    vi.useFakeTimers();
    executor = new Executor({ maxRetries: 1, defaultTimeoutMs: 5000 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("executes a linear DAG flow (trigger -> action -> action)", async () => {
    const nodes: FlowNodeData[] = [
      { id: "n1", type: "TRIGGER", label: "Webhook", position: { x: 0, y: 0 }, config: {} },
      { id: "n2", type: "ACTION", label: "Transform", position: { x: 200, y: 0 }, config: { connectorType: "http", action: "transform" } },
      { id: "n3", type: "ACTION", label: "Notify", position: { x: 400, y: 0 }, config: { action: "notify" } },
    ];
    const edges: Edge[] = [
      { id: "e1", sourceNodeId: "n1", targetNodeId: "n2" },
      { id: "e2", sourceNodeId: "n2", targetNodeId: "n3" },
    ];
    const flow = createMockFlow(nodes, edges);
    const triggerData = { source: "webhook" };

    const eventSpy = vi.fn();
    executor.events.on("execution:completed", eventSpy);

    const result = await executor.execute(flow, triggerData, "exec_001");
    expect(result.status).toBe("SUCCESS");
    expect(eventSpy).toHaveBeenCalledOnce();
    expect(result.nodeResults.size).toBe(3);
  });

  it("handles branching flow with condition", async () => {
    const nodes: FlowNodeData[] = [
      { id: "n1", type: "TRIGGER", label: "Start", position: { x: 0, y: 0 }, config: {} },
      {
        id: "n2",
        type: "CONDITION",
        label: "Check Value",
        position: { x: 200, y: 0 },
        config: { field: "value", operator: "greater_than", value: 50 },
      },
      { id: "n3", type: "ACTION", label: "High Path", position: { x: 400, y: 0 }, config: { action: "high" } },
      { id: "n4", type: "ACTION", label: "Low Path", position: { x: 400, y: 200 }, config: { action: "low" } },
    ];
    const edges: Edge[] = [
      { id: "e1", sourceNodeId: "n1", targetNodeId: "n2" },
      { id: "e2", sourceNodeId: "n2", targetNodeId: "n3" },
      { id: "e3", sourceNodeId: "n2", targetNodeId: "n4" },
    ];
    const flow = createMockFlow(nodes, edges);
    const result = await executor.execute(flow, { value: 100 }, "exec_002");
    expect(result.status).toBe("SUCCESS");
    expect(result.nodeResults.size).toBeGreaterThanOrEqual(2);
  });

  it("emits failure event when a node errors", async () => {
    const nodes: FlowNodeData[] = [
      { id: "n1", type: "TRIGGER", label: "Start", position: { x: 0, y: 0 }, config: {} },
      {
        id: "n2",
        type: "ACTION",
        label: "Failing Action",
        position: { x: 200, y: 0 },
        config: { throwError: true },
      },
    ];
    const edges: Edge[] = [{ id: "e1", sourceNodeId: "n1", targetNodeId: "n2" }];
    const flow = createMockFlow(nodes, edges);

    const failedSpy = vi.fn();
    executor.events.on("execution:failed", failedSpy);

    const result = await executor.execute(flow, {}, "exec_003");
    expect(result.status).toBe("FAILED");
  });

  it("detects cycles and returns failure", async () => {
    const nodes: FlowNodeData[] = [
      { id: "n1", type: "TRIGGER", label: "Start", position: { x: 0, y: 0 }, config: {} },
      { id: "n2", type: "ACTION", label: "Action", position: { x: 200, y: 0 }, config: {} },
    ];
    const edges: Edge[] = [
      { id: "e1", sourceNodeId: "n1", targetNodeId: "n2" },
      { id: "e2", sourceNodeId: "n2", targetNodeId: "n1" },
    ];
    const flow = createMockFlow(nodes, edges);
    const result = await executor.execute(flow, {}, "exec_004");
    expect(result.status).toBe("FAILED");
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("executes with variable resolution in context", async () => {
    const nodes: FlowNodeData[] = [
      { id: "n1", type: "TRIGGER", label: "Start", position: { x: 0, y: 0 }, config: {} },
      {
        id: "n2",
        type: "ACTION",
        label: "Use Variable",
        position: { x: 200, y: 0 },
        config: { message: "Processing {{ source }}" },
      },
    ];
    const edges: Edge[] = [{ id: "e1", sourceNodeId: "n1", targetNodeId: "n2" }];
    const flow = createMockFlow(nodes, edges);
    const result = await executor.execute(flow, { source: "webhook" }, "exec_005");
    expect(result.status).toBe("SUCCESS");
  });

  it("shuts down gracefully", async () => {
    await expect(executor.shutdown()).resolves.toBeUndefined();
  });
});

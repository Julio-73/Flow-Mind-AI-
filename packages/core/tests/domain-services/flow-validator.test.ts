import { describe, it, expect } from "vitest";
import { FlowValidator } from "../../src/domain-services/flow-validator.js";
import type { FlowNodeData, Edge } from "../../src/entities/flow.js";

describe("FlowValidator", () => {
  const validator = new FlowValidator();

  it("validates a valid flow with trigger", () => {
    const nodes: FlowNodeData[] = [
      { id: "n1", type: "TRIGGER", label: "Start", position: { x: 0, y: 0 }, config: {} },
      { id: "n2", type: "ACTION", label: "Send Email", position: { x: 200, y: 0 }, config: {} },
    ];
    const edges: Edge[] = [{ id: "e1", sourceNodeId: "n1", targetNodeId: "n2" }];
    const result = validator.validate(nodes, edges);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects flow without trigger", () => {
    const nodes: FlowNodeData[] = [
      { id: "n1", type: "ACTION", label: "Do Something", position: { x: 0, y: 0 }, config: {} },
    ];
    const edges: Edge[] = [];
    const result = validator.validate(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.type === "TRIGGER_REQUIRED")).toBe(true);
  });

  it("rejects flow with multiple triggers", () => {
    const nodes: FlowNodeData[] = [
      { id: "n1", type: "TRIGGER", label: "Trigger A", position: { x: 0, y: 0 }, config: {} },
      { id: "n2", type: "WEBHOOK", label: "Trigger B", position: { x: 200, y: 0 }, config: { path: "/hook" } },
    ];
    const edges: Edge[] = [];
    const result = validator.validate(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.type === "MULTIPLE_TRIGGERS")).toBe(true);
  });

  it("detects cycles in the flow", () => {
    const nodes: FlowNodeData[] = [
      { id: "n1", type: "TRIGGER", label: "Start", position: { x: 0, y: 0 }, config: {} },
      { id: "n2", type: "ACTION", label: "Action", position: { x: 200, y: 0 }, config: {} },
      { id: "n3", type: "ACTION", label: "Loop back", position: { x: 400, y: 0 }, config: {} },
    ];
    const edges: Edge[] = [
      { id: "e1", sourceNodeId: "n1", targetNodeId: "n2" },
      { id: "e2", sourceNodeId: "n2", targetNodeId: "n3" },
      { id: "e3", sourceNodeId: "n3", targetNodeId: "n1" },
    ];
    const result = validator.validate(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.type === "CYCLE")).toBe(true);
  });

  it("detects disconnected nodes", () => {
    const nodes: FlowNodeData[] = [
      { id: "n1", type: "TRIGGER", label: "Start", position: { x: 0, y: 0 }, config: {} },
      { id: "n2", type: "ACTION", label: "Lonely", position: { x: 200, y: 0 }, config: {} },
    ];
    const edges: Edge[] = [{ id: "e1", sourceNodeId: "n1", targetNodeId: "n1" }];
    const result = validator.validate(nodes, edges);
    expect(result.errors.some((e) => e.type === "DISCONNECTED_NODE")).toBe(true);
  });

  it("detects invalid edges to non-existent nodes", () => {
    const nodes: FlowNodeData[] = [
      { id: "n1", type: "TRIGGER", label: "Start", position: { x: 0, y: 0 }, config: {} },
    ];
    const edges: Edge[] = [{ id: "e1", sourceNodeId: "n1", targetNodeId: "n999" }];
    const result = validator.validate(nodes, edges);
    expect(result.errors.some((e) => e.type === "INVALID_EDGE")).toBe(true);
  });

  it("validates webhook requires path config", () => {
    const nodes: FlowNodeData[] = [
      { id: "n1", type: "TRIGGER", label: "Start", position: { x: 0, y: 0 }, config: {} },
      { id: "n2", type: "WEBHOOK", label: "Hook", position: { x: 200, y: 0 }, config: {} },
    ];
    const edges: Edge[] = [{ id: "e1", sourceNodeId: "n1", targetNodeId: "n2" }];
    const result = validator.validate(nodes, edges);
    expect(result.errors.some((e) => e.type === "MISSING_CONFIG")).toBe(true);
  });

  it("passes webhook with valid path config", () => {
    const nodes: FlowNodeData[] = [
      { id: "n1", type: "WEBHOOK", label: "Hook", position: { x: 0, y: 0 }, config: { path: "/webhook" } },
      { id: "n2", type: "ACTION", label: "Process", position: { x: 200, y: 0 }, config: {} },
    ];
    const edges: Edge[] = [{ id: "e1", sourceNodeId: "n1", targetNodeId: "n2" }];
    const result = validator.validate(nodes, edges);
    expect(result.errors.filter((e) => e.type === "MISSING_CONFIG")).toHaveLength(0);
  });

  it("validates AI node requires prompt config", () => {
    const nodes: FlowNodeData[] = [
      { id: "n1", type: "TRIGGER", label: "Start", position: { x: 0, y: 0 }, config: {} },
      { id: "n2", type: "AI", label: "AI Node", position: { x: 200, y: 0 }, config: {} },
    ];
    const edges: Edge[] = [{ id: "e1", sourceNodeId: "n1", targetNodeId: "n2" }];
    const result = validator.validate(nodes, edges);
    expect(result.errors.some((e) => e.type === "MISSING_CONFIG" && e.nodeId === "n2")).toBe(true);
  });
});

import { describe, it, expect, vi } from "vitest";
import { Flow } from "../../src/entities/flow.js";

describe("Flow", () => {
  const baseProps = {
    id: "flw_001",
    name: "Test Flow",
    description: "A test flow",
    workspaceId: "ws_001",
    organizationId: "org_001",
    createdBy: "usr_001",
    triggerType: "MANUAL" as const,
    triggerConfig: {},
    isActive: false,
  };

  it("creates a flow with default values", () => {
    const flow = Flow.create(baseProps);
    expect(flow.name).toBe("Test Flow");
    expect(flow.isDraft).toBe(true);
    expect(flow.version).toBe(1);
    expect(flow.nodes).toEqual([]);
    expect(flow.edges).toEqual([]);
    expect(flow.tags).toEqual([]);
    expect(flow.id).toBe("flw_001");
  });

  it("publishes a draft flow", () => {
    const flow = Flow.create(baseProps);
    expect(flow.isDraft).toBe(true);
    flow.publish();
    expect(flow.isDraft).toBe(false);
    expect(flow.version).toBe(2);
  });

  it("activates and deactivates a flow", () => {
    const flow = Flow.create(baseProps);
    flow.activate();
    expect(flow.isActive).toBe(true);
    flow.deactivate();
    expect(flow.isActive).toBe(false);
  });

  it("updates nodes", () => {
    const flow = Flow.create(baseProps);
    const nodes = [{ id: "n1", type: "TRIGGER", label: "Start", position: { x: 0, y: 0 }, config: {} }];
    flow.updateNodes(nodes);
    expect(flow.nodes).toHaveLength(1);
    expect(flow.nodes[0]!.label).toBe("Start");
  });

  it("updates edges", () => {
    const flow = Flow.create(baseProps);
    const edges = [{ id: "e1", sourceNodeId: "n1", targetNodeId: "n2" }];
    flow.updateEdges(edges);
    expect(flow.edges).toHaveLength(1);
    expect(flow.edges[0]!.sourceNodeId).toBe("n1");
  });

  it("returns immutable nodes copy", () => {
    const flow = Flow.create(baseProps);
    const nodes = flow.nodes;
    nodes.push({ id: "n1", type: "TRIGGER", label: "Start", position: { x: 0, y: 0 }, config: {} });
    expect(flow.nodes).toHaveLength(0);
  });

  it("converts to JSON", () => {
    const flow = Flow.create(baseProps);
    const json = flow.toJSON();
    expect(json.name).toBe("Test Flow");
    expect(json.isDraft).toBe(true);
  });
});

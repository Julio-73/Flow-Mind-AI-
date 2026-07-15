import { describe, it, expect } from "vitest";
import { NodeType, isTriggerType, isExecutableType, NodeTypeSchema } from "../../src/value-objects/node-type.js";

describe("NodeType", () => {
  it("has all expected node types", () => {
    expect(NodeType.TRIGGER).toBe("TRIGGER");
    expect(NodeType.ACTION).toBe("ACTION");
    expect(NodeType.CONDITION).toBe("CONDITION");
    expect(NodeType.DELAY).toBe("DELAY");
    expect(NodeType.AI).toBe("AI");
    expect(NodeType.WEBHOOK).toBe("WEBHOOK");
    expect(NodeType.LOOP).toBe("LOOP");
    expect(NodeType.TRANSFORM).toBe("TRANSFORM");
  });

  it("identifies trigger types correctly", () => {
    expect(isTriggerType(NodeType.TRIGGER)).toBe(true);
    expect(isTriggerType(NodeType.WEBHOOK)).toBe(true);
    expect(isTriggerType(NodeType.ACTION)).toBe(false);
    expect(isTriggerType(NodeType.CONDITION)).toBe(false);
  });

  it("identifies executable types correctly", () => {
    expect(isExecutableType(NodeType.ACTION)).toBe(true);
    expect(isExecutableType(NodeType.CONDITION)).toBe(true);
    expect(isExecutableType(NodeType.TRIGGER)).toBe(false);
    expect(isExecutableType(NodeType.WEBHOOK)).toBe(false);
  });

  it("parses valid node type from Zod schema", () => {
    const result = NodeTypeSchema.parse("ACTION");
    expect(result).toBe(NodeType.ACTION);
  });

  it("throws on invalid node type string", () => {
    expect(() => NodeTypeSchema.parse("INVALID")).toThrow();
  });
});

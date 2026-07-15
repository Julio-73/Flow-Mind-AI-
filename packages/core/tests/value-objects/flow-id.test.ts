import { describe, it, expect } from "vitest";
import { FlowId, FlowIdSchema } from "../../src/value-objects/flow-id.js";

describe("FlowId", () => {
  it("generates a valid flow ID with prefix", () => {
    const id = FlowId.generate();
    expect(id.toString()).toMatch(/^flw_/);
    expect(id.toString().length).toBeGreaterThan(8);
  });

  it("creates a FlowId from a valid string", () => {
    const id = FlowId.from("flw_test123abc");
    expect(id.toString()).toBe("flw_test123abc");
  });

  it("throws on invalid prefix", () => {
    expect(() => FlowId.from("invalid")).toThrow("Invalid flow ID format");
  });

  it("checks equality between two FlowIds", () => {
    const a = FlowId.from("flw_abc123");
    const b = FlowId.from("flw_abc123");
    const c = FlowId.from("flw_xyz789");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it("generates unique IDs", () => {
    const a = FlowId.generate();
    const b = FlowId.generate();
    expect(a.equals(b)).toBe(false);
  });

  it("validates with Zod schema", () => {
    const result = FlowIdSchema.parse("flw_base64urltest");
    expect(result).toBeInstanceOf(FlowId);
    expect(result.toString()).toBe("flw_base64urltest");
  });

  it("throws Zod error for short ID", () => {
    expect(() => FlowIdSchema.parse("flw_short")).toThrow();
  });
});

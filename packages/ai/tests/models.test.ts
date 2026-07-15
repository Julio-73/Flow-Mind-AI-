import { describe, it, expect } from "vitest";

describe("AI Models", () => {
  it("exports model definitions", async () => {
    const mod = await import("../src/models.js");
    expect(mod).toBeDefined();
  });

  it("exports copilot module", async () => {
    const mod = await import("../src/copilot.js");
    expect(mod).toBeDefined();
  });

  it("exports parser module", async () => {
    const mod = await import("../src/parser.js");
    expect(mod).toBeDefined();
  });

  it("exports tool calling module", async () => {
    const mod = await import("../src/tool-calling.js");
    expect(mod).toBeDefined();
  });
});

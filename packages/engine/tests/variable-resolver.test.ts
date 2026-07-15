import { describe, it, expect } from "vitest";
import { VariableResolver } from "../src/variable-resolver.js";
import type { FlowNodeData } from "@flowmind/core";

describe("VariableResolver", () => {
  const resolver = new VariableResolver();

  it("resolves simple string variables in node config", () => {
    const node: FlowNodeData = {
      id: "n1",
      type: "ACTION",
      label: "Send",
      position: { x: 0, y: 0 },
      config: { message: "Hello {{ name }}" },
    };
    const context = { name: "World" };
    const resolved = resolver.resolveNodeInput(node, context);
    expect(resolved.message).toBe("Hello World");
  });

  it("passes through non-string config values unchanged", () => {
    const node: FlowNodeData = {
      id: "n1",
      type: "ACTION",
      label: "Send",
      position: { x: 0, y: 0 },
      config: { count: 42, enabled: true, tags: ["a", "b"] },
    };
    const resolved = resolver.resolveNodeInput(node, {});
    expect(resolved.count).toBe(42);
    expect(resolved.enabled).toBe(true);
    expect(resolved.tags).toEqual(["a", "b"]);
  });

  it("resolves nested objects recursively", () => {
    const node: FlowNodeData = {
      id: "n1",
      type: "ACTION",
      label: "API Call",
      position: { x: 0, y: 0 },
      config: {
        headers: {
          Authorization: "Bearer {{ token }}",
          "X-API-Key": "{{ apiKey }}",
        },
      },
    };
    const context = { token: "abc123", apiKey: "key_456" };
    const resolved = resolver.resolveNodeInput(node, context);
    expect(resolved.headers).toEqual({
      Authorization: "Bearer abc123",
      "X-API-Key": "key_456",
    });
  });

  it("extracts variable references from config", () => {
    const node: FlowNodeData = {
      id: "n1",
      type: "ACTION",
      label: "Test",
      position: { x: 0, y: 0 },
      config: {
        url: "{{ baseUrl }}/api/{{ endpoint }}",
        headers: { Auth: "Bearer {{ token }}" },
      },
    };
    const refs = resolver.extractReferences(node);
    expect(refs).toContain("baseUrl");
    expect(refs).toContain("endpoint");
    expect(refs).toContain("token");
    expect(refs).toHaveLength(3);
  });

  it("handles absent context variables by leaving template untouched", () => {
    const node: FlowNodeData = {
      id: "n1",
      type: "ACTION",
      label: "Test",
      position: { x: 0, y: 0 },
      config: { url: "{{ missing }}" },
    };
    const resolved = resolver.resolveNodeInput(node, {});
    expect(resolved.url).toBe("{{ missing }}");
  });

  it("parses JSON string templates", () => {
    const node: FlowNodeData = {
      id: "n1",
      type: "ACTION",
      label: "Test",
      position: { x: 0, y: 0 },
      config: { payload: '{"key": "{{ value }}"}' },
    };
    const resolved = resolver.resolveNodeInput(node, { value: "test" });
    expect(resolved.payload).toEqual({ key: "test" });
  });
});

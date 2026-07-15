import { describe, it, expect } from "vitest";
import { VariableEvaluator } from "../../src/domain-services/variable-evaluator.js";

describe("VariableEvaluator", () => {
  const evaluator = new VariableEvaluator([]);

  it("replaces a simple variable in template", () => {
    const result = evaluator.evaluate("Hello {{ name }}", { name: "World" });
    expect(result).toBe("Hello World");
  });

  it("replaces nested path variable", () => {
    const result = evaluator.evaluate("{{ user.name }}", { user: { name: "Alice" } });
    expect(result).toBe("Alice");
  });

  it("returns original template for undefined variables", () => {
    const result = evaluator.evaluate("Hello {{ unknown }}", {});
    expect(result).toBe("Hello {{ unknown }}");
  });

  it("serializes object values as JSON", () => {
    const result = evaluator.evaluate("Data: {{ data }}", { data: { key: "value" } });
    expect(result).toBe('Data: {"key":"value"}');
  });

  it("evaluates condition to true with boolean string", () => {
    expect(evaluator.evaluateCondition("{{ flag }}", { flag: "true" })).toBe(true);
  });

  it("evaluates condition to false with boolean string", () => {
    expect(evaluator.evaluateCondition("{{ flag }}", { flag: "false" })).toBe(false);
  });

  it("evaluates condition with numeric values", () => {
    const result = evaluator.evaluateCondition("{{ count }}", { count: "1" });
    expect(result).toBe(true);
  });

  it("evaluates condition with zero as false", () => {
    const result = evaluator.evaluateCondition("{{ count }}", { count: "0" });
    expect(result).toBe(false);
  });

  it("evaluates condition with empty string as false", () => {
    const result = evaluator.evaluateCondition("{{ value }}", { value: "" });
    expect(result).toBe(false);
  });

  it("extracts variable references from template", () => {
    const refs = evaluator.extractVariableReferences("Hello {{ name }}, your {{ role.type }} is set");
    expect(refs).toContain("name");
    expect(refs).toContain("role.type");
    expect(refs).toHaveLength(2);
  });

  it("deduplicates variable references", () => {
    const refs = evaluator.extractVariableReferences("{{ name }} and {{ name }}");
    expect(refs).toHaveLength(1);
  });

  it("evaluateJson returns parsed JSON when result is valid JSON", () => {
    const result = evaluator.evaluateJson('{"key": "{{ value }}"}', { value: "test" });
    expect(result).toEqual({ key: "test" });
  });

  it("evaluateJson returns string when result is not valid JSON", () => {
    const result = evaluator.evaluateJson("Hello {{ name }}", { name: "World" });
    expect(result).toBe("Hello World");
  });
});

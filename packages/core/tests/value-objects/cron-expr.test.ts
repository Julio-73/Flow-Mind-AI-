import { describe, it, expect } from "vitest";
import { CronExpression, CronExpressionSchema } from "../../src/value-objects/cron-expr.js";

describe("CronExpression", () => {
  it("creates a valid standard cron expression", () => {
    const cron = CronExpression.create("*/5 * * * *");
    expect(cron.toString()).toBe("*/5 * * * *");
  });

  it("creates a valid @every expression", () => {
    const cron = CronExpression.create("@every 30s");
    expect(cron.toString()).toBe("@every 30s");
  });

  it("creates a valid @daily shorthand", () => {
    const cron = CronExpression.create("@daily");
    expect(cron.toString()).toBe("@daily");
  });

  it("trims whitespace", () => {
    const cron = CronExpression.create("  0 0 * * *  ");
    expect(cron.toString()).toBe("0 0 * * *");
  });

  it("throws on invalid cron expression", () => {
    expect(() => CronExpression.create("invalid")).toThrow("Invalid cron expression");
  });

  it("throws on completely malformed expression", () => {
    expect(() => CronExpression.create("")).toThrow("Invalid cron expression");
  });

  it("validates through Zod schema", () => {
    const result = CronExpressionSchema.parse("0 0 * * *");
    expect(result).toBeInstanceOf(CronExpression);
    expect(result.toString()).toBe("0 0 * * *");
  });
});

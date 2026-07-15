import { describe, it, expect, vi } from "vitest";

vi.mock("postgres", () => ({
  default: vi.fn(() => ({
    query: vi.fn(),
    end: vi.fn(),
  })),
}));

describe("Database Connection", () => {
  it("exports connection module", async () => {
    const conn = await import("../src/connection.js");
    expect(conn).toBeDefined();
  });

  it("exports drizzle instance", async () => {
    const mod = await import("../src/index.js");
    expect(mod).toBeDefined();
  });

  it("database schema is defined", async () => {
    const schema = await import("../src/schema/index.js");
    expect(schema).toBeDefined();
  });
});

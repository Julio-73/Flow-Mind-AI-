import { describe, it, expect } from "vitest";
import { Email, EmailSchema } from "../../src/value-objects/email.js";

describe("Email", () => {
  it("creates a valid email", () => {
    const email = Email.create("test@example.com");
    expect(email.toString()).toBe("test@example.com");
  });

  it("normalizes email to lowercase", () => {
    const email = Email.create("Test@Example.COM");
    expect(email.toString()).toBe("test@example.com");
  });

  it("trims whitespace", () => {
    const email = Email.create("  user@domain.com  ");
    expect(email.toString()).toBe("user@domain.com");
  });

  it("extracts domain correctly", () => {
    const email = Email.create("user@flowmind.ai");
    expect(email.domain).toBe("flowmind.ai");
  });

  it("throws on email without @", () => {
    expect(() => Email.create("notanemail")).toThrow("Invalid email address");
  });

  it("throws on email without domain", () => {
    expect(() => Email.create("user@")).toThrow("Invalid email address");
  });

  it("compares two emails for equality", () => {
    const a = Email.create("test@example.com");
    const b = Email.create("test@example.com");
    const c = Email.create("other@domain.com");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it("validates through Zod schema", () => {
    const result = EmailSchema.parse("valid@email.com");
    expect(result).toBeInstanceOf(Email);
  });

  it("throws Zod error for invalid email", () => {
    expect(() => EmailSchema.parse("bad")).toThrow();
  });
});

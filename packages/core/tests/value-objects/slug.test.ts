import { describe, it, expect } from "vitest";
import { Slug, SlugSchema } from "../../src/value-objects/slug.js";

describe("Slug", () => {
  it("creates a valid slug from simple text", () => {
    const slug = Slug.create("hello-world");
    expect(slug.toString()).toBe("hello-world");
  });

  it("normalizes input by lowering case and replacing spaces", () => {
    const slug = Slug.create("Hello World");
    expect(slug.toString()).toBe("hello-world");
  });

  it("handles multiple spaces", () => {
    const slug = Slug.create("My   New  Flow");
    expect(slug.toString()).toBe("my-new-flow");
  });

  it("trims surrounding whitespace", () => {
    const slug = Slug.create("  trailing-spaces  ");
    expect(slug.toString()).toBe("trailing-spaces");
  });

  it("throws on invalid characters", () => {
    expect(() => Slug.create("Hello World!")).toThrow("Invalid slug");
  });

  it("throws on uppercase after normalization attempt with special chars", () => {
    expect(() => Slug.create("UPPERCASE_UNDERSCORE")).toThrow("Invalid slug");
  });

  it("compares two slugs for equality", () => {
    const a = Slug.create("my-slug");
    const b = Slug.create("my-slug");
    const c = Slug.create("other-slug");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it("validates through Zod schema", () => {
    const result = SlugSchema.parse("valid-slug-123");
    expect(result).toBeInstanceOf(Slug);
  });
});

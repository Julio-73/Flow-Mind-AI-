import { z } from "zod";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class Slug {
  private constructor(private readonly value: string) {}

  static create(value: string): Slug {
    const normalized = value.toLowerCase().trim().replace(/\s+/g, "-");
    if (!SLUG_REGEX.test(normalized)) {
      throw new Error(`Invalid slug: ${value}`);
    }
    return new Slug(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }
}

export const SlugSchema = z
  .string()
  .regex(SLUG_REGEX, "Invalid slug format (lowercase, hyphens only)")
  .transform((v) => Slug.create(v));

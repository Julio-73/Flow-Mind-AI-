import { z } from "zod";

export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    const normalized = value.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      throw new Error(`Invalid email address: ${value}`);
    }
    return new Email(normalized);
  }

  toString(): string {
    return this.value;
  }

  get domain(): string {
    return this.value.split("@")[1] ?? "";
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

export const EmailSchema = z
  .string()
  .email()
  .transform((v) => Email.create(v));

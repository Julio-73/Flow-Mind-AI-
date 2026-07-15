import { randomBytes } from "node:crypto";
import { z } from "zod";

const FLOW_ID_PREFIX = "flw_";

export class FlowId {
  private constructor(private readonly value: string) {}

  static generate(): FlowId {
    return new FlowId(`${FLOW_ID_PREFIX}${randomBytes(12).toString("base64url")}`);
  }

  static from(value: string): FlowId {
    if (!value.startsWith(FLOW_ID_PREFIX)) {
      throw new Error(`Invalid flow ID format: ${value}`);
    }
    return new FlowId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: FlowId): boolean {
    return this.value === other.value;
  }
}

export const FlowIdSchema = z
  .string()
  .startsWith(FLOW_ID_PREFIX)
  .min(FLOW_ID_PREFIX.length + 8)
  .transform((v) => FlowId.from(v));

import { z } from "zod";
import type { JsonValue } from "@flowmind/shared";

export type VariableType = "string" | "number" | "boolean" | "json" | "secret";

export interface VariableProps {
  id: string;
  workspaceId: string;
  organizationId: string;
  key: string;
  value: JsonValue;
  type: VariableType;
  description?: string | null;
  isSecret: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Variable {
  private constructor(private readonly props: VariableProps) {}

  static create(props: Omit<VariableProps, "createdAt" | "updatedAt">): Variable {
    return new Variable({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static from(props: VariableProps): Variable {
    return new Variable(props);
  }

  get id(): string { return this.props.id; }
  get workspaceId(): string { return this.props.workspaceId; }
  get organizationId(): string { return this.props.organizationId; }
  get key(): string { return this.props.key; }
  get value(): JsonValue { return this.props.value; }
  get type(): VariableType { return this.props.type; }
  get description(): string | null | undefined { return this.props.description; }
  get isSecret(): boolean { return this.props.isSecret; }
  get createdBy(): string { return this.props.createdBy; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  updateValue(value: JsonValue): void {
    this.props.value = value;
    this.props.updatedAt = new Date();
  }

  toJSON(): VariableProps {
    return { ...this.props };
  }
}

export const CreateVariableSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[A-Z_][A-Z0-9_]*$/i, "Variable key must start with letter/underscore and contain only letters, numbers, underscores"),
  value: z.union([z.string(), z.number(), z.boolean(), z.record(z.unknown()), z.array(z.unknown())]),
  type: z.enum(["string", "number", "boolean", "json", "secret"]).default("string"),
  description: z.string().max(500).optional(),
  isSecret: z.boolean().default(false),
});

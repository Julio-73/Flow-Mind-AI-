import { z } from "zod";
import { NodeType, NodeTypeSchema } from "../value-objects/node-type.js";
import type { JsonValue } from "@flowmind/shared";

export interface NodeProps {
  id: string;
  flowId: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  config: Record<string, JsonValue>;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  retryConfig?: { maxAttempts: number; backoffMs: number } | null;
  timeoutMs?: number | null;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class FlowNode {
  private constructor(private readonly props: NodeProps) {}

  static create(props: Omit<NodeProps, "createdAt" | "updatedAt">): FlowNode {
    return new FlowNode({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static from(props: NodeProps): FlowNode {
    return new FlowNode(props);
  }

  get id(): string { return this.props.id; }
  get flowId(): string { return this.props.flowId; }
  get type(): NodeType { return this.props.type; }
  get label(): string { return this.props.label; }
  get position(): { x: number; y: number } { return { ...this.props.position }; }
  get config(): Record<string, JsonValue> { return { ...this.props.config }; }
  get inputMapping(): Record<string, string> { return { ...this.props.inputMapping }; }
  get outputMapping(): Record<string, string> { return { ...this.props.outputMapping }; }
  get retryConfig(): { maxAttempts: number; backoffMs: number } | null | undefined { return this.props.retryConfig; }
  get timeoutMs(): number | null | undefined { return this.props.timeoutMs; }
  get parentId(): string | null | undefined { return this.props.parentId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  updateConfig(config: Record<string, JsonValue>): void {
    this.props.config = config;
    this.props.updatedAt = new Date();
  }

  updatePosition(position: { x: number; y: number }): void {
    this.props.position = position;
    this.props.updatedAt = new Date();
  }

  toJSON(): NodeProps {
    return { ...this.props };
  }
}

export const CreateNodeSchema = z.object({
  type: NodeTypeSchema,
  label: z.string().min(1).max(200),
  position: z.object({ x: z.number(), y: z.number() }),
  config: z.record(z.unknown()).default({}),
  inputMapping: z.record(z.string()).default({}),
  outputMapping: z.record(z.string()).default({}),
  retryConfig: z.object({
    maxAttempts: z.number().min(1).max(10),
    backoffMs: z.number().min(100).max(60000),
  }).nullable().optional(),
  timeoutMs: z.number().min(100).max(300000).nullable().optional(),
  parentId: z.string().nullable().optional(),
});

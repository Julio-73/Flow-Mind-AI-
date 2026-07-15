import { z } from "zod";
import { FlowId } from "../value-objects/flow-id.js";
import { TriggerType, TriggerTypeSchema } from "../value-objects/trigger-type.js";
import type { JsonValue } from "@flowmind/shared";

export interface Edge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  condition?: string;
}

export interface FlowProps {
  id: string;
  name: string;
  description?: string | null;
  workspaceId: string;
  organizationId: string;
  createdBy: string;
  nodes: FlowNodeData[];
  edges: Edge[];
  triggerType: TriggerType;
  triggerConfig: Record<string, JsonValue>;
  isActive: boolean;
  isDraft: boolean;
  version: number;
  tags: string[];
  lastRunAt?: Date | null;
  lastRunStatus?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowNodeData {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  config: Record<string, JsonValue>;
}

export class Flow {
  private constructor(private readonly props: FlowProps) {}

  static create(props: Omit<FlowProps, "createdAt" | "updatedAt" | "version" | "isDraft" | "tags" | "nodes" | "edges">): Flow {
    return new Flow({
      ...props,
      nodes: [],
      edges: [],
      isDraft: true,
      version: 1,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static from(props: FlowProps): Flow {
    return new Flow(props);
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get description(): string | null | undefined { return this.props.description; }
  get workspaceId(): string { return this.props.workspaceId; }
  get organizationId(): string { return this.props.organizationId; }
  get createdBy(): string { return this.props.createdBy; }
  get nodes(): FlowNodeData[] { return [...this.props.nodes]; }
  get edges(): Edge[] { return [...this.props.edges]; }
  get triggerType(): TriggerType { return this.props.triggerType; }
  get triggerConfig(): Record<string, JsonValue> { return { ...this.props.triggerConfig }; }
  get isActive(): boolean { return this.props.isActive; }
  get isDraft(): boolean { return this.props.isDraft; }
  get version(): number { return this.props.version; }
  get tags(): string[] { return [...this.props.tags]; }
  get lastRunAt(): Date | null | undefined { return this.props.lastRunAt; }
  get lastRunStatus(): string | null | undefined { return this.props.lastRunStatus; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  publish(): void {
    this.props.isDraft = false;
    this.props.version += 1;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  updateNodes(nodes: FlowNodeData[]): void {
    this.props.nodes = nodes;
    this.props.updatedAt = new Date();
  }

  updateEdges(edges: Edge[]): void {
    this.props.edges = edges;
    this.props.updatedAt = new Date();
  }

  toJSON(): FlowProps {
    return { ...this.props };
  }
}

export const CreateFlowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  workspaceId: z.string(),
  triggerType: TriggerTypeSchema,
  triggerConfig: z.record(z.unknown()).default({}),
  tags: z.array(z.string()).default([]),
});

export const UpdateFlowSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  triggerConfig: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

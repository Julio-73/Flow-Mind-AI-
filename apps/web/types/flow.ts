import type { Node, Edge } from "@xyflow/react";

export type FlowStatus = "draft" | "active" | "paused";

export type FlowNodeType =
  | "trigger"
  | "action"
  | "condition"
  | "ai"
  | "webhook"
  | "delay"
  | "transform";

export interface FlowNodeData {
  label: string;
  type: FlowNodeType;
  description?: string;
  icon?: string;
  config?: Record<string, unknown>;
  status?: "idle" | "running" | "success" | "error";
  connector?: string;
  category?: string;
  [key: string]: unknown;
}

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

export interface Flow {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  status: FlowStatus;
  nodes: FlowNode[];
  edges: FlowEdge[];
  tags?: string[];
  workspaceId: string;
  createdById: string;
  lastRunAt?: string;
  lastRunStatus?: "success" | "error" | "running";
  runCount: number;
  successRate: number;
  avgDurationMs: number;
  createdAt: string;
  updatedAt: string;
}

export interface FlowCreateInput {
  name: string;
  description?: string;
  templateId?: string;
  fromScratch?: boolean;
  withAI?: boolean;
  aiPrompt?: string;
}

export interface FlowUpdateInput {
  name?: string;
  description?: string;
  status?: FlowStatus;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  tags?: string[];
}

export interface FlowSummary {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  status: FlowStatus;
  lastRunAt?: string;
  lastRunStatus?: "success" | "error" | "running";
  runCount: number;
  successRate: number;
  updatedAt: string;
}

export interface FlowFilter {
  status?: FlowStatus;
  connector?: string;
  search?: string;
  sort?: "updated" | "name" | "runs" | "success";
}

import type { FlowNode } from "../entities/node.js";

export interface NodeRepository {
  findById(id: string): Promise<FlowNode | null>;
  findByFlow(flowId: string): Promise<FlowNode[]>;
  create(node: FlowNode): Promise<FlowNode>;
  createMany(nodes: FlowNode[]): Promise<FlowNode[]>;
  update(node: FlowNode): Promise<FlowNode>;
  delete(id: string): Promise<void>;
  deleteByFlow(flowId: string): Promise<void>;
}

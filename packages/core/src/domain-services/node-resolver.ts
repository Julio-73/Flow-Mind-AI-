import type { Edge, FlowNodeData } from "../entities/flow.js";

export interface TopologicalSortResult {
  ordered: string[];
  hasCycle: boolean;
}

export class NodeResolver {
  resolveExecutionOrder(nodes: FlowNodeData[], edges: Edge[]): TopologicalSortResult {
    const adjacency = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const node of nodes) {
      adjacency.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    for (const edge of edges) {
      const targets = adjacency.get(edge.sourceNodeId);
      if (targets) targets.push(edge.targetNodeId);
      inDegree.set(edge.targetNodeId, (inDegree.get(edge.targetNodeId) ?? 0) + 1);
    }

    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) queue.push(nodeId);
    }

    const ordered: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      ordered.push(current);
      const neighbors = adjacency.get(current) ?? [];
      for (const neighbor of neighbors) {
        const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      }
    }

    return {
      ordered,
      hasCycle: ordered.length !== nodes.length,
    };
  }

  getDependencies(nodeId: string, edges: Edge[]): string[] {
    return edges
      .filter((e) => e.targetNodeId === nodeId)
      .map((e) => e.sourceNodeId);
  }

  getDependents(nodeId: string, edges: Edge[]): string[] {
    return edges
      .filter((e) => e.sourceNodeId === nodeId)
      .map((e) => e.targetNodeId);
  }

  getLeafNodes(edges: Edge[], allNodeIds: string[]): string[] {
    const hasOutgoing = new Set(edges.map((e) => e.sourceNodeId));
    return allNodeIds.filter((id) => !hasOutgoing.has(id));
  }

  getRootNodes(edges: Edge[], allNodeIds: string[]): string[] {
    const hasIncoming = new Set(edges.map((e) => e.targetNodeId));
    return allNodeIds.filter((id) => !hasIncoming.has(id));
  }
}

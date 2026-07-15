import { NodeType, isTriggerType } from "../value-objects/node-type.js";
import type { Edge, FlowNodeData } from "../entities/flow.js";
import { ValidationError } from "@flowmind/shared";

export interface ValidationResult {
  isValid: boolean;
  errors: FlowValidationError[];
}

export interface FlowValidationError {
  type: "CYCLE" | "INVALID_NODE" | "TRIGGER_REQUIRED" | "MULTIPLE_TRIGGERS" | "DISCONNECTED_NODE" | "INVALID_EDGE" | "MISSING_CONFIG";
  nodeId?: string;
  message: string;
}

export class FlowValidator {
  validate(nodes: FlowNodeData[], edges: Edge[]): ValidationResult {
    const errors: FlowValidationError[] = [];

    const triggerErrors = this.validateTriggers(nodes);
    errors.push(...triggerErrors);

    const cycleErrors = this.detectCycles(nodes, edges);
    errors.push(...cycleErrors);

    const disconnectedErrors = this.validateConnectivity(nodes, edges);
    errors.push(...disconnectedErrors);

    const edgeErrors = this.validateEdges(nodes, edges);
    errors.push(...edgeErrors);

    const configErrors = this.validateNodeConfigs(nodes);
    errors.push(...configErrors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateTriggers(nodes: FlowNodeData[]): FlowValidationError[] {
    const errors: FlowValidationError[] = [];
    const triggers = nodes.filter((n) => isTriggerType(n.type as NodeType));

    if (triggers.length === 0) {
      errors.push({
        type: "TRIGGER_REQUIRED",
        message: "Flow must have at least one trigger node",
      });
    }

    if (triggers.length > 1) {
      for (const t of triggers) {
        errors.push({
          type: "MULTIPLE_TRIGGERS",
          nodeId: t.id,
          message: `Multiple triggers found: ${t.label}. Only one trigger is allowed.`,
        });
      }
    }

    return errors;
  }

  private detectCycles(nodes: FlowNodeData[], edges: Edge[]): FlowValidationError[] {
    const errors: FlowValidationError[] = [];
    const adjacency = new Map<string, string[]>();

    for (const node of nodes) {
      adjacency.set(node.id, []);
    }
    for (const edge of edges) {
      const targets = adjacency.get(edge.sourceNodeId);
      if (targets) targets.push(edge.targetNodeId);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);
      const neighbors = adjacency.get(nodeId) ?? [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          errors.push({
            type: "CYCLE",
            nodeId: neighbor,
            message: `Cycle detected involving node ${neighbor}`,
          });
          return true;
        }
      }
      recStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    }

    return errors;
  }

  private validateConnectivity(nodes: FlowNodeData[], edges: Edge[]): FlowValidationError[] {
    const errors: FlowValidationError[] = [];
    const connectedNodes = new Set<string>();

    for (const edge of edges) {
      connectedNodes.add(edge.sourceNodeId);
      connectedNodes.add(edge.targetNodeId);
    }

    for (const node of nodes) {
      if (!connectedNodes.has(node.id) && nodes.length > 1) {
        errors.push({
          type: "DISCONNECTED_NODE",
          nodeId: node.id,
          message: `Node "${node.label}" is not connected to any other node`,
        });
      }
    }

    return errors;
  }

  private validateEdges(nodes: FlowNodeData[], edges: Edge[]): FlowValidationError[] {
    const errors: FlowValidationError[] = [];
    const nodeIds = new Set(nodes.map((n) => n.id));

    for (const edge of edges) {
      if (!nodeIds.has(edge.sourceNodeId)) {
        errors.push({
          type: "INVALID_EDGE",
          nodeId: edge.sourceNodeId,
          message: `Edge references non-existent source node: ${edge.sourceNodeId}`,
        });
      }
      if (!nodeIds.has(edge.targetNodeId)) {
        errors.push({
          type: "INVALID_EDGE",
          nodeId: edge.targetNodeId,
          message: `Edge references non-existent target node: ${edge.targetNodeId}`,
        });
      }
    }

    return errors;
  }

  private validateNodeConfigs(nodes: FlowNodeData[]): FlowValidationError[] {
    const errors: FlowValidationError[] = [];

    for (const node of nodes) {
      if (node.type === NodeType.WEBHOOK && !node.config["path"]) {
        errors.push({
          type: "MISSING_CONFIG",
          nodeId: node.id,
          message: `Webhook node "${node.label}" requires a path configuration`,
        });
      }
      if (node.type === NodeType.AI && !node.config["prompt"]) {
        errors.push({
          type: "MISSING_CONFIG",
          nodeId: node.id,
          message: `AI node "${node.label}" requires a prompt configuration`,
        });
      }
    }

    return errors;
  }
}

import { z } from "zod";

export const NodeType = {
  TRIGGER: "TRIGGER",
  ACTION: "ACTION",
  CONDITION: "CONDITION",
  DELAY: "DELAY",
  AI: "AI",
  WEBHOOK: "WEBHOOK",
  LOOP: "LOOP",
  TRANSFORM: "TRANSFORM",
} as const;

export type NodeType = (typeof NodeType)[keyof typeof NodeType];

export const NodeTypeSchema = z.nativeEnum(NodeType);

export function isTriggerType(type: NodeType): boolean {
  return type === NodeType.TRIGGER || type === NodeType.WEBHOOK;
}

export function isExecutableType(type: NodeType): boolean {
  return !isTriggerType(type);
}

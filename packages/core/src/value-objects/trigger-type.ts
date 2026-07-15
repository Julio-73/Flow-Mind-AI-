import { z } from "zod";

export const TriggerType = {
  SCHEDULE: "SCHEDULE",
  WEBHOOK: "WEBHOOK",
  SLACK: "SLACK",
  GMAIL: "GMAIL",
  MANUAL: "MANUAL",
  FORM: "FORM",
  DATABASE: "DATABASE",
} as const;

export type TriggerType = (typeof TriggerType)[keyof typeof TriggerType];

export const TriggerTypeSchema = z.nativeEnum(TriggerType);

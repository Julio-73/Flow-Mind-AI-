import { z } from "zod";

export const ExecutionStatus = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  TIMED_OUT: "TIMED_OUT",
  RETRYING: "RETRYING",
} as const;

export type ExecutionStatus = (typeof ExecutionStatus)[keyof typeof ExecutionStatus];

export const ExecutionStatusSchema = z.nativeEnum(ExecutionStatus);

const TERMINAL_STATUSES: ExecutionStatus[] = [
  ExecutionStatus.SUCCESS,
  ExecutionStatus.FAILED,
  ExecutionStatus.CANCELLED,
  ExecutionStatus.TIMED_OUT,
];

export function isTerminalStatus(status: ExecutionStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function canTransition(from: ExecutionStatus, to: ExecutionStatus): boolean {
  const transitions: Record<ExecutionStatus, ExecutionStatus[]> = {
    PENDING: [ExecutionStatus.RUNNING, ExecutionStatus.CANCELLED],
    RUNNING: [
      ExecutionStatus.SUCCESS,
      ExecutionStatus.FAILED,
      ExecutionStatus.PAUSED,
      ExecutionStatus.RETRYING,
    ],
    PAUSED: [ExecutionStatus.RUNNING, ExecutionStatus.CANCELLED],
    SUCCESS: [],
    FAILED: [ExecutionStatus.RETRYING],
    CANCELLED: [],
    TIMED_OUT: [ExecutionStatus.RETRYING],
    RETRYING: [ExecutionStatus.RUNNING, ExecutionStatus.FAILED],
  };
  return transitions[from]?.includes(to) ?? false;
}

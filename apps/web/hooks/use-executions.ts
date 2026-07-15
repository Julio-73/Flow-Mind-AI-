"use client";

import { useQuery } from "@tanstack/react-query";
import type { Execution, ExecutionSummary, ExecutionFilter, MonitorStats, LiveExecution } from "@/types/execution";

const MOCK_EXECUTIONS: ExecutionSummary[] = [
  { id: "e1", flowId: "f1", flowName: "Email Processing", status: "success", trigger: "webhook", startedAt: "2026-07-11T09:30:00Z", durationMs: 2340, stepsCount: 5, errorCount: 0 },
  { id: "e2", flowId: "f2", flowName: "Slack Alerts", status: "running", trigger: "event", startedAt: "2026-07-11T09:29:00Z", durationMs: 1200, stepsCount: 3, errorCount: 0 },
  { id: "e3", flowId: "f3", flowName: "Invoice Parser", status: "error", trigger: "manual", startedAt: "2026-07-11T09:28:00Z", durationMs: 5600, stepsCount: 4, errorCount: 1 },
  { id: "e4", flowId: "f1", flowName: "Email Processing", status: "success", trigger: "webhook", startedAt: "2026-07-11T09:25:00Z", durationMs: 1890, stepsCount: 5, errorCount: 0 },
  { id: "e5", flowId: "f4", flowName: "Customer Onboarding", status: "pending", trigger: "schedule", startedAt: "2026-07-11T09:20:00Z", durationMs: 0, stepsCount: 0, errorCount: 0 },
];

async function fetchExecutions(_filter?: ExecutionFilter): Promise<ExecutionSummary[]> {
  await new Promise((r) => setTimeout(r, 500));
  return MOCK_EXECUTIONS;
}

async function fetchExecutionById(_id: string): Promise<Execution> {
  await new Promise((r) => setTimeout(r, 400));
  return {
    id: _id,
    flowId: "f1",
    flowName: "Email Processing",
    status: "success",
    trigger: "webhook",
    startedAt: "2026-07-11T09:30:00Z",
    completedAt: "2026-07-11T09:30:02Z",
    durationMs: 2340,
    steps: [
      { id: "s1", nodeId: "n1", nodeName: "Webhook Trigger", nodeType: "trigger", status: "success", startedAt: "2026-07-11T09:30:00Z", completedAt: "2026-07-11T09:30:00Z", durationMs: 120, input: { method: "POST" }, output: { status: 200 } },
      { id: "s2", nodeId: "n2", nodeName: "Parse Email", nodeType: "action", status: "success", startedAt: "2026-07-11T09:30:00Z", completedAt: "2026-07-11T09:30:01Z", durationMs: 800, input: { raw: "..." }, output: { subject: "Invoice #123", body: "...", attachments: 2 } },
      { id: "s3", nodeId: "n3", nodeName: "Extract Data", nodeType: "ai", status: "success", startedAt: "2026-07-11T09:30:01Z", completedAt: "2026-07-11T09:30:02Z", durationMs: 1100, input: { text: "..." }, output: { amount: 1500, vendor: "ACME Corp" } },
      { id: "s4", nodeId: "n4", nodeName: "Save to DB", nodeType: "action", status: "success", startedAt: "2026-07-11T09:30:02Z", completedAt: "2026-07-11T09:30:02Z", durationMs: 200, input: { data: {} }, output: { recordId: "rec_123" } },
      { id: "s5", nodeId: "n5", nodeName: "Notify Slack", nodeType: "action", status: "success", startedAt: "2026-07-11T09:30:02Z", completedAt: "2026-07-11T09:30:02Z", durationMs: 120, input: { message: "..." }, output: { sent: true } },
    ],
    createdById: "u1",
  };
}

export function useExecutions(filter?: ExecutionFilter) {
  return useQuery({
    queryKey: ["executions", filter],
    queryFn: () => fetchExecutions(filter),
  });
}

export function useExecution(id: string) {
  return useQuery({
    queryKey: ["execution", id],
    queryFn: () => fetchExecutionById(id),
    enabled: !!id,
  });
}

export function useMonitorStats() {
  return useQuery({
    queryKey: ["monitor-stats"],
    queryFn: async (): Promise<MonitorStats> => {
      await new Promise((r) => setTimeout(r, 300));
      return {
        activeExecutions: 3,
        completedPerMin: 12.5,
        failuresPerMin: 0.8,
        avgDurationMs: 2100,
        successRate: 0.96,
      };
    },
    refetchInterval: 5000,
  });
}

export function useLiveExecutions() {
  return useQuery({
    queryKey: ["live-executions"],
    queryFn: async (): Promise<LiveExecution[]> => {
      await new Promise((r) => setTimeout(r, 300));
      return [
        { id: "e2", flowId: "f2", flowName: "Slack Alerts", currentNodeName: "Parse Message", currentNodeType: "action", durationMs: 1200, startedAt: "2026-07-11T09:29:00Z" },
        { id: "e6", flowId: "f6", flowName: "Data Sync", currentNodeName: "Transform JSON", currentNodeType: "transform", durationMs: 3400, startedAt: "2026-07-11T09:28:00Z" },
      ];
    },
    refetchInterval: 3000,
  });
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FlowSummary, FlowCreateInput, FlowUpdateInput, FlowFilter } from "@/types/flow";

async function fetchFlows(_filter?: FlowFilter): Promise<FlowSummary[]> {
  const res = await fetch("/api/flows");
  if (!res.ok) throw new Error("Failed to fetch flows");
  return res.json();
}

async function createFlowApi(input: FlowCreateInput): Promise<FlowSummary> {
  const res = await fetch("/api/flows", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create flow");
  return res.json();
}

export function useFlows(filter?: FlowFilter) {
  return useQuery({
    queryKey: ["flows", filter],
    queryFn: () => fetchFlows(filter),
  });
}

export { useExecutions } from "./use-executions";

export function useCreateFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFlowApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flows"] }),
  });
}

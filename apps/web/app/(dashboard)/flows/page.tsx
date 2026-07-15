"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchCommand } from "@/components/shared/search-command";
import { FlowCard, FlowCardSkeleton } from "@/components/features/flows/flow-card";
import { EmptyState, ErrorState } from "@/components/shared/states";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useFlows, useCreateFlow } from "@/hooks/use-flows";
import { useRouter } from "next/navigation";
import type { FlowSummary, FlowFilter } from "@/types/flow";
import { FLOW_STATUS_COLORS } from "@/lib/constants";
import { GitBranch, Plus, Sparkles, LayoutTemplate, Search, Filter } from "lucide-react";

export default function FlowsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewFlow, setShowNewFlow] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");
  const { data: flows, isLoading, error } = useFlows();
  const createFlow = useCreateFlow();

  const filtered = (flows || []).filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Flows"
        description="Create and manage your automation flows"
        actions={
          <Button variant="biolume" onClick={() => setShowNewFlow(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Flow
          </Button>
        }
      />

      <SearchCommand
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={() => setSearchQuery("")}
        filters={[
          {
            label: "Status",
            value: statusFilter,
            options: [
              { label: "All", value: "all" },
              { label: "Active", value: "active" },
              { label: "Draft", value: "draft" },
              { label: "Paused", value: "paused" },
            ],
            onValueChange: setStatusFilter,
          },
        ]}
      />

      {error ? (
        <ErrorState message={error.message} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <FlowCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<GitBranch className="h-12 w-12" />}
          title={searchQuery ? "No flows match your search" : "No flows yet"}
          description={
            searchQuery
              ? "Try a different search term"
              : "Create your first flow to start automating"
          }
          action={
            searchQuery
              ? undefined
              : { label: "Create Flow", onClick: () => setShowNewFlow(true) }
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((flow) => (
            <FlowCard key={flow.id} flow={flow} />
          ))}
        </div>
      )}

      {/* New Flow Dialog */}
      <Dialog open={showNewFlow} onOpenChange={setShowNewFlow}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Flow</DialogTitle>
            <DialogDescription>
              Create a new automation flow
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
              placeholder="Flow name"
              label="Name"
              autoFocus
            />
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setNewFlowName("Untitled Flow");
                  createFlow.mutate(
                    { name: newFlowName || "Untitled Flow" },
                    { onSuccess: (flow) => { setShowNewFlow(false); router.push(`/flows/${flow.id}/edit`); } }
                  );
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-biolume/50 hover:bg-biolume/5 transition-all"
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs font-medium">From Scratch</span>
              </button>
              <button
                onClick={() => {
                  setShowNewFlow(false);
                  router.push("/templates");
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-cobalto/50 hover:bg-cobalto/5 transition-all"
              >
                <LayoutTemplate className="h-5 w-5" />
                <span className="text-xs font-medium">From Template</span>
              </button>
              <button
                onClick={() => {
                  setNewFlowName("AI-generated Flow");
                  createFlow.mutate(
                    { name: "AI-generated Flow", description: "Created with AI" },
                    { onSuccess: (flow) => { setShowNewFlow(false); router.push(`/flows/${flow.id}/edit`); } }
                  );
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-ember/50 hover:bg-ember/5 transition-all"
              >
                <Sparkles className="h-5 w-5" />
                <span className="text-xs font-medium">With AI</span>
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewFlow(false)}>
              Cancel
            </Button>
            <Button
              variant="biolume"
              disabled={!newFlowName}
              onClick={() => {
                createFlow.mutate(
                  { name: newFlowName },
                  { onSuccess: (flow) => { setShowNewFlow(false); router.push(`/flows/${flow.id}/edit`); } }
                );
              }}
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

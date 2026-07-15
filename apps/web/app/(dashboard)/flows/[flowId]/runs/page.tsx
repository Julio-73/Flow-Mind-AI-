"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ExecutionTimeline, StepDetail, LogStream } from "@/components/features/executions";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useExecutions, useExecution } from "@/hooks/use-executions";
import { formatDuration, formatRelativeTime } from "@/lib/utils";
import {
  Activity,
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function FlowRunsPage() {
  const params = useParams();
  const flowId = params["flowId"] as string;
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: executions, isLoading, error } = useExecutions({ flowId });
  const { data: execution } = useExecution(selectedId || "");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Execution History"
        description={`Runs for flow ${flowId}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" /> Recent Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <ErrorState message={error.message} />
              ) : (
                <ExecutionTimeline
                  executions={executions || []}
                  loading={isLoading}
                  onSelect={setSelectedId}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail Panel */}
        <div>
          {selectedId && execution ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Terminal className="h-4 w-4" /> Execution Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={
                      execution.status === "success" ? "success" :
                      execution.status === "error" ? "destructive" :
                      "warning"
                    }>
                      {execution.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{formatDuration(execution.durationMs)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Trigger</span>
                    <span className="capitalize">{execution.trigger}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Started</span>
                    <span>{formatRelativeTime(execution.startedAt)}</span>
                  </div>
                </div>

                <Tabs defaultValue="steps">
                  <TabsList className="w-full">
                    <TabsTrigger value="steps" className="flex-1">Steps</TabsTrigger>
                    <TabsTrigger value="logs" className="flex-1">Logs</TabsTrigger>
                  </TabsList>
                  <TabsContent value="steps" className="space-y-2 mt-3">
                    {execution.steps.map((step) => (
                      <StepDetail key={step.id} step={step} />
                    ))}
                  </TabsContent>
                  <TabsContent value="logs" className="mt-3">
                    <LogStream />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Terminal className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Select an execution to view details
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration, formatRelativeTime } from "@/lib/utils";
import { useMonitorStats, useLiveExecutions } from "@/hooks/use-executions";
import {
  Activity,
  Play,
  XCircle,
  Timer,
  TrendingUp,
  Pause,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

export function MonitorStatsCards() {
  const { data: stats, isLoading } = useMonitorStats();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {[
        { title: "Active Now", value: stats?.activeExecutions ?? 0, icon: <Activity className="h-4 w-4" />, variant: "accent" as const },
        { title: "Completed/min", value: stats?.completedPerMin.toFixed(1) ?? 0, icon: <Play className="h-4 w-4" />, variant: "success" as const },
        { title: "Failures/min", value: stats?.failuresPerMin.toFixed(1) ?? 0, icon: <XCircle className="h-4 w-4" />, variant: "danger" as const },
        { title: "Avg Duration", value: stats ? formatDuration(stats.avgDurationMs) : 0, icon: <Timer className="h-4 w-4" /> },
        { title: "Success Rate", value: stats ? `${(stats.successRate * 100).toFixed(1)}%` : 0, icon: <TrendingUp className="h-4 w-4" />, variant: "success" as const },
      ].map((item) => (
        <Card key={item.title} variant={item.variant as any}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1">
              {item.icon}
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold font-sora">{String(item.value)}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LiveExecutionStream() {
  const { data: executions, isLoading } = useLiveExecutions();
  const [autoScroll, setAutoScroll] = useState(true);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Live Executions</CardTitle>
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`text-xs flex items-center gap-1 transition-colors ${
            autoScroll ? "text-biolume" : "text-muted-foreground"
          }`}
        >
          {autoScroll ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          {autoScroll ? "Auto-scroll on" : "Paused"}
        </button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !executions?.length ? (
          <div className="text-sm text-muted-foreground text-center py-8">No active executions</div>
        ) : (
          <div className="space-y-2">
            {executions.map((exec) => (
              <div
                key={exec.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/50 bg-card animate-slide-up"
              >
                <div className="h-2 w-2 rounded-full bg-biolume animate-pulse shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{exec.flowName}</div>
                  <div className="text-xs text-muted-foreground">
                    Current: {exec.currentNodeName} · {formatDuration(exec.durationMs)}
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] animate-pulse">
                  Running
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

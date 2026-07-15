"use client";

import { StatsCard } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlows, useExecutions } from "@/hooks/use-flows";
import { formatRelativeTime, formatNumber, formatPercentage } from "@/lib/utils";
import { FLOW_STATUS_COLORS, EXECUTION_STATUS_COLORS } from "@/lib/constants";
import {
  Activity,
  GitBranch,
  Play,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  HeartPulse,
  Waves,
} from "lucide-react";
import Link from "next/link";

const MOCK_HEALTH = "healthy";

const CHART_DATA = [
  { time: "00:00", value: 12 }, { time: "02:00", value: 8 },
  { time: "04:00", value: 5 }, { time: "06:00", value: 15 },
  { time: "08:00", value: 42 }, { time: "10:00", value: 38 },
  { time: "12:00", value: 35 }, { time: "14:00", value: 45 },
  { time: "16:00", value: 40 }, { time: "18:00", value: 28 },
  { time: "20:00", value: 22 }, { time: "22:00", value: 16 },
];

const MOCK_RECENT_ERRORS = [
  { id: "e1", flow: "Invoice Parser", message: "OpenAI API timeout after 30s", time: "2026-07-11T09:28:00Z" },
  { id: "e2", flow: "Slack Alerts", message: "Rate limit exceeded", time: "2026-07-11T07:15:00Z" },
];

export function KpiCards() {
  const { data: flows, isLoading: flowsLoading } = useFlows();
  const activeFlows = flows?.filter((f) => f.status === "active").length || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Active Flows"
        value={formatNumber(activeFlows)}
        icon={<GitBranch className="h-4 w-4" />}
        loading={flowsLoading}
        variant="accent"
      />
      <StatsCard
        title="Failures Today"
        value="3"
        description="Last 24h"
        trend={{ value: 12, positive: false }}
        icon={<AlertCircle className="h-4 w-4" />}
        variant="danger"
      />
      <StatsCard
        title="Executions Today"
        value={formatNumber(1234)}
        trend={{ value: 8, positive: true }}
        icon={<Play className="h-4 w-4" />}
      />
      <StatsCard
        title="Success Rate"
        value="96.2%"
        trend={{ value: 0.5, positive: true }}
        icon={<TrendingUp className="h-4 w-4" />}
        variant="success"
      />
    </div>
  );
}

export function ExecutionChart() {
  const max = Math.max(...CHART_DATA.map((d) => d.value));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Executions (24h)</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-[3px] h-32">
          {CHART_DATA.map((d) => (
            <div
              key={d.time}
              className="flex-1 relative group"
            >
              <div
                className="w-full rounded-t-sm bg-gradient-to-t from-biolume/40 to-biolume/60 hover:from-biolume/60 hover:to-biolume/80 transition-all duration-200 ease-flow cursor-pointer relative"
                style={{ height: `${(d.value / max) * 100}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border text-xs px-2 py-1 rounded shadow whitespace-nowrap transition-opacity z-10">
                  {d.value} runs at {d.time}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground tabular-nums">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>Now</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentFlows() {
  const { data: flows, isLoading } = useFlows();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Recent Flows</CardTitle>
        <Link href="/flows" className="text-xs text-biolume hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {flows?.slice(0, 5).map((flow) => (
              <Link
                key={flow.id}
                href={`/flows/${flow.id}/edit`}
                className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/30 transition-colors group"
              >
                <div className={`w-2 h-2 rounded-full ${FLOW_STATUS_COLORS[flow.status]} animate-breathe`} aria-hidden="true" />
                <span className="sr-only">{flow.status}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{flow.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {flow.runCount} runs · {formatRelativeTime(flow.updatedAt)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentErrors() {
  return (
    <Card variant="interactive">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Recent Errors</CardTitle>
        <XCircle className="h-4 w-4 text-destructive" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {MOCK_RECENT_ERRORS.map((err) => (
            <div key={err.id} className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{err.flow}</p>
                <p className="text-xs text-muted-foreground">{err.message}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {formatRelativeTime(err.time)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function HealthIndicator() {
  const statusConfig = {
    healthy: { color: "bg-emerald-500", text: "All Systems Operational", dot: "bg-emerald-500" },
    degraded: { color: "bg-amber-500", text: "Degraded Performance", dot: "bg-amber-500" },
    down: { color: "bg-destructive", text: "Service Down", dot: "bg-destructive" },
  };

  const config = statusConfig[MOCK_HEALTH];

  return (
    <Card variant="accent" className="col-span-full lg:col-span-1">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <HeartPulse className="h-5 w-5 text-biolume animate-breathe" />
        <div>
          <CardTitle className="text-sm">Workspace Health</CardTitle>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={`h-2 w-2 rounded-full ${config.dot} animate-pulse`} />
            <span className="text-xs text-muted-foreground">{config.text}</span>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

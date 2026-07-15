"use client";

import dynamic from "next/dynamic";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { CHART_PERIODS } from "@/lib/constants";
import { useState } from "react";
import { cn } from "@/lib/utils";

const KpiCards = dynamic(
  () => import("@/components/features/dashboard").then((m) => m.KpiCards),
  {
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4"><div className="h-20 animate-pulse bg-muted/30 rounded" /></CardContent></Card>
        ))}
      </div>
    ),
    ssr: false,
  }
);

const ExecutionChart = dynamic(
  () => import("@/components/features/dashboard").then((m) => m.ExecutionChart),
  {
    loading: () => (
      <Card><CardContent className="p-4"><div className="h-48 animate-pulse bg-muted/30 rounded" /></CardContent></Card>
    ),
    ssr: false,
  }
);

const RecentFlows = dynamic(
  () => import("@/components/features/dashboard").then((m) => m.RecentFlows),
  {
    loading: () => (
      <Card><CardContent className="p-4 space-y-3"><div className="h-48 animate-pulse bg-muted/30 rounded" /></CardContent></Card>
    ),
    ssr: false,
  }
);

const RecentErrors = dynamic(
  () => import("@/components/features/dashboard").then((m) => m.RecentErrors),
  {
    loading: () => (
      <Card><CardContent className="p-4"><div className="h-24 animate-pulse bg-muted/30 rounded" /></CardContent></Card>
    ),
    ssr: false,
  }
);

const HealthIndicator = dynamic(
  () => import("@/components/features/dashboard").then((m) => m.HealthIndicator),
  {
    loading: () => (
      <Card><CardContent className="p-4"><div className="h-16 animate-pulse bg-muted/30 rounded" /></CardContent></Card>
    ),
    ssr: false,
  }
);

export default function DashboardPage() {
  const router = useRouter();
  const [period, setPeriod] = useState("24h");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-4 sm:pb-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your workspace activity"
        actions={
          <Button variant="biolume" onClick={() => router.push("/flows")}>
            <Plus className="h-4 w-4 mr-1" /> New Flow
          </Button>
        }
      />

      {/* Period filter */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5" role="radiogroup" aria-label="Chart period">
        {CHART_PERIODS.map((p) => (
          <button
            key={p.value}
            role="radio"
            aria-checked={period === p.value}
            onClick={() => setPeriod(p.value)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-md transition-all duration-200 ease-flow whitespace-nowrap min-h-[32px]",
              period === p.value
                ? "bg-biolume text-void font-medium shadow-sm shadow-biolume/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="animate-page-enter-stagger">
        <KpiCards />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-page-enter-stagger">
        <div className="lg:col-span-2">
          <ExecutionChart />
        </div>
        <HealthIndicator />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-page-enter-stagger">
        <RecentFlows />
        <RecentErrors />
      </div>
    </div>
  );
}

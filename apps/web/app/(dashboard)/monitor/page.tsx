"use client";

import { PageHeader } from "@/components/shared/page-header";
import { MonitorStatsCards, LiveExecutionStream } from "@/components/features/monitor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Radio } from "lucide-react";

export default function MonitorPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Monitor"
        description="Real-time execution monitoring"
      />

      <MonitorStatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiveExecutionStream />
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Radio className="h-4 w-4" /> Node Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { node: "Webhook Trigger", count: 245, rate: "12/min" },
                { node: "Parse Email", count: 189, rate: "9/min" },
                { node: "AI Extraction", count: 156, rate: "7/min" },
                { node: "Save to DB", count: 134, rate: "6/min" },
                { node: "Notify Slack", count: 98, rate: "4/min" },
              ].map((item) => (
                <div key={item.node} className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-muted/30">
                  <div className="w-2 h-2 rounded-full bg-biolume/60" aria-hidden="true" />
                  <span className="sr-only">Active</span>
                  <span className="text-xs flex-1">{item.node}</span>
                  <span className="text-xs text-muted-foreground">{item.count}</span>
                  <span className="text-[10px] text-biolume">{item.rate}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

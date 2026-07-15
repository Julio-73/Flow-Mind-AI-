"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { formatRelativeTime, formatDuration } from "@/lib/utils";
import { EXECUTION_STATUS_COLORS } from "@/lib/constants";
import type { Execution, ExecutionStep, ExecutionSummary } from "@/types/execution";
import {
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Terminal,
  FileJson,
} from "lucide-react";
import { useState } from "react";

interface ExecutionTimelineProps {
  executions: ExecutionSummary[];
  loading?: boolean;
  onSelect: (id: string) => void;
}

export function ExecutionTimeline({ executions, loading, onSelect }: ExecutionTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {executions.map((exec) => (
        <button
          key={exec.id}
          onClick={() => onSelect(exec.id)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors text-left group"
        >
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            exec.status === "success" ? "bg-emerald-500" :
            exec.status === "error" ? "bg-destructive" :
            exec.status === "running" ? "bg-biolume animate-pulse" :
            "bg-muted-foreground"
          }`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{exec.flowName}</span>
              <Badge variant="outline" className="text-[10px]">{exec.trigger}</Badge>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
              <span>{formatDuration(exec.durationMs)}</span>
              <span>{exec.stepsCount} steps</span>
              <span>{formatRelativeTime(exec.startedAt)}</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </div>
  );
}

export function StepDetail({ step }: { step: ExecutionStep }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <div className={`w-2 h-2 rounded-full ${
          step.status === "success" ? "bg-emerald-500" :
          step.status === "error" ? "bg-destructive" :
          step.status === "running" ? "bg-biolume animate-pulse" :
          "bg-muted-foreground"
        }`} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">{step.nodeName}</span>
          <span className="text-xs text-muted-foreground ml-2">{step.nodeType}</span>
        </div>
        <span className="text-xs text-muted-foreground">{formatDuration(step.durationMs)}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2 border-t border-border/50">
          {step.input && (
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Terminal className="h-3 w-3" /> Input
              </div>
              <pre className="text-xs bg-muted/30 rounded p-2 overflow-x-auto">
                {JSON.stringify(step.input, null, 2)}
              </pre>
            </div>
          )}
          {step.output && (
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <FileJson className="h-3 w-3" /> Output
              </div>
              <pre className="text-xs bg-muted/30 rounded p-2 overflow-x-auto">
                {JSON.stringify(step.output, null, 2)}
              </pre>
            </div>
          )}
          {step.error && (
            <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/5 rounded p-2">
              <AlertCircle className="h-3 w-3 mt-0.5" />
              <span>{step.error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LogStream() {
  const [logs] = useState([
    { time: "09:30:00.123", level: "info", message: "Webhook received: POST /api/hooks/email" },
    { time: "09:30:00.245", level: "info", message: "Parsing email: Invoice #123 from ACME Corp" },
    { time: "09:30:01.045", level: "info", message: "AI extraction started..." },
    { time: "09:30:02.110", level: "info", message: "AI extraction completed: 3 fields found" },
    { time: "09:30:02.315", level: "info", message: "Saving to database: rec_123" },
    { time: "09:30:02.435", level: "success", message: "Notifying Slack: channel #invoices" },
    { time: "09:30:02.440", level: "success", message: "Flow completed successfully (2.34s)" },
  ]);

  return (
    <div className="space-y-0.5">
      {logs.map((log, i) => (
        <div key={i} className="flex gap-2 text-xs font-mono px-2 py-0.5 rounded hover:bg-muted/30">
          <span className="text-muted-foreground/60 shrink-0">{log.time}</span>
          <span className={
            log.level === "error" ? "text-destructive" :
            log.level === "success" ? "text-emerald-500" :
            log.level === "warning" ? "text-amber-500" :
            "text-foreground/80"
          }>
            {log.message}
          </span>
        </div>
      ))}
    </div>
  );
}

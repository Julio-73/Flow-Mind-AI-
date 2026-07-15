"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FLOW_STATUS_COLORS } from "@/lib/constants";
import { formatRelativeTime, formatNumber } from "@/lib/utils";
import {
  GitBranch,
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  Copy,
} from "lucide-react";
import type { FlowSummary } from "@/types/flow";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface FlowCardProps {
  flow: FlowSummary;
}

export function FlowCard({ flow }: FlowCardProps) {
  return (
    <Link href={`/flows/${flow.id}/edit`}>
      <Card variant="interactive" className="group h-full">
        <CardContent className="p-3 sm:p-4 flex flex-col h-full">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className={`w-2 h-2 rounded-full shrink-0 ${FLOW_STATUS_COLORS[flow.status]} animate-breathe`} aria-hidden="true" />
              <span className="sr-only">{flow.status}</span>
              <h3 className="text-sm font-semibold font-sora truncate">{flow.name}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground shrink-0 ml-2">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Play className="h-4 w-4 mr-2" /> Run
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pause className="h-4 w-4 mr-2" /> {flow.status === "active" ? "Pause" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
            <div className="flex items-center gap-1 tabular-nums">
              <Play className="h-3 w-3" />
              <span>{formatNumber(flow.runCount)}</span>
            </div>
            <div className="flex items-center gap-1 tabular-nums">
              <span className={`text-xs ${flow.successRate >= 0.95 ? "text-emerald-500" : flow.successRate >= 0.8 ? "text-amber-500" : "text-destructive"}`}>
                {(flow.successRate * 100).toFixed(0)}%
              </span>
            </div>
            <span className="ml-auto truncate">{formatRelativeTime(flow.updatedAt)}</span>
          </div>

          {flow.lastRunStatus && (
            <div className="mt-2">
              <Badge
                variant={
                  flow.lastRunStatus === "success"
                    ? "success"
                    : flow.lastRunStatus === "error"
                    ? "destructive"
                    : "warning"
                }
                className="text-[10px]"
              >
                {flow.lastRunStatus === "running" ? "Running..." : flow.lastRunStatus}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function FlowCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-4 w-16" />
      </CardContent>
    </Card>
  );
}

"use client";

import { memo, useMemo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { FlowNodeData } from "@/types/flow";
import {
  Zap,
  Play,
  GitFork,
  Brain,
  Webhook,
  Clock,
  FileJson,
  Mail,
  MessageSquare,
  Database,
  Globe,
  type LucideIcon,
} from "lucide-react";

const nodeTypeIcons: Record<string, LucideIcon> = {
  trigger: Zap,
  webhook: Webhook,
  schedule: Clock,
  action: Play,
  transform: FileJson,
  delay: Clock,
  condition: GitFork,
  ifelse: GitFork,
  switch: GitFork,
  filter: GitFork,
  ai: Brain,
  llm: Brain,
  embed: Database,
  classify: MessageSquare,
  extract: FileJson,
  http: Globe,
  notify: Mail,
  event: Zap,
};

const nodeTypeColors: Record<string, string> = {
  trigger: "border-cobalto/50",
  webhook: "border-cobalto/50",
  schedule: "border-cobalto/50",
  action: "border-zinc-500/50",
  transform: "border-zinc-500/50",
  delay: "border-zinc-500/50",
  condition: "border-ember/50",
  ifelse: "border-ember/50",
  switch: "border-ember/50",
  filter: "border-ember/50",
  ai: "border-biolume/50",
  llm: "border-biolume/50",
  embed: "border-biolume/50",
  classify: "border-biolume/50",
  extract: "border-biolume/50",
  http: "border-zinc-500/50",
  notify: "border-zinc-500/50",
  event: "border-zinc-500/50",
};

const nodeTypeAccents: Record<string, string> = {
  trigger: "bg-cobalto text-cobalto",
  webhook: "bg-cobalto text-cobalto",
  schedule: "bg-cobalto text-cobalto",
  condition: "bg-ember text-ember",
  ifelse: "bg-ember text-ember",
  switch: "bg-ember text-ember",
  ai: "bg-biolume text-biolume",
  llm: "bg-biolume text-biolume",
  embed: "bg-biolume text-biolume",
};

export const CustomNode = memo(({ data, selected, id }: NodeProps<Node<FlowNodeData>>) => {
  const Icon = nodeTypeIcons[data.type] || Play;
  const borderColor = nodeTypeColors[data.type] || "border-border";
  const accentBg = nodeTypeAccents[data.type] || "bg-muted-foreground text-muted-foreground";
  const isRunning = data.status === "running";
  const isError = data.status === "error";

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg border-2 bg-card shadow-sm transition-all duration-200 ease-flow min-w-[180px] hover:shadow-md hover:shadow-biolume/5",
        borderColor,
        selected && "node-selected",
        isRunning && "animate-node-active",
        isError && "border-destructive shadow-destructive/20",
        "hover:shadow-md"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-border !border-2 !border-background"
      />
      <div className="flex items-center gap-2">
        <div className={cn("p-1.5 rounded-md bg-opacity-10", accentBg.replace("text-", "") + "/10")}>
          <Icon className={cn("h-3.5 w-3.5", accentBg.split(" ")[1])} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold font-sora truncate">
            {data.label}
          </div>
          {data.description && (
            <div className="text-[10px] text-muted-foreground truncate">
              {data.description}
            </div>
          )}
        </div>
        {isRunning && (
          <div className="relative">
            <div className="h-2 w-2 rounded-full bg-biolume animate-pulse" />
            <div className="absolute inset-0 h-2 w-2 rounded-full bg-biolume/30 animate-ping" />
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-border !border-2 !border-background"
      />
    </div>
  );
});

CustomNode.displayName = "CustomNode";

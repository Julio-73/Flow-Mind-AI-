"use client";

import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { FLOW_NODE_CATEGORIES } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Play, GitFork, Brain, GripVertical } from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  triggers: <Zap className="h-4 w-4" />,
  actions: <Play className="h-4 w-4" />,
  conditions: <GitFork className="h-4 w-4" />,
  ai: <Brain className="h-4 w-4" />,
};

export function NodePalette() {
  const { screenToFlowPosition } = useReactFlow();

  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: string) => {
      event.dataTransfer.setData("application/reactflow", nodeType);
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  return (
    <div className="absolute left-4 top-20 z-10 w-56">
      <div className="rounded-lg border border-border/50 bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="px-3 py-2 border-b border-border/50">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Node Palette
          </h3>
        </div>
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="p-2 space-y-3">
            {FLOW_NODE_CATEGORIES.map((category) => (
              <div key={category.id}>
                <div className="flex items-center gap-1.5 px-1 py-1">
                  <span className="text-muted-foreground/60">{categoryIcons[category.id]}</span>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    {category.label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {category.items.map((item) => (
                    <div
                      key={item.type}
                      draggable
                      onDragStart={(e) => {
                        onDragStart(e, item.type);
                        e.dataTransfer.effectAllowed = "move";
                        const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
                        ghost.style.position = "absolute";
                        ghost.style.top = "-1000px";
                        ghost.style.opacity = "0.8";
                        ghost.style.transform = "scale(1.05)";
                        ghost.style.borderRadius = "8px";
                        ghost.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
                        ghost.style.border = "2px solid hsl(var(--biolume))";
                        document.body.appendChild(ghost);
                        e.dataTransfer.setDragImage(ghost, 0, 0);
                        setTimeout(() => document.body.removeChild(ghost), 0);
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-grab active:cursor-grabbing hover:bg-secondary/50 hover:border-biolume/30 transition-all duration-200 ease-flow group border border-transparent"
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium">{item.label}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import { useCanvasStore } from "@/stores/canvas-store";
import { Button } from "@/components/ui/button";
import {
  Save,
  Sparkles,
  Play,
  Clock,
  Share2,
  LayoutGrid,
  Bot,
  Undo2,
  Redo2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { AUTO_SAVE_DELAY } from "@/lib/constants";
import { toast } from "sonner";

export function CanvasToolbar() {
  const { isDirty, isSaving, setIsSaving, setLastSavedAt, setIsDirty, toggleCopilot, nodes } = useCanvasStore();
  const { fitView } = useReactFlow();
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setLastSavedAt(new Date());
      setIsDirty(false);
      toast.success("Flow saved", { duration: 2000 });
    }, 600);
  }, [setIsSaving, setLastSavedAt, setIsDirty]);

  const handleAutoLayout = useCallback(() => {
    fitView({ duration: 400, padding: 0.3 });
    toast.success("Auto-layout applied", { duration: 2000 });
  }, [fitView]);

  const handleRun = useCallback(() => {
    toast.success("Flow execution started", { duration: 2000 });
  }, []);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border/50 bg-card/95 backdrop-blur-sm shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={isDirty ? "text-biolume" : ""}
            >
              <Save className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save (Cmd+S)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => {}}>
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Cmd+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => {}}>
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Cmd+Shift+Z)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={handleAutoLayout}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Auto-layout</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-ember">
              <Sparkles className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Optimize with AI</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="biolume" size="sm" onClick={handleRun}>
              <Play className="h-3.5 w-3.5 mr-1" /> Run
            </Button>
          </TooltipTrigger>
          <TooltipContent>Run flow (Cmd+Enter)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon-sm">
              <Clock className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Schedule</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon-sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Share</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {}}
            >
              <Bot className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>AI Copilot</TooltipContent>
        </Tooltip>

      {isDirty && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
          Unsaved
        </div>
      )}
      </div>
    </TooltipProvider>
  );
}

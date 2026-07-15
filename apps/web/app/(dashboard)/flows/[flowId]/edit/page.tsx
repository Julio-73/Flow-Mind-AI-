"use client";

import { useParams } from "next/navigation";
import { FlowCanvas } from "@/components/features/canvas/flow-canvas";
import { useCanvasStore } from "@/stores/canvas-store";
import { useEffect, useCallback, useState } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { AUTO_SAVE_DELAY } from "@/lib/constants";
import { toast } from "sonner";
import { Waves, Undo2, Redo2, Save, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { KEYBOARD_SHORTCUTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function FlowEditorPage() {
  const params = useParams();
  const flowId = params["flowId"] as string;
  const [showShortcuts, setShowShortcuts] = useState(false);

  const {
    isDirty, setIsDirty, setLastSavedAt, setIsSaving,
    undo, redo,
  } = useCanvasStore();

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/flows/${flowId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: flowId }),
      });
      if (!res.ok) throw new Error("Save failed");
      setLastSavedAt(new Date());
      setIsDirty(false);
      toast.success("Flow saved", { duration: 2000 });
    } catch {
      toast.error("Failed to save flow");
    } finally {
      setIsSaving(false);
    }
  }, [flowId, setIsSaving, setLastSavedAt, setIsDirty]);

  const handleUndo = useCallback(() => {
    undo();
    toast("Undo", { duration: 1000 });
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
    toast("Redo", { duration: 1000 });
  }, [redo]);

  const keyboardHandlers = {
    save: handleSave,
    undo: handleUndo,
    redo: handleRedo,
  };

  useKeyboardShortcuts(keyboardHandlers, true);

  return (
    <div className="h-[calc(100vh-3.5rem)] -m-4 lg:-m-6 relative">
      {/* Flow name header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-sm border-b border-border/50">
        <Waves className="h-4 w-4 text-biolume" />
        <span className="text-sm font-medium">Flow Editor</span>
        <span className="text-xs text-muted-foreground">/ {flowId}</span>

        {/* Action buttons */}
        <div className="ml-auto flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleUndo}>
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRedo}>
                  <Redo2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Redo (Ctrl+Shift+Z)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave}>
                  <Save className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Save (Ctrl+S)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="w-px h-4 bg-border/50 mx-1" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowShortcuts(true)}>
                  <Keyboard className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Keyboard Shortcuts</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {isDirty && (
          <span className="text-[10px] text-amber-500">Unsaved changes</span>
        )}
      </div>

      {/* Canvas */}
      <div className="w-full h-full pt-9">
        <FlowCanvas />
      </div>

      {/* Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" /> Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Master your flow editing with these shortcuts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 py-2">
            {KEYBOARD_SHORTCUTS.map((s) => (
              <div
                key={s.keys}
                className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/30"
              >
                <span className="text-sm">{s.action}</span>
                <kbd className="px-2 py-0.5 rounded border bg-muted text-xs font-mono text-muted-foreground">
                  {s.keys}
                </kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useCanvasStore } from "@/stores/canvas-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Trash2, Copy } from "lucide-react";

export function NodeConfig() {
  const { selectedNode, updateNodeData, selectNode, removeNode, duplicateNode } = useCanvasStore();

  if (!selectedNode) return null;

  const { data, id } = selectedNode;

  return (
    <div className="absolute right-4 top-20 z-10 w-72">
      <div className="rounded-lg border border-border/50 bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Configure Node
          </h3>
          <button
            onClick={() => selectNode(null)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ScrollArea className="max-h-[calc(100vh-300px)]">
          <div className="p-3 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <Input
                value={data.label}
                onChange={(e) => updateNodeData(id, { label: e.target.value })}
                placeholder="Node name"
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <div className="text-sm text-foreground capitalize">{data.type}</div>
            </div>

            {data.description && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <p className="text-xs text-muted-foreground">{data.description}</p>
              </div>
            )}

            <Separator />

            {/* Config Fields (generic) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Connector</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select connector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="notion">Notion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => duplicateNode(id)}
              >
                <Copy className="h-3.5 w-3.5 mr-1" /> Duplicate
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => {
                  removeNode(id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

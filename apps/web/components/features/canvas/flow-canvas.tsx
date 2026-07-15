"use client";

import { memo, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  SelectionMode,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCanvasStore } from "@/stores/canvas-store";
import type { FlowNode } from "@/types/flow";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { CanvasToolbar } from "@/components/features/canvas/canvas-toolbar";
import { NodePalette } from "@/components/features/canvas/node-palette";
import { NodeConfig } from "@/components/features/canvas/node-config";
import { FlowPreview } from "@/components/features/flows/flow-preview";
import { CustomNode } from "@/components/features/canvas/custom-nodes/default-node";
import { cn } from "@/lib/utils";

const nodeTypes = {
  default: CustomNode,
  trigger: CustomNode,
  action: CustomNode,
  condition: CustomNode,
  ai: CustomNode,
  webhook: CustomNode,
  delay: CustomNode,
  transform: CustomNode,
};

const defaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  style: { stroke: "hsl(var(--border))", strokeWidth: 2 },
  activeStyle: { stroke: "hsl(var(--biolume))", strokeWidth: 3 },
};

function FlowCanvasInner() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
    selectedNode,
    removeNode,
    duplicateNode,
    isCopilotOpen,
    toggleCopilot,
    addNode,
  } = useCanvasStore();

  const { screenToFlowPosition } = useReactFlow();

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      selectNode(node);
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const selected = nodes.find((n) => n.selected);
        if (selected) removeNode(selected.id);
      }
    },
    [nodes, removeNode]
  );

  const keyboardHandlers = {
    duplicate: () => {
      const selected = nodes.find((n) => n.selected);
      if (selected) duplicateNode(selected.id);
    },
    delete: () => {
      const selected = nodes.find((n) => n.selected);
      if (selected) removeNode(selected.id);
    },
  };

  useKeyboardShortcuts(keyboardHandlers, true);

  return (
    <div className="w-full h-full relative" onKeyDown={handleKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        selectionMode={SelectionMode.Partial}
        fitView
        deleteKeyCode={["Delete", "Backspace"]}
        multiSelectionKeyCode="Shift"
        snapToGrid
        snapGrid={[20, 20]}
        minZoom={0.1}
        maxZoom={4}
        className="bg-[radial-gradient(hsl(var(--border)/0.12)_1px,transparent_1px)] [background-size:20px_20px]"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(var(--border)/0.25)"
        />
        <Controls
          showInteractive={false}
          className="rounded-lg border-border bg-card shadow-sm"
        />
        <MiniMap
          nodeColor={(node) => {
            const type = (node.data as { type?: string })?.type;
            switch (type) {
              case "trigger": return "hsl(217, 92%, 65%)";
              case "ai": return "hsl(162, 80%, 54%)";
              case "condition": return "hsl(25, 95%, 55%)";
              default: return "hsl(var(--muted-foreground))";
            }
          }}
          maskColor="hsl(var(--background)/0.8)"
          className="rounded-lg border-border"
          style={{ background: "hsl(var(--card))" }}
        />
        <Panel position="top-center">
          <CanvasToolbar />
        </Panel>
      </ReactFlow>

      <NodePalette />
      {selectedNode && <NodeConfig />}
      {isCopilotOpen && <FlowPreview />}
    </div>
  );
}

export function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}

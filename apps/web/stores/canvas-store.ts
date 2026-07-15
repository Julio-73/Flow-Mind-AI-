import { create } from "zustand";
import type {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
} from "@xyflow/react";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import type { FlowNode, FlowEdge } from "@/types/flow";
import { randomId } from "@/lib/utils";

interface HistoryEntry {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface CanvasState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNode: FlowNode | null;
  isDirty: boolean;
  lastSavedAt: Date | null;
  isSaving: boolean;
  isCopilotOpen: boolean;
  copilotMessages: { role: "user" | "assistant"; content: string }[];
  viewport: { x: number; y: number; zoom: number };
  history: HistoryEntry[];
  historyIndex: number;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: FlowNode[]) => void;
  setEdges: (edges: FlowEdge[]) => void;
  selectNode: (node: FlowNode | null) => void;
  addNode: (type: string, position: { x: number; y: number }, label?: string) => void;
  removeNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  updateNodeData: (id: string, data: Partial<FlowNode["data"]>) => void;
  setIsDirty: (dirty: boolean) => void;
  setLastSavedAt: (date: Date) => void;
  setIsSaving: (saving: boolean) => void;
  toggleCopilot: () => void;
  addCopilotMessage: (message: { role: "user" | "assistant"; content: string }) => void;
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  loadFlow: (nodes: FlowNode[], edges: FlowEdge[]) => void;
  resetCanvas: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY = 50;

const initialMessages = [
  {
    role: "assistant" as const,
    content: "Describe tu automatización... Ej: 'Cuando llegue un email con adjunto, extrae el texto y envíame un resumen al chat'",
  },
];

function pushHistory(state: CanvasState): Partial<CanvasState> {
  const entry = { nodes: structuredClone(state.nodes), edges: structuredClone(state.edges) };
  const history = state.history.slice(0, state.historyIndex + 1);
  history.push(entry);
  if (history.length > MAX_HISTORY) history.shift();
  return { history, historyIndex: history.length - 1 };
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  isDirty: false,
  lastSavedAt: null,
  isSaving: false,
  isCopilotOpen: false,
  copilotMessages: initialMessages,
  viewport: { x: 0, y: 0, zoom: 1 },
  history: [],
  historyIndex: -1,

  onNodesChange: (changes) => {
    const prev = get().nodes;
    set({ nodes: applyNodeChanges(changes, prev) as FlowNode[], isDirty: true });
    if (changes.some((c) => c.type === "add" || c.type === "remove" || c.type === "replace")) {
      set(pushHistory({ ...get(), nodes: applyNodeChanges(changes, prev) as FlowNode[] }));
    }
  },
  onEdgesChange: (changes) => {
    const prev = get().edges;
    set({ edges: applyEdgeChanges(changes, prev) as FlowEdge[], isDirty: true });
    if (changes.some((c) => c.type === "add" || c.type === "remove" || c.type === "replace")) {
      set(pushHistory({ ...get(), edges: applyEdgeChanges(changes, prev) as FlowEdge[] }));
    }
  },
  onConnect: (connection: Connection) => {
    const edge = {
      ...connection,
      id: `${connection.source}-${connection.target}-${randomId()}`,
      type: "smoothstep",
      animated: true,
      style: { stroke: "hsl(var(--biolume))", strokeWidth: 2 },
    } as FlowEdge;
    const newEdges = addEdge(edge, get().edges);
    set({ edges: newEdges, isDirty: true });
    set(pushHistory({ ...get(), edges: newEdges }));
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  selectNode: (node) => set({ selectedNode: node }),

  addNode: (type, position, label) => {
    const id = `node-${randomId()}`;
    const newNode: FlowNode = {
      id,
      type: "default",
      position,
      data: {
        label: label || type.charAt(0).toUpperCase() + type.slice(1),
        type: type as FlowNode["data"]["type"],
        status: "idle",
      },
    };
    const newNodes = [...get().nodes, newNode];
    set({ nodes: newNodes, isDirty: true });
    set(pushHistory({ ...get(), nodes: newNodes }));
  },

  removeNode: (id) => {
    const newNodes = get().nodes.filter((n) => n.id !== id);
    const newEdges = get().edges.filter((e) => e.source !== id && e.target !== id);
    set({
      nodes: newNodes,
      edges: newEdges,
      selectedNode: get().selectedNode?.id === id ? null : get().selectedNode,
      isDirty: true,
    });
    set(pushHistory({ ...get(), nodes: newNodes, edges: newEdges }));
  },

  duplicateNode: (id) => {
    const source = get().nodes.find((n) => n.id === id);
    if (!source) return;
    const newId = `node-${randomId()}`;
    const duplicated: FlowNode = {
      ...source,
      id: newId,
      position: { x: source.position.x + 50, y: source.position.y + 50 },
      selected: false,
      data: { ...source.data, label: `${source.data.label} (copy)` },
    };
    const newNodes = [...get().nodes, duplicated];
    set({ nodes: newNodes, isDirty: true });
    set(pushHistory({ ...get(), nodes: newNodes }));
  },

  updateNodeData: (id, data) => {
    const newNodes = get().nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, ...data } } : n
    );
    set({ nodes: newNodes, isDirty: true });
  },

  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setLastSavedAt: (date) => set({ lastSavedAt: date }),
  setIsSaving: (saving) => set({ isSaving: saving }),

  toggleCopilot: () =>
    set((state) => ({ isCopilotOpen: !state.isCopilotOpen })),

  addCopilotMessage: (message) =>
    set((state) => ({
      copilotMessages: [...state.copilotMessages, message],
    })),

  setViewport: (viewport) => set({ viewport }),

  loadFlow: (nodes, edges) =>
    set({
      nodes,
      edges,
      isDirty: false,
      selectedNode: null,
      copilotMessages: initialMessages,
      history: [{ nodes: structuredClone(nodes), edges: structuredClone(edges) }],
      historyIndex: 0,
    }),

  resetCanvas: () =>
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      isDirty: false,
      lastSavedAt: null,
      copilotMessages: initialMessages,
      history: [],
      historyIndex: -1,
    }),

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < 0) return;
    const newIndex = historyIndex - 1;
    if (newIndex < 0) return;
    const entry = history[newIndex];
    if (!entry) return;
    set({
      nodes: structuredClone(entry.nodes),
      edges: structuredClone(entry.edges),
      historyIndex: newIndex,
      isDirty: true,
      selectedNode: null,
    });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const entry = history[newIndex];
    if (!entry) return;
    set({
      nodes: structuredClone(entry.nodes),
      edges: structuredClone(entry.edges),
      historyIndex: newIndex,
      isDirty: true,
      selectedNode: null,
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));

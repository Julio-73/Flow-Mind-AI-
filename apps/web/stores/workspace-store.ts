import { create } from "zustand";
import type { WorkspaceRole } from "@/lib/constants";

interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: WorkspaceRole;
  joinedAt: string;
}

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string;
}

interface WorkspaceState {
  workspaceId: string;
  workspaceName: string;
  workspaceIcon: string;
  timezone: string;
  members: Member[];
  apiKeys: ApiKey[];
  healthStatus: "healthy" | "degraded" | "down";

  setWorkspaceId: (id: string) => void;
  setWorkspaceName: (name: string) => void;
  setWorkspaceIcon: (icon: string) => void;
  setTimezone: (tz: string) => void;
  setMembers: (members: Member[]) => void;
  addMember: (member: Member) => void;
  removeMember: (id: string) => void;
  updateMemberRole: (id: string, role: WorkspaceRole) => void;
  setApiKeys: (keys: ApiKey[]) => void;
  addApiKey: (key: ApiKey) => void;
  removeApiKey: (id: string) => void;
  setHealthStatus: (status: "healthy" | "degraded" | "down") => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaceId: "ws-default",
  workspaceName: "My Workspace",
  workspaceIcon: "🌊",
  timezone: "UTC",
  members: [],
  apiKeys: [],
  healthStatus: "healthy",

  setWorkspaceId: (id) => set({ workspaceId: id }),
  setWorkspaceName: (name) => set({ workspaceName: name }),
  setWorkspaceIcon: (icon) => set({ workspaceIcon: icon }),
  setTimezone: (tz) => set({ timezone: tz }),
  setMembers: (members) => set({ members }),
  addMember: (member) => set((s) => ({ members: [...s.members, member] })),
  removeMember: (id) =>
    set((s) => ({ members: s.members.filter((m) => m.id !== id) })),
  updateMemberRole: (id, role) =>
    set((s) => ({
      members: s.members.map((m) => (m.id === id ? { ...m, role } : m)),
    })),
  setApiKeys: (keys) => set({ apiKeys: keys }),
  addApiKey: (key) => set((s) => ({ apiKeys: [...s.apiKeys, key] })),
  removeApiKey: (id) =>
    set((s) => ({ apiKeys: s.apiKeys.filter((k) => k.id !== id) })),
  setHealthStatus: (status) => set({ healthStatus: status }),
}));

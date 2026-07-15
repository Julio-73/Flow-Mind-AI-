import { create } from "zustand";

type SidebarView = "default" | "node-config" | "copilot";

interface UIState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  mobileSidebarOpen: boolean;
  commandPaletteOpen: boolean;
  notificationsOpen: boolean;
  helpPanelOpen: boolean;
  activeSidebarView: SidebarView;
  lastSearchQueries: string[];

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setHelpPanelOpen: (open: boolean) => void;
  setActiveSidebarView: (view: SidebarView) => void;
  addSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  sidebarWidth: 240,
  mobileSidebarOpen: false,
  commandPaletteOpen: false,
  notificationsOpen: false,
  helpPanelOpen: false,
  activeSidebarView: "default",
  lastSearchQueries: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleMobileSidebar: () =>
    set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  setHelpPanelOpen: (open) => set({ helpPanelOpen: open }),
  setActiveSidebarView: (view) => set({ activeSidebarView: view }),

  addSearchQuery: (query) => {
    const queries = get().lastSearchQueries;
    const updated = [query, ...queries.filter((q) => q !== query)].slice(0, 5);
    set({ lastSearchQueries: updated });
  },
}));

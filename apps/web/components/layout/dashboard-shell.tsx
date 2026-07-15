"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useUIStore } from "@/stores/ui-store";
import { useMemo } from "react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  const mainStyle = useMemo(
    () => ({ marginLeft: sidebarOpen ? "240px" : "60px" }),
    [sidebarOpen]
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className="transition-[margin-left] duration-300 ease-flow max-lg:ml-0"
        style={mainStyle}
      >
        <Topbar />
        <main id="main-content" className="p-4 lg:p-6 pt-4 lg:pt-6" tabIndex={-1}>
          <div className="lg:hidden h-14" />
          {children}
        </main>
      </div>
    </div>
  );
}

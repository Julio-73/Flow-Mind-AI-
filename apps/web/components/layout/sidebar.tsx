"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, BOTTOM_NAV_ITEMS, APP_NAME } from "@/lib/constants";
import { useUIStore } from "@/stores/ui-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useThemeToggle } from "@/hooks/use-theme";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  GitBranch,
  LayoutTemplate,
  PlugZap,
  Variable,
  Activity,
  Bell,
  Settings,
  LifeBuoy,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  LogOut,
  User,
  Waves,
} from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, GitBranch, LayoutTemplate, PlugZap, Variable, Activity, Bell,
  Settings, LifeBuoy,
};

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, mobileSidebarOpen, toggleMobileSidebar } = useUIStore();
  const { workspaceName, workspaceIcon } = useWorkspaceStore();
  const { isDark, toggle } = useThemeToggle();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={toggleMobileSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full glass-sidebar flex flex-col transition-all duration-300 ease-flow",
          sidebarOpen ? "w-[240px]" : "w-[60px]",
          "hidden lg:flex"
        )}
      >
        <div className={cn(
          "flex items-center h-14 border-b border-border/40 shrink-0",
          sidebarOpen ? "px-4 justify-between" : "px-3 justify-center"
        )}>
          {sidebarOpen ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 group" aria-label="Go to dashboard">
                <div className="w-7 h-7 rounded-lg bg-biolume flex items-center justify-center shadow-lg shadow-biolume/20 group-hover:shadow-biolume/30 transition-shadow">
                  <Waves className="h-4 w-4 text-void" aria-hidden="true" />
                </div>
                <span className="font-sora font-bold text-sm tracking-tight">
                  {APP_NAME}
                </span>
              </Link>
              <button
                onClick={toggleSidebar}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <Link href="/dashboard">
              <div className="w-8 h-8 rounded-lg bg-biolume flex items-center justify-center shadow-lg shadow-biolume/20">
                <Waves className="h-4 w-4 text-void" />
              </div>
            </Link>
          )}
        </div>

        {sidebarOpen && (
          <div className="px-3 py-2 border-b border-border/40">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/40 transition-colors text-sm">
                  <span className="text-base">{workspaceIcon}</span>
                  <span className="flex-1 text-left truncate font-medium">
                    {workspaceName}
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem>
                  <Waves className="h-4 w-4 mr-2 text-biolume" /> My Workspace
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LayoutDashboard className="h-4 w-4 mr-2" /> Acme Corp
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Manage Workspaces
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto scrollbar-premium px-2 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <TooltipProvider key={item.href} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-flow group relative",
                        isActive(item.href)
                          ? "text-biolume bg-biolume/10"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-secondary/30"
                      )}
                    >
                      {Icon && (
                        <Icon className={cn(
                          "h-4 w-4 shrink-0 transition-transform",
                          isActive(item.href) ? "text-biolume" : ""
                        )} aria-hidden="true" />
                      )}
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {!sidebarOpen && (
                    <TooltipContent side="right" className="text-xs">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </nav>

        <div className="border-t border-border/40 px-2 py-2 space-y-1">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <TooltipProvider key={item.href} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-flow",
                        isActive(item.href)
                          ? "text-biolume bg-biolume/10"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-secondary/30"
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {!sidebarOpen && (
                    <TooltipContent side="right" className="text-xs">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggle}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-flow w-full",
                    "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-secondary/30"
                  )}
                >
                  {isDark ? (
                    <Sun className="h-4 w-4 shrink-0" />
                  ) : (
                    <Moon className="h-4 w-4 shrink-0" />
                  )}
                  {sidebarOpen && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
                </button>
              </TooltipTrigger>
              {!sidebarOpen && (
                <TooltipContent side="right" className="text-xs">
                  Toggle theme
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {sidebarOpen ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-flow w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-secondary/30">
                  <div className="h-6 w-6 rounded-full bg-biolume/20 flex items-center justify-center text-[10px] font-bold text-biolume ring-2 ring-biolume/20">
                    U
                  </div>
                  <span className="flex-1 text-left truncate">User</span>
                  <MoreHorizontal className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center justify-center w-full px-3 py-2">
                    <div className="h-6 w-6 rounded-full bg-biolume/20 flex items-center justify-center text-[10px] font-bold text-biolume ring-2 ring-biolume/20">
                      U
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  User Menu
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </button>
        )}
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 glass-sidebar flex flex-col transition-transform duration-300 ease-flow lg:hidden",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center h-14 px-4 border-b border-border/40 justify-between shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 group" aria-label="Go to dashboard">
            <div className="w-7 h-7 rounded-lg bg-biolume flex items-center justify-center shadow-lg shadow-biolume/20">
              <Waves className="h-4 w-4 text-void" aria-hidden="true" />
            </div>
            <span className="font-sora font-bold text-sm tracking-tight">{APP_NAME}</span>
          </Link>
          <button
            onClick={toggleMobileSidebar}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Close menu"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="px-3 py-2 border-b border-border/40">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm">
            <span className="text-base">{workspaceIcon}</span>
            <span className="flex-1 text-left truncate font-medium">{workspaceName}</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-premium px-2 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={toggleMobileSidebar}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "text-biolume bg-biolume/10"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-secondary/30"
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/40 px-2 py-2 space-y-1">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={toggleMobileSidebar}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "text-biolume bg-biolume/10"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-secondary/30"
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={toggle}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-secondary/30 transition-all duration-200"
          >
            {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 glass-sidebar flex items-center justify-between px-4 border-b border-border/50">
        <button onClick={toggleMobileSidebar} className="p-2 -ml-2" aria-label={mobileSidebarOpen ? "Close menu" : "Open menu"} aria-expanded={mobileSidebarOpen}>
          <div className="w-7 h-7 rounded-lg bg-biolume flex items-center justify-center shadow-lg shadow-biolume/20">
            <Waves className="h-3.5 w-3.5 text-void" aria-hidden="true" />
          </div>
        </button>
        <span className="font-sora font-bold text-sm tracking-tight">{APP_NAME}</span>
        <button onClick={toggle} className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors" aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
          {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </>
  );
}

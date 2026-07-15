"use client";

import { useUIStore } from "@/stores/ui-store";
import { useSearch } from "@/hooks/use-search";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, Bell, BellDot, Command, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";

const MOCK_NOTIFICATIONS = [
  { id: "n1", type: "success", text: "Email Processing completed successfully", link: "/flows/f1/runs", time: "2026-07-11T09:30:00Z", read: false },
  { id: "n2", type: "error", text: "Invoice Parser failed — API timeout", link: "/flows/f3/runs", time: "2026-07-11T09:28:00Z", read: false },
  { id: "n3", type: "info", text: "New connector available: Salesforce", link: "/connectors", time: "2026-07-11T09:00:00Z", read: true },
  { id: "n4", type: "warning", text: "Flow Slack Alerts has 3 failures today", link: "/flows/f2/runs", time: "2026-07-11T08:00:00Z", read: true },
];

export function Topbar() {
  const { commandPaletteOpen, setCommandPaletteOpen, notificationsOpen, setNotificationsOpen } = useUIStore();
  const { query, setQuery, results, addToRecent, isOpen, setIsOpen } = useSearch();

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <>
      <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
        {/* Left: Search Cmd+K trigger */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/50 bg-muted/30 text-muted-foreground text-sm hover:bg-muted/50 transition-colors w-full max-w-xs lg:max-w-sm"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Search anything...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                {unreadCount > 0 ? (
                  <BellDot className="h-4 w-4 text-ember" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-ember text-[10px] font-bold flex items-center justify-center text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-border">
                <span className="text-xs font-semibold text-muted-foreground">Notifications</span>
                <button className="text-xs text-biolume hover:underline">Mark all read</button>
              </div>
              {MOCK_NOTIFICATIONS.map((n) => (
                <DropdownMenuItem key={n.id} asChild className="py-3">
                  <Link href={n.link} className={!n.read ? "bg-biolume/5" : ""}>
                    <div className="flex gap-2">
                      <div className={cn(
                        "mt-0.5 h-2 w-2 rounded-full shrink-0",
                        n.type === "success" ? "bg-emerald-500" :
                        n.type === "error" ? "bg-destructive" :
                        n.type === "warning" ? "bg-amber-500" : "bg-cobalto"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{n.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatRelativeTime(n.time)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px]">U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">User</p>
                <p className="text-xs text-muted-foreground">user@flowmind.ai</p>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/settings/general">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Search Command Dialog */}
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput
          placeholder="Search flows, templates, variables..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {query && (
            <CommandGroup heading="Results">
              {results.map((r) => (
                <CommandItem
                  key={r.id}
                  onSelect={() => {
                    addToRecent(query);
                    setIsOpen(false);
                    window.location.href = r.href;
                  }}
                >
                  <span>{r.title}</span>
                  <span className="ml-1 text-muted-foreground text-xs">
                    {r.description}
                  </span>
                  <Badge variant="outline" className="ml-auto text-[10px]">
                    {r.category}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}



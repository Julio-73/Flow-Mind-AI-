"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import { Bell, BellDot, CheckCheck, ChevronRight } from "lucide-react";
import { useState } from "react";

const MOCK_NOTIFICATIONS = [
  { id: "n1", type: "success", text: "Email Processing completed successfully", link: "/flows/f1/runs", time: "2026-07-11T09:30:00Z", read: false },
  { id: "n2", type: "error", text: "Invoice Parser failed — API timeout", link: "/flows/f3/runs", time: "2026-07-11T09:28:00Z", read: false },
  { id: "n3", type: "info", text: "New connector available: Salesforce", link: "/connectors", time: "2026-07-11T09:00:00Z", read: true },
  { id: "n4", type: "warning", text: "Slack Alerts: 3 failures today", link: "/flows/f2/runs", time: "2026-07-11T08:00:00Z", read: true },
  { id: "n5", type: "success", text: "Customer Onboarding flow activated", link: "/flows/f4/edit", time: "2026-07-10T16:00:00Z", read: true },
];

export function NotificationList() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {unreadCount} unread notifications
          </span>
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark all read
          </Button>
        </div>
      )}

      <div className="space-y-1">
        {notifications.map((n) => (
          <Link
            key={n.id}
            href={n.link}
            onClick={() => markRead(n.id)}
            className={`flex items-start gap-3 px-3 py-3 rounded-lg transition-colors group ${
              !n.read ? "bg-biolume/5 border border-biolume/10" : "hover:bg-muted/30"
            }`}
          >
            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
              n.type === "success" ? "bg-emerald-500" :
              n.type === "error" ? "bg-destructive" :
              n.type === "warning" ? "bg-amber-500" : "bg-cobalto"
            }`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!n.read ? "font-medium" : ""}`}>{n.text}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatRelativeTime(n.time)}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}

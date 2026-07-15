"use client";

import { PageHeader } from "@/components/shared/page-header";
import { NotificationList } from "@/components/features/notifications";
import { Bell } from "lucide-react";

export default function ActivityPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Activity"
        description="Your recent notifications and updates"
      />
      <NotificationList />
    </div>
  );
}

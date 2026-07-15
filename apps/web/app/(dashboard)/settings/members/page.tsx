"use client";

import { PageHeader } from "@/components/shared/page-header";
import { SettingsSection } from "@/components/shared/settings-section";
import { MemberList, MemberInvite } from "@/components/features/workspace";
import { Users } from "lucide-react";

export default function MembersPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Members"
        description="Manage who has access to this workspace"
      />

      <SettingsSection
        title="Invite Members"
        description="Invite people to collaborate on flows"
      >
        <MemberInvite />
      </SettingsSection>

      <SettingsSection title="Team Members">
        <MemberList />
      </SettingsSection>
    </div>
  );
}

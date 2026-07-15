"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import {
  Check,
  X,
  UserPlus,
  MoreHorizontal,
  Mail,
  Shield,
} from "lucide-react";
import { WORKSPACE_ROLES } from "@/lib/constants";
import type { WorkspaceRole } from "@/lib/constants";
import { useState } from "react";

interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: WorkspaceRole;
  joinedAt: string;
}

const MOCK_MEMBERS: Member[] = [
  { id: "m1", name: "You", email: "user@flowmind.ai", role: "owner", joinedAt: "2026-06-01" },
  { id: "m2", name: "Alice Chen", email: "alice@acmecorp.com", role: "admin", joinedAt: "2026-06-15" },
  { id: "m3", name: "Bob Martinez", email: "bob@acmecorp.com", role: "member", joinedAt: "2026-07-01" },
  { id: "m4", name: "Carol Smith", email: "carol@acmecorp.com", role: "viewer", joinedAt: "2026-07-05" },
];

export function MemberList() {
  const [members, setMembers] = useState(MOCK_MEMBERS);

  const updateRole = (id: string, role: WorkspaceRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role } : m))
    );
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-1">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-colors"
        >
          <Avatar className="h-8 w-8">
            {member.avatarUrl && <AvatarImage src={member.avatarUrl} />}
            <AvatarFallback className="text-[10px]">
              {member.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">
              {member.name}
              {member.role === "owner" && (
                <span className="text-xs text-muted-foreground ml-1">(you)</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{member.email}</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                member.role === "owner" ? "default" :
                member.role === "admin" ? "info" :
                member.role === "member" ? "secondary" : "outline"
              }
              className="text-[10px] capitalize"
            >
              {member.role}
            </Badge>
            {member.role !== "owner" && (
              <Select
                value={member.role}
                onValueChange={(v) => updateRole(member.id, v as WorkspaceRole)}
              >
                <SelectTrigger className="h-7 w-7 p-0 border-0">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </SelectTrigger>
                <SelectContent align="end">
                  {WORKSPACE_ROLES.filter((r) => r !== "owner").map((role) => (
                    <SelectItem key={role} value={role} className="capitalize">
                      {role}
                    </SelectItem>
                  ))}
                  <SelectItem value="remove" className="text-destructive">
                    Remove
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MemberInvite() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <input
          type="email"
          placeholder="colleague@company.com"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
        />
      </div>
      <Select>
        <SelectTrigger className="w-28">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          {WORKSPACE_ROLES.filter((r) => r !== "owner").map((role) => (
            <SelectItem key={role} value={role} className="capitalize">
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="biolume" size="sm">
        <UserPlus className="h-4 w-4 mr-1" /> Invite
      </Button>
    </div>
  );
}

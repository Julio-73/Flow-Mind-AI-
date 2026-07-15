"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsSection } from "@/components/shared/settings-section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

const TIMEZONES = ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Madrid", "Asia/Tokyo", "Asia/Shanghai"];

export default function GeneralSettingsPage() {
  const [name, setName] = useState("My Workspace");
  const [icon, setIcon] = useState("FM");
  const [tz, setTz] = useState("UTC");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/workspace")
      .then((res) => res.json())
      .then((data) => {
        if (data.workspaceName) setName(data.workspaceName);
        if (data.workspaceIcon) setIcon(data.workspaceIcon);
        if (data.timezone) setTz(data.timezone);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceName: name, workspaceIcon: icon, timezone: tz }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader title="General Settings" description="Manage your workspace preferences" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title="General Settings" description="Manage your workspace preferences" />

      <SettingsSection
        title="Workspace Name"
        description="This is the name of your workspace"
        action={
          <Button variant="biolume" size="sm" onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
        }
      >
        <div className="flex items-center gap-3">
          <label htmlFor="workspace-icon" className="sr-only">Workspace icon</label>
          <input
            id="workspace-icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-10 h-10 min-w-[40px] rounded-lg border border-input bg-background text-center text-lg"
            maxLength={2}
          />
          <Input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 min-w-0" label="Workspace name" />
        </div>
      </SettingsSection>

      <SettingsSection title="Timezone" description="Used for scheduling and timestamps">
        <Select value={tz} onValueChange={setTz}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((z) => (
              <SelectItem key={z} value={z}>{z}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsSection>
    </div>
  );
}

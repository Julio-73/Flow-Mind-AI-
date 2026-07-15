"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsSection } from "@/components/shared/settings-section";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Key, Plus, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string;
}

const MOCK_KEYS: ApiKey[] = [
  { id: "k1", name: "Production API", prefix: "fm_prod_", scopes: ["flows:read", "flows:write", "executions:read"], createdAt: "2026-07-01", lastUsedAt: "2026-07-11T09:30:00Z" },
  { id: "k2", name: "Development", prefix: "fm_dev_", scopes: ["flows:read", "executions:read"], createdAt: "2026-07-05" },
];

export default function ApiKeysPage() {
  const [showNew, setShowNew] = useState(false);
  const [keys, setKeys] = useState(MOCK_KEYS);

  const deleteKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    toast.success("API key revoked");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="API Keys"
        description="Manage API keys for programmatic access"
        actions={
          <Button variant="biolume" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4 mr-1" /> Create Key
          </Button>
        }
      />

      <SettingsSection title="Active Keys">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Key Prefix</TableHead>
                <TableHead className="hidden md:table-cell">Scopes</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="hidden lg:table-cell">Last Used</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No API keys yet
                  </TableCell>
                </TableRow>
              ) : (
                keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium truncate max-w-[120px] sm:max-w-none">{key.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {key.prefix}...
                      </code>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.map((s) => (
                          <Badge key={s} variant="outline" className="text-[10px]">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{key.createdAt}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" className="min-w-[36px] min-h-[36px]">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive min-w-[36px] min-h-[36px]"
                          onClick={() => deleteKey(key.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </SettingsSection>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key for external integrations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input label="Key Name" placeholder="e.g. Production" />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Scopes</label>
              <div className="space-y-1">
                {["flows:read", "flows:write", "executions:read", "executions:write", "variables:read", "variables:write"].map((scope) => (
                  <label key={scope} className="flex items-center gap-2 text-xs">
                    <input type="checkbox" className="rounded border-border" />
                    {scope}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
            <Button variant="biolume">Generate Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

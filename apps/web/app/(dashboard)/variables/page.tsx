"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchCommand } from "@/components/shared/search-command";
import { VariableTable } from "@/components/features/variables";
import { Button } from "@/components/ui/button";
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
import { Variable, Plus, KeyRound } from "lucide-react";

export default function VariablesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Variables"
        description="Manage environment variables and secrets for your flows"
        actions={
          <Button variant="biolume" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Variable
          </Button>
        }
      />

      <SearchCommand
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={() => setSearchQuery("")}
      />

      <VariableTable />

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Variable</DialogTitle>
            <DialogDescription>
              Add a new environment variable or secret
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input label="Name" placeholder="MY_VARIABLE" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="secret">Secret</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
            <Input label="Value" placeholder="Variable value" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
            <Button variant="biolume">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

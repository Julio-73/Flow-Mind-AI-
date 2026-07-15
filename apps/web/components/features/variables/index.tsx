"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
type Column = { label: string; key: string; sortable?: boolean; hideable?: boolean };
import {
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  MoreHorizontal,
  Key,
  FileText,
  Globe,
} from "lucide-react";

interface Variable {
  id: string;
  name: string;
  type: "string" | "secret" | "number" | "json";
  value: string;
  updatedAt: string;
  usedIn: number;
}

const MOCK_VARIABLES: Variable[] = [
  { id: "v1", name: "OPENAI_API_KEY", type: "secret", value: "sk-...aB3c", updatedAt: "2026-07-10T12:00:00Z", usedIn: 3 },
  { id: "v2", name: "SLACK_WEBHOOK_URL", type: "secret", value: "https://hooks...", updatedAt: "2026-07-09T08:00:00Z", usedIn: 2 },
  { id: "v3", name: "DATABASE_URL", type: "secret", value: "postgresql://...", updatedAt: "2026-07-08T16:00:00Z", usedIn: 5 },
  { id: "v4", name: "MAX_RETRIES", type: "number", value: "3", updatedAt: "2026-07-07T00:00:00Z", usedIn: 1 },
  { id: "v5", name: "NOTIFICATION_EMAIL", type: "string", value: "alerts@flowmind.ai", updatedAt: "2026-07-06T00:00:00Z", usedIn: 4 },
];

const typeIcon: Record<string, React.ReactNode> = {
  secret: <Key className="h-3.5 w-3.5" />,
  string: <FileText className="h-3.5 w-3.5" />,
  number: <Globe className="h-3.5 w-3.5" />,
  json: <FileText className="h-3.5 w-3.5" />,
};

export function VariableTable() {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="hidden md:table-cell">Used In</TableHead>
            <TableHead className="hidden md:table-cell">Updated</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_VARIABLES.map((v) => (
            <TableRow key={v.id}>
              <TableCell className="font-mono text-xs font-medium max-w-[120px] sm:max-w-none truncate">{v.name}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="outline" className="text-[10px] flex items-center gap-1 w-fit">
                  {typeIcon[v.type]}
                  {v.type}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs text-muted-foreground truncate block max-w-[100px] sm:max-w-none">
                  {v.type === "secret" ? "••••••••" : v.value}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="text-xs text-muted-foreground">{v.usedIn} flows</span>
              </TableCell>
              <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{v.updatedAt.slice(0, 10)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" className="min-w-[36px] min-h-[36px]">
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="text-destructive min-w-[36px] min-h-[36px]">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

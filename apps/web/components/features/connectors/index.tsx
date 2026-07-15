"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Connector } from "@/types/connector";
import {
  PlugZap,
  Check,
  Plus,
  ChevronRight,
  Globe,
  Lock,
  Key,
  Database,
  MessageSquare,
  Mail,
  Cloud,
  ShoppingCart,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

const connectorIcons: Record<string, LucideIcon> = {
  openai: MessageSquare,
  slack: MessageSquare,
  gmail: Mail,
  notion: Cloud,
  stripe: ShoppingCart,
  supabase: Database,
  github: Globe,
  posthog: BarChart3,
};

const MOCK_CONNECTORS: Connector[] = [
  { id: "c1", name: "OpenAI", slug: "openai", description: "GPT-4, embeddings, and more", icon: "MessageSquare", category: "ai", authType: "apiKey", status: "installed", version: "2.1.0", isCore: false, triggers: [], actions: [], updatedAt: "2026-07-10T00:00:00Z" },
  { id: "c2", name: "Slack", slug: "slack", description: "Send messages and watch channels", icon: "MessageSquare", category: "communication", authType: "oauth", status: "installed", version: "3.0.0", isCore: true, triggers: [], actions: [], updatedAt: "2026-07-09T00:00:00Z" },
  { id: "c3", name: "Gmail", slug: "gmail", description: "Read and send emails", icon: "Mail", category: "communication", authType: "oauth", status: "installed", version: "1.5.0", isCore: true, triggers: [], actions: [], updatedAt: "2026-07-08T00:00:00Z" },
  { id: "c4", name: "Notion", slug: "notion", description: "Manage pages and databases", icon: "Cloud", category: "storage", authType: "oauth", status: "available", version: "2.0.0", isCore: false, triggers: [], actions: [], updatedAt: "2026-07-07T00:00:00Z" },
  { id: "c5", name: "Stripe", slug: "stripe", description: "Payment processing and webhooks", icon: "ShoppingCart", category: "payment", authType: "apiKey", status: "available", version: "4.0.0", isCore: false, triggers: [], actions: [], updatedAt: "2026-07-06T00:00:00Z" },
];

interface ConnectorCardProps {
  connector: Connector;
  loading?: boolean;
}

export function ConnectorCard({ connector, loading }: ConnectorCardProps) {
  const Icon = connectorIcons[connector.slug] || PlugZap;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="interactive">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="h-4 w-4 text-foreground" />
          </div>
          <Badge
            variant={connector.status === "installed" ? "success" : "outline"}
            className="text-[10px]"
          >
            {connector.status === "installed" ? (
              <><Check className="h-3 w-3 mr-0.5" /> Installed</>
            ) : (
              "Available"
            )}
          </Badge>
        </div>
        <h3 className="text-sm font-semibold font-sora mb-0.5">{connector.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">{connector.description}</p>
        <div className="flex items-center gap-2">
          {connector.isCore && (
            <Badge variant="info" className="text-[10px]">Core</Badge>
          )}
          <Badge variant="outline" className="text-[10px] capitalize">
            {connector.authType === "oauth" ? <Lock className="h-3 w-3 mr-0.5" /> :
             connector.authType === "apiKey" ? <Key className="h-3 w-3 mr-0.5" /> : null}
            {connector.authType}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConnectorGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {MOCK_CONNECTORS.map((c) => (
        <ConnectorCard key={c.id} connector={c} />
      ))}
    </div>
  );
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  LayoutTemplate,
  Sparkles,
  ArrowRight,
  Star,
  Clock,
  BarChart3,
  Mail,
  MessageSquare,
  Globe,
  Database,
  Users,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  icon: string;
  uses: number;
  author: string;
}

const MOCK_TEMPLATES: Template[] = [
  { id: "t1", name: "Email to Slack Summary", description: "Summarize incoming emails and post to Slack", category: "Customer Support", level: "beginner", icon: "Mail", uses: 1234, author: "FlowMind" },
  { id: "t2", name: "Invoice Data Extraction", description: "Extract structured data from invoice PDFs", category: "Data Processing", level: "intermediate", icon: "Database", uses: 892, author: "FlowMind" },
  { id: "t3", name: "Social Media Monitor", description: "Track brand mentions across platforms", category: "Marketing", level: "intermediate", icon: "Globe", uses: 567, author: "Community" },
  { id: "t4", name: "Customer Onboarding Flow", description: "Automate new user onboarding sequence", category: "Sales", level: "advanced", icon: "Users", uses: 2345, author: "FlowMind" },
  { id: "t5", name: "Slack Standup Reports", description: "Daily standup collection and digest", category: "DevOps", level: "beginner", icon: "MessageSquare", uses: 789, author: "Community" },
];

const templateIcons: Record<string, LucideIcon> = {
  Mail, Database, Globe, Users, MessageSquare, ShoppingCart, BarChart3,
};

interface TemplateCardProps {
  template: Template;
  loading?: boolean;
}

export function TemplateCard({ template, loading }: TemplateCardProps) {
  const Icon = templateIcons[template.icon] || LayoutTemplate;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-6 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="interactive">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-8 h-8 rounded-lg bg-biolume/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-biolume" />
          </div>
          <Badge variant="outline" className="text-[10px] capitalize">
            {template.level}
          </Badge>
        </div>
        <h3 className="text-sm font-semibold font-sora mb-0.5">{template.name}</h3>
        <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" /> {template.uses.toLocaleString()}
          </span>
          <span>{template.author}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-6 text-xs">
            Use <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function TemplateGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {MOCK_TEMPLATES.map((t) => (
        <TemplateCard key={t.id} template={t} />
      ))}
    </div>
  );
}

export { MOCK_TEMPLATES };

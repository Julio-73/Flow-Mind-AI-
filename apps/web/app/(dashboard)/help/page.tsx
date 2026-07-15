"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchCommand } from "@/components/shared/search-command";
import { KEYBOARD_SHORTCUTS } from "@/lib/constants";
import {
  Keyboard,
  Play,
  Search,
  LifeBuoy,
  BookOpen,
  MessageCircle,
  Video,
  ExternalLink,
  Command,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const HELP_ARTICLES = [
  { icon: BookOpen, title: "Getting Started", description: "Learn the basics of FlowMind", href: "#" },
  { icon: Play, title: "Creating Your First Flow", description: "Step-by-step guide", href: "#" },
  { icon: Search, title: "Using Connectors", description: "Connect your tools", href: "#" },
  { icon: Keyboard, title: "Keyboard Shortcuts", description: "Speed up your workflow", href: "#" },
  { icon: MessageCircle, title: "AI Copilot", description: "Build flows with AI assistance", href: "#" },
  { icon: Video, title: "FlowMind in 2 Minutes", description: "Quick video overview", href: "#" },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = HELP_ARTICLES.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Help Center"
        description="Documentation, guides, and support"
      />

      <SearchCommand
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={() => setSearchQuery("")}
      />

      {/* Quick video */}
      <Card variant="accent" className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-biolume/10 flex items-center justify-center">
            <Video className="h-6 w-6 text-biolume" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold">FlowMind in 2 Minutes</h3>
            <p className="text-xs text-muted-foreground">
              Watch a quick overview of the platform
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-biolume" />
        </CardContent>
      </Card>

      {/* Articles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((article) => {
          const Icon = article.icon;
          return (
            <Link key={article.title} href={article.href}>
              <Card variant="interactive">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{article.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {article.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Command className="h-4 w-4" /> Keyboard Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {KEYBOARD_SHORTCUTS.map((s) => (
              <div
                key={s.keys}
                className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/30"
              >
                <span className="text-sm">{s.action}</span>
                <kbd className="px-2 py-0.5 rounded border bg-muted text-xs font-mono text-muted-foreground">
                  {s.keys}
                </kbd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardContent className="p-5 text-center">
          <LifeBuoy className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-sm font-semibold mb-1">Need more help?</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Contact our support team
          </p>
          <Link
            href="#"
            className="text-xs text-biolume hover:underline inline-flex items-center gap-1"
          >
            support@flowmind.ai <ExternalLink className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

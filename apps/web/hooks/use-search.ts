"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: "flow" | "template" | "variable" | "execution" | "setting";
  href: string;
  icon?: string;
}

const SEARCH_DATA: SearchResult[] = [
  { id: "s1", title: "Email Processing", description: "Process incoming emails", category: "flow", href: "/flows/f1/edit", icon: "Mail" },
  { id: "s2", title: "Slack Alerts", description: "Send alerts to Slack", category: "flow", href: "/flows/f2/edit", icon: "Bell" },
  { id: "s3", title: "Invoice Parser", description: "Extract invoice data", category: "flow", href: "/flows/f3/edit", icon: "FileText" },
  { id: "s4", title: "Email to Slack Summary", description: "Summarize emails to Slack", category: "template", href: "/templates?t=email-slack", icon: "LayoutTemplate" },
  { id: "s5", title: "Data Sync Template", description: "Sync data between apps", category: "template", href: "/templates?t=data-sync", icon: "LayoutTemplate" },
  { id: "s6", title: "API_KEY", description: "OpenAI API Key", category: "variable", href: "/variables", icon: "Variable" },
  { id: "s7", title: "DATABASE_URL", description: "PostgreSQL connection", category: "variable", href: "/variables", icon: "Variable" },
  { id: "s8", title: "General Settings", description: "Workspace preferences", category: "setting", href: "/settings/general", icon: "Settings" },
];

export function useSearch() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    return SEARCH_DATA.filter(
      (r) =>
        r.title.toLowerCase().includes(lower) ||
        r.description?.toLowerCase().includes(lower)
    );
  }, [query]);

  const addToRecent = useCallback((q: string) => {
    setRecent((prev) => [q, ...prev.filter((x) => x !== q)].slice(0, 5));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((p) => !p);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return { query, setQuery, results, recent, addToRecent, isOpen, setIsOpen };
}

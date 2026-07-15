"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchCommand } from "@/components/shared/search-command";
import { TemplateCard, TemplateGrid, MOCK_TEMPLATES } from "@/components/features/templates";
import { EmptyState } from "@/components/shared/states";
import { TEMPLATE_CATEGORIES } from "@/lib/constants";
import { LayoutTemplate, Sparkles } from "lucide-react";

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = MOCK_TEMPLATES.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "All" || t.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Templates"
        description="Start faster with pre-built automation templates"
      />

      <SearchCommand
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={() => setSearchQuery("")}
        filters={[
          {
            label: "Category",
            value: category,
            options: TEMPLATE_CATEGORIES.map((c) => ({ label: c, value: c })),
            onValueChange: setCategory,
          },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<LayoutTemplate className="h-12 w-12" />}
          title="No templates found"
          description={searchQuery ? "Try a different search" : "No templates available"}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  );
}

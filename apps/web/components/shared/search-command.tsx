"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, SlidersHorizontal } from "lucide-react";

interface SearchCommandProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  filters?: { label: string; value: string; options: { label: string; value: string }[]; onValueChange: (v: string) => void }[];
  onCreateLabel?: string;
  onCreateClick?: () => void;
  className?: string;
}

export function SearchCommand({
  searchQuery,
  onSearchChange,
  onClear,
  filters,
  onCreateLabel,
  onCreateClick,
  className,
}: SearchCommandProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3", className)}>
      <div className="flex-1 w-full sm:max-w-xs lg:max-w-sm">
        <SearchInput
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={onClear}
          placeholder="Search..."
        />
      </div>
      {filters && filters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {filters.map((filter) => (
            <Select
              key={filter.value}
              value={filter.value}
              onValueChange={filter.onValueChange}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}
      {onCreateLabel && (
        <Button onClick={onCreateClick} variant="biolume" size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-1" /> {onCreateLabel}
        </Button>
      )}
    </div>
  );
}

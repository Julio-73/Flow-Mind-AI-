"use client";

import { Button } from "@/components/ui/button";
import { Waves, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center">
        <Waves className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground max-w-sm text-center">
        {error.message || "An unexpected error occurred"}
      </p>
      <Button variant="biolume" onClick={reset}>
        <RefreshCw className="h-4 w-4 mr-1" /> Try again
      </Button>
    </div>
  );
}

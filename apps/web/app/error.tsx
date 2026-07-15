"use client";

import { Button } from "@/components/ui/button";
import { Waves, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-4 p-4">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center">
        <Waves className="h-7 w-7 text-destructive" />
      </div>
      <h1 className="text-lg font-semibold text-white">Something went wrong</h1>
      <p className="text-sm text-white/50 max-w-sm text-center">
        {error.message || "An unexpected error occurred"}
      </p>
      <Button variant="biolume" onClick={reset}>
        <RefreshCw className="h-4 w-4 mr-1" /> Try again
      </Button>
    </div>
  );
}

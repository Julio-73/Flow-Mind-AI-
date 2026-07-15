import { Waves } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-biolume/10 border border-biolume/30 flex items-center justify-center">
          <Waves className="h-5 w-5 text-biolume animate-pulse-glow" />
        </div>
        <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-biolume/50 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

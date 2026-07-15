import Link from "next/link";
import { Waves, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-4 p-4">
      <div className="w-14 h-14 rounded-2xl bg-biolume/10 border border-biolume/30 flex items-center justify-center">
        <Waves className="h-7 w-7 text-biolume" />
      </div>
      <h1 className="text-lg font-semibold text-white">Page not found</h1>
      <p className="text-sm text-white/50 max-w-sm text-center">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-biolume text-void text-sm font-medium hover:bg-biolume/90 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Go to Dashboard
      </Link>
    </div>
  );
}

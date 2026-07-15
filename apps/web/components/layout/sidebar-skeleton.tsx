export function SidebarSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="w-60 border-r border-border p-3 space-y-2 animate-pulse">
        <div className="h-8 rounded-lg bg-muted/50" />
        <div className="h-8 rounded-lg bg-muted/50" />
        <div className="h-8 rounded-lg bg-muted/50" />
        <div className="h-8 rounded-lg bg-muted/50 mt-4" />
        <div className="h-8 rounded-lg bg-muted/50" />
        <div className="h-8 rounded-lg bg-muted/50" />
      </div>
      <div className="flex-1 p-6 space-y-4 animate-pulse">
        <div className="h-6 w-48 rounded bg-muted/50" />
        <div className="h-4 w-72 rounded bg-muted/30" />
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="h-32 rounded-xl bg-muted/40" />
          <div className="h-32 rounded-xl bg-muted/40" />
          <div className="h-32 rounded-xl bg-muted/40" />
        </div>
      </div>
    </div>
  );
}

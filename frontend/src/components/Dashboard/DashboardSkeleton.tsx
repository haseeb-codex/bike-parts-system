export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 rounded-xl border bg-card/60" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="h-80 rounded-xl border bg-card/60 xl:col-span-2" />
        <div className="h-80 rounded-xl border bg-card/60" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-80 rounded-xl border bg-card/60" />
        <div className="h-80 rounded-xl border bg-card/60" />
      </div>
    </div>
  );
}

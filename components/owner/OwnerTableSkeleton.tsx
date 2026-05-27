export function OwnerTableSkeleton() {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-soft">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex gap-4 border-b border-black/5 py-4 last:border-0">
          <div className="h-20 w-24 animate-pulse rounded-2xl bg-oat" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-oat" />
            <div className="h-4 w-1/3 animate-pulse rounded-full bg-oat" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
      <div className="h-56 animate-pulse bg-oat" />
      <div className="space-y-4 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded-full bg-oat" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-oat" />
        <div className="flex gap-2">
          <div className="h-8 w-20 animate-pulse rounded-full bg-oat" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-oat" />
        </div>
      </div>
    </div>
  );
}

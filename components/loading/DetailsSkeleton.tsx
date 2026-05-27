export function DetailsSkeleton() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="h-[420px] animate-pulse rounded-3xl bg-oat" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded-full bg-oat" />
          <div className="h-4 w-full animate-pulse rounded-full bg-oat" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-oat" />
        </div>
        <div className="h-72 animate-pulse rounded-3xl bg-oat" />
      </div>
    </main>
  );
}

import { PropertyCardSkeleton } from "@/components/loading/PropertyCardSkeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10 lg:px-8">
      <div className="mb-6 h-12 w-64 animate-pulse rounded-full bg-oat" />
      <div className="h-32 animate-pulse rounded-3xl bg-white shadow-soft" />
      <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <PropertyCardSkeleton key={index} />
        ))}
      </section>
    </main>
  );
}

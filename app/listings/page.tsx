"use client";

import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { FilterBar } from "@/components/FilterBar";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyCardSkeleton } from "@/components/loading/PropertyCardSkeleton";
import { useProperties } from "@/hooks/useProperties";
import { useWishlist } from "@/hooks/useWishlist";
import { filtersSchema } from "@/lib/validation";
import type { PropertyFilters } from "@/types/property";

export default function ListingsPage() {
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [filterError, setFilterError] = useState<string | null>(null);
  const { properties, isLoading, error } = useProperties(filters);
  const wishlist = useWishlist();

  function handleFilterChange(nextFilters: PropertyFilters) {
    const parsed = filtersSchema.safeParse(nextFilters);
    if (!parsed.success) {
      setFilterError(parsed.error.issues[0]?.message ?? "Invalid filter value.");
      return;
    }

    setFilterError(null);
    setFilters(parsed.data);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase text-clay">Student housing</p>
        <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Find your next room</h1>
      </div>
      <FilterBar filters={filters} onChange={handleFilterChange} />
      {filterError ? <p className="mt-5 rounded-2xl bg-white p-4 text-sm font-semibold text-clay shadow-soft">{filterError}</p> : null}
      {error ? <p className="mt-5 rounded-2xl bg-white p-4 text-sm font-semibold text-clay shadow-soft">{error}</p> : null}
      <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => <PropertyCardSkeleton key={index} />)
          : properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                saved={wishlist.isSaved(property.id)}
                onSave={wishlist.toggle}
              />
            ))}
      </section>
      {!isLoading && properties.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No homes match those filters" message="Try widening your budget, room type, or location search." />
        </div>
      ) : null}
    </main>
  );
}

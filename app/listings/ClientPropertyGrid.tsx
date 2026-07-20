"use client";

import { EmptyState } from "@/components/EmptyState";
import { PropertyCard } from "@/components/PropertyCard";
import { useWishlist } from "@/hooks/useWishlist";
import type { Property } from "@/types/property";

export function ClientPropertyGrid({ properties }: { properties: Property[] }) {
  const wishlist = useWishlist();

  if (properties.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState title="No homes match those filters" message="Try widening your budget, room type, or location search." />
      </div>
    );
  }

  return (
    <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full pb-24 relative z-10">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          saved={wishlist.isSaved(property.id)}
          onSave={wishlist.toggle}
        />
      ))}
    </section>
  );
}
"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { useProperties } from "@/hooks/useProperties";
import { FeaturedPropertyCard } from "@/components/FeaturedPropertyCard";

export default function PropertyPreview() {
  const wishlist = useWishlist();
  const { properties, isLoading } = useProperties();

  // Show a pulsing skeleton while fetching data
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl overflow-hidden shadow-soft animate-pulse">
        <div className="w-full aspect-[16/10] sm:aspect-[4/3] md:aspect-[5/4] bg-gray-200"></div>
        <div className="p-3 flex flex-col gap-3">
          <div className="flex justify-between items-center">
             <div className="h-4 w-24 bg-gray-200 rounded-full"></div>
             <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
          <div className="flex justify-between items-center">
             <div className="h-4 w-32 bg-gray-200 rounded"></div>
             <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-full bg-gray-200 rounded mt-1"></div>
        </div>
      </div>
    );
  }

  const property = [...(properties ?? [])].sort((a, b) => a.price - b.price)[0];

  if (!property) return null;

  return (
    <div className="[&>article]:shadow-none">
      <FeaturedPropertyCard 
        property={property} 
        saved={wishlist.isSaved(property.id)} 
        onSave={wishlist.toggle} 
      />
    </div>
  );
}
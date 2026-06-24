"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { FeaturedPropertyCard } from "@/components/FeaturedPropertyCard";
import type { Property } from "@/types/property";

export default function PropertyCardWithWishlist({ property }: { property: Property }) {
  const wishlist = useWishlist();
  
  return (
    <FeaturedPropertyCard 
      property={property} 
      saved={wishlist.isSaved(property.id)} 
      onSave={wishlist.toggle} 
    />
  );
}
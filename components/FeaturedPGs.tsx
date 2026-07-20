"use client";

import Link from "next/link";
import { PropertyCard } from "@/components/PropertyCard";
import type { Property } from "@/types/property";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

type FeaturedPGsProps = {
  properties: Property[];
};

export function FeaturedPGs({ properties }: FeaturedPGsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <section className="px-4 py-10 mt-[-40px] bg-brand-bg" aria-label="Featured Properties">
      <div className="mx-auto max-w-7xl">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-brand-dark font-display">
            Find Your New Home
          </h2>
          <Link href="/listings" className="flex items-center gap-1 text-brand-green text-sm font-semibold hover:underline transition-colors">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Global style injection strictly hides the scrollbar without breaking functionality */}
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        <div className="flex overflow-x-auto hide-scrollbar gap-5 snap-x snap-mandatory scroll-smooth pb-4">
          {properties && properties.length > 0 ? (
            properties.map((property) => (
              <div key={property.id} className="w-[300px] sm:w-[340px] shrink-0 snap-start flex flex-col">
                <PropertyCard property={property} saved={false} onSave={console.log} />
              </div>
            ))
          ) : (
            <div className="text-muted text-sm py-8 w-full text-center">No properties available yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}
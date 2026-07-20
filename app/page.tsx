"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { CollegeCards } from "@/components/CollegeCards";
import { FeaturedPGs } from "@/components/FeaturedPGs";
import { TrustGrid } from "@/components/TrustGrid";
import { BottomCTA } from "@/components/BottomCTA";
import { getProperties } from "@/lib/api/properties";
import type { Property } from "@/types/property";

export default function HomePage() {
  const [featuredProps, setFeaturedProps] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    async function loadFeatured() {
      try {
        const data = await getProperties();
        if (data?.properties && isMounted) {
          // Pass all properties to the marquee instead of just 5
          setFeaturedProps(data.properties);
          setIsLoading(false);
        }
      } catch (e) {
        console.error(`Fetch failed (Attempt ${retryCount + 1}/${maxRetries}):`, e);
        if (retryCount < maxRetries && isMounted) {
          retryCount++;
          setTimeout(loadFeatured, 2000); // Wait 2s before retry
        } else if (isMounted) {
          setIsLoading(false); // Stop loading if out of retries
        }
      }
    }
    loadFeatured();

    return () => { isMounted = false; };
  }, []);

  return (
    <main className="bg-brand-bg min-h-screen">
      <Hero />
      <CollegeCards  />

      {/* If still loading, render a placeholder state or the empty section so the layout doesn't jump */}
      {isLoading ? (
        <section className="px-4 py-10 bg-brand-bg min-h-[300px] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
        </section>
      ) : (
        <FeaturedPGs properties={featuredProps} />
      )}

      <TrustGrid />
      <BottomCTA />
    </main>
  );
}
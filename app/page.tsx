"use client";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { buttonClasses } from "@/components/Button";
import { FeaturedPropertyCard } from "@/components/FeaturedPropertyCard";
import { useWishlist } from "@/hooks/useWishlist";
import type { Property } from "@/types/property";
import { useState, useEffect } from "react";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { FeaturesSection } from "@/components/FeaturesSection";
import { toProperty } from "@/lib/api/types";

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-8 sm:px-6 md:grid-cols-[1fr_1.08fr] md:items-center md:pt-16 lg:px-8">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-soft">
            Verified student homes
          </div>
          <Image
            src={logo}
            alt="LivingGo Logo"
            width={992}
            height={597}
            className="h-21 w-auto"
          />
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            Find a calm, well-managed PG/flat near campus with transparent pricing, real facilities, and virtual tours before you visit.
          </p>
          <a
            href="tel:+919068902886"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xl font-bold text-white shadow-lift transition hover:opacity-90 w-fit"
          >
            Call Us
          </a>

          {/* Buttons — only on sm+, hidden on mobile */}
          {/* Buttons — hidden on mobile, shown on sm+ */}
          <div className="hidden mt-6 gap-3 sm:flex sm:flex-row">
            <Link href="/listings" className={buttonClasses("primary", undefined, "w-full sm:w-auto")}>
              Find PGs <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/listings" className={buttonClasses("secondary", undefined, "w-full sm:w-auto")}>
              Find Flats
            </Link>
            
          </div>
        </div>

        {/* UI Panel */}
        <div className="relative mx-auto w-full max-w-[510px]">
          <Image
            src="/assets/ui-panel.png"
            alt="Featured Property Panel"
            width={510}
            height={650}
            className="block h-auto w-full drop-shadow-xl"
            aria-hidden="true"
          />
          <div className="absolute inset-0 px-[10%] pb-[5%] pt-[28%] sm:pt-[30%] flex flex-col items-center">
            <div className="mb-3 flex items-center gap-2 font-bold text-ink -translate-x-[10px] text-[15.5px]">
              <ShieldCheck className="h-4 w-4 text-ink" aria-hidden />
              Featured this week
            </div>
            <div className="w-[85%] max-w-[280px] mx-auto mt-2">
              <PropertyPreview />
            </div>
          </div>
        </div>

        {/* Buttons — only on mobile, below image panel */}
        <div className="flex flex-col gap-3 sm:hidden">
          <Link href="/listings" className={buttonClasses("primary", undefined, "w-full")}>
            Find PGs <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href="/listings" className={buttonClasses("secondary", undefined, "w-full")}>
            Find Flats
          </Link>
        </div>
      </section>
      <FeaturesSection />
    </main>
  );
}

function PropertyPreview() {
  const wishlist = useWishlist();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/properties/featured`, {
          cache: "no-store" 
        });
        
        if (res.ok) {
          const rawData = await res.json();
          // THE FIX: Transform the raw data using your app's native masking logic
          const transformedProperty = toProperty(rawData);
          setProperty(transformedProperty);
        }
      } catch (error) {
        console.error("Failed to fetch featured property:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  // Show a clean skeleton loader while the fast query runs
  if (isLoading) return <div className="h-[280px] w-full animate-pulse rounded-xl bg-gray-200/50"></div>;
  if (!property) return null;

  return (
    <div className="[&>article]:shadow-none">
      <FeaturedPropertyCard property={property} saved={wishlist.isSaved(property.id)} onSave={wishlist.toggle} />
    </div>
  );
}
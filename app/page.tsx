"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { buttonClasses } from "@/components/Button";
import { PropertyCard } from "@/components/PropertyCard";
import { mockProperties } from "@/lib/mock-data";
import { useWishlist } from "@/hooks/useWishlist";

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-8 sm:px-6 md:grid-cols-[1fr_1.08fr] md:items-center md:pt-16 lg:px-8">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-soft">
            <Sparkles className="h-4 w-4 text-clay" aria-hidden />
            Verified student homes
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-normal text-ink sm:text-6xl">
            LivingGo
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            Find calm, well-managed rooms near campus with transparent pricing, real facilities, and virtual tours before you visit.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/listings" className={buttonClasses("primary", "w-full sm:w-auto")}>
              Browse homes <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/wishlist" className={buttonClasses("secondary", "w-full sm:w-auto")}>
              View wishlist
            </Link>
          </div>
        </div>

        {/* Updated UI Panel Container/*/}
        <div className="relative mx-auto w-full max-w-[510px]">
          {/* 1. The image acts as the physical structure, dictating the exact height/width ratio */}
          <Image
            src="/assets/ui-panel.png" 
            alt="Featured Property Panel" 
            className="block h-auto w-full drop-shadow-xl"
            aria-hidden="true"
          />

          {/* 2. The content area is absolutely positioned over the panel. 
             We use percentage padding to push the content exactly below the heart and within the wood border. */}
          <div className="absolute inset-0 px-[10%] pb-[5%] pt-[28%] sm:pt-[30%] flex flex-col items-center">
            <div className="mb-3 flex items-center gap-2 font-bold text-ink -translate-x-[70px] text-[15.5px]">
              <ShieldCheck className="h-4 w-4 text-ink" aria-hidden />
              Featured this week
            </div>
            
            {/* 3. We wrap PropertyPreview to give it a relative scale so it fits the small space precisely. */}
            <div className="w-full flex-1 origin-top scale-[0.75] sm:scale-[0.80] lg:scale-[0.85]">
              <PropertyPreview />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
function PropertyPreview() {
  const wishlist = useWishlist();
  const property = mockProperties[0];

  return (
    <div className="[&>article]:shadow-none">
      <PropertyCard property={property} saved={wishlist.isSaved(property.id)} onSave={wishlist.toggle} />
    </div>
  );
}
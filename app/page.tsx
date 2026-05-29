"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { buttonClasses } from "@/components/Button";
import { PropertyCard } from "@/components/PropertyCard";
import { useWishlist } from "@/hooks/useWishlist";
import { useProperties } from "@/hooks/useProperties";

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-8 sm:px-6 md:grid-cols-[1fr_1.08fr] md:items-center md:pt-16 lg:px-8">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-soft">
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

        <div className="relative mx-auto w-full max-w-[510px]">
          {/* <Image
            src="/assets/ui-panel.png"
            alt="Featured Property Panel"
            className="block h-auto w-full drop-shadow-xl"
            aria-hidden="true"
          /> */}
          <div className="absolute inset-0 px-[10%] pb-[5%] pt-[28%] sm:pt-[30%] flex flex-col items-center">
            <div className="mb-3 flex items-center gap-2 font-bold text-ink -translate-x-[70px] text-[15.5px]">
              <ShieldCheck className="h-4 w-4 text-ink" aria-hidden />
              Featured this week
            </div>
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
  const { properties, isLoading } = useProperties();

  // Show the cheapest approved property
  const property = [...(properties ?? [])]
    .sort((a, b) => a.price - b.price)[0];

  if (isLoading || !property) return null;

  return (
    <div className="[&>article]:shadow-none">
      <PropertyCard property={property} saved={wishlist.isSaved(property.id)} onSave={wishlist.toggle} />
    </div>
  );
}
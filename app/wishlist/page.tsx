"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { EmptyState } from "@/components/EmptyState";
import { PropertyCard } from "@/components/PropertyCard";
import { buttonClasses } from "@/components/Button";
import { useWishlist } from "@/hooks/useWishlist";

export default function WishlistPage() {
  const wishlist = useWishlist();
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-clay">Saved homes</p>
          <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Wishlist</h1>
        </div>
        <Link href="/listings" className={buttonClasses("secondary")}>Browse listings</Link>
      </div>
      {wishlist.properties.length === 0 ? (
        <EmptyState title="Your wishlist is empty" message="Save homes from listings to compare them later." />
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.properties.map((property) => (
            <PropertyCard key={property.id} property={property} saved onSave={wishlist.toggle} />
          ))}
        </section>
      )}
    </main>
  );
}
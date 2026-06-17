"use client";

// components/PropertyCard.tsx  (FULL REPLACEMENT)
// Adds: available beds badge

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, BedDouble } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/Button";
import { formatPrice } from "@/lib/utils";
import type { Property } from "@/types/property";

type PropertyCardProps = {
  property: Property;
  saved: boolean;
  onSave: (id: string) => void | Promise<void>;
};

export function PropertyCard({ property, saved, onSave }: PropertyCardProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();

  function handleSave() {
    if (!isSignedIn) {
      router.push("/login");
      return;
    }
    void onSave(property.id);
  }

  // ── NEW: bed availability ────────────────────────────────────────────────
  const totalBeds = (property.bedsSingle ?? 0) + (property.bedsDouble ?? 0) + (property.bedsTriple ?? 0);
  const availableBeds = Math.max(0, totalBeds - (property.occupiedBeds ?? 0));
  const showAvailability = totalBeds > 0;

  return (
    <article className="w-full max-w-[360px] mx-auto bg-white rounded-2xl overflow-hidden shadow-soft flex flex-col">
      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover"
          />
          {/* Availability badge over image */}
          {showAvailability && (
            <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5 ${
              availableBeds === 0 ? "bg-red-500 text-white" : "bg-white/95 text-green-700"
            }`}>
              <BedDouble className="h-3 w-3" />
              {availableBeds === 0 ? "Full" : `${availableBeds} left`}
            </span>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-xl font-black text-ink">{formatPrice(property.price)}<span className="text-sm font-semibold text-muted">/mo</span></p>
            <h2 className="mt-1 line-clamp-1 text-lg font-bold text-ink">{property.title}</h2>
          </div>
          <button
            onClick={handleSave}
            className="rounded-full bg-linen p-3 text-ink transition hover:bg-oat"
            aria-label={saved ? "Remove from wishlist" : "Save property"}
            title={!isSignedIn ? "Login to save" : saved ? "Remove from wishlist" : "Save property"}
          >
            <Heart className={saved ? "h-5 w-5 fill-clay text-clay" : "h-5 w-5"} aria-hidden />
          </button>
        </div>
        <p className="flex items-center gap-2 text-xs text-muted">
          <MapPin className="h-4 w-4" aria-hidden />
          {property.location}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded-full bg-linen px-3 py-1 text-xs font-bold text-ink">{property.roomType}</span>
          <span className="rounded-full bg-linen px-3 py-1 text-xs font-bold text-ink">{property.preference}</span>
          {property.facilities.slice(0, 2).map((facility) => (
            <span key={facility} className="rounded-full bg-linen px-3 py-1 text-xs font-semibold text-muted">
              {facility}
            </span>
          ))}
        </div>
        <Button variant="secondary" className="w-full mt-auto" onClick={() => window.location.assign(`/properties/${property.id}`)}>
          View details
        </Button>
      </div>
    </article>
  );
}
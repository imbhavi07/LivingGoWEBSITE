"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, BedDouble, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/Button";
import { formatPrice } from "@/lib/utils";
import type { Property } from "@/types/property";
import { getTailoredColleges } from "@/lib/distance";

// fast fast
const optimizeImageUrl = (url: string | undefined): string => {
  if (!url) return "/placeholder-property.jpg";
  
  if (url.includes("res.cloudinary.com")) {
    let optimizedUrl = url;
    if (!optimizedUrl.includes("f_auto")) {
      optimizedUrl = optimizedUrl.replace("/upload/", "/upload/f_auto,q_auto/");
    }
    return optimizedUrl.replace(/\.heic$/i, ".webp");
  }
  
  return url;
};

type PropertyCardProps = {
  property: Property;
  saved: boolean;
  onSave: (id: string) => void | Promise<void>;
  priority?: boolean; 
};


export function PropertyCard({ property, saved, onSave, priority = false }: PropertyCardProps) {

  const { isSignedIn } = useUser();
  const router = useRouter();

  function handleSave() {
    if (!isSignedIn) {
      router.push("/login");
      return;
    }
    void onSave(property.id);
  }

  const totalBeds = (property.bedsSingle ?? 0) + (property.bedsDouble ?? 0) + (property.bedsTriple ?? 0);
  const availableBeds = Math.max(0, totalBeds - (property.occupiedBeds ?? 0));
  const showAvailability = totalBeds > 0;

  const availableRoomTypes = [];
  if ((property.bedsSingle ?? 0) > 0) availableRoomTypes.push("Single");
  if ((property.bedsDouble ?? 0) > 0) availableRoomTypes.push("Double");
  if ((property.bedsTriple ?? 0) > 0) availableRoomTypes.push("Triple");

  const displayRoomTypes = availableRoomTypes.length > 0 
    ? availableRoomTypes.join(" • ") 
    : property.roomType;

  // ── DYNAMIC DISTANCE CALCULATION & ANIMATION ─────────────────────────
  const nearestColleges =
  property.lat != null &&
  property.lng != null
    ? getTailoredColleges(
        property.lat,
        property.lng,
        property.preference
      )
    : [];

  const [collegeIndex, setCollegeIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (nearestColleges.length <= 1) return;

    const cycleTimer = setInterval(() => {
      setIsFading(true); 
      
      setTimeout(() => {
        setCollegeIndex((prev) => (prev + 1) % nearestColleges.length);
        setIsFading(false);
      }, 500); 
      
    }, 2500); 

    return () => clearInterval(cycleTimer);
  }, [nearestColleges.length]);

  let distanceUI = <span className="text-sm font-medium text-muted truncate flex-1 min-w-0">{property.location ?? ''}</span>;

  if (nearestColleges.length > 0) {
    const currentCollege = nearestColleges[collegeIndex];
    distanceUI = (
      <span
        className={`text-sm font-medium text-muted truncate transition-opacity duration-500 ease-in-out flex-1 min-w-0 ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
      >
        {Number.isFinite(currentCollege.distance) ? currentCollege.distance.toFixed(1) : '—'} km to {currentCollege.name}
      </span>
    );
  }
  // ───────────────────────────────────────────────────────────────────
  const locality =
  property.location
    ?.split(",")[0]
    ?.trim() || "North Campus";

  return (
    <article className="group flex-shrink-0 h-auto min-h-[fit-content] overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 hover:-translate-y-3 hover:shadow-lift mb-4">
      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={optimizeImageUrl(property.images[0]?.url)}
            alt={property.title}
            fill
            priority={priority}
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            unoptimized
          />
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
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xl font-black text-ink">{formatPrice(property.price)}<span className="text-sm font-semibold text-muted">/mo</span></p>
            <h2 className="mt-1 line-clamp-1 text-lg font-bold text-ink">
              {property.preference === "Any" ? "Boys & Girls PG" : `${property.preference} PG`} 
              {" "}in{" "} 
              <span className="text-amber-700">
                {locality}
              </span>
              
            </h2>
            {property.propertyCode && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold tracking-wide text-slate-700">
                🏷
                <span>Property ID:</span>
                <span className="font-extrabold text-amber-700">
                  {property.propertyCode}
                </span>
              </div>
            )}
            {displayRoomTypes && (
              <p className="mt-1 text-sm font-semibold text-muted">
                {displayRoomTypes}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href="tel:+916200232083"
              className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-2.5 text-sm font-bold text-green-700 transition hover:bg-green-200"
              onClick={(e) => e.stopPropagation()} 
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Call</span> 
            </a>

            <button
              onClick={handleSave}
              className="rounded-full bg-linen p-2.5 text-ink transition hover:bg-oat"
              aria-label={saved ? "Remove from wishlist" : "Save property"}
              title={!isSignedIn ? "Login to save" : saved ? "Remove from wishlist" : "Save property"}
            >
              <Heart className={saved ? "h-5 w-5 fill-clay text-clay" : "h-5 w-5"} aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 pb-2">
          <MapPin className="h-4 w-4 text-ink flex-shrink-0" aria-hidden />
          {distanceUI}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-linen px-3 py-1 text-xs font-bold text-ink">{property.preference}</span>
          {(property.facilities ?? []).slice(0, 3).map((facility) => (
            <span key={facility} className="rounded-full bg-linen px-3 py-1 text-xs font-semibold text-muted">
              {facility}
            </span>
          ))}
        </div>

        <Button variant="secondary" className="w-full" onClick={() => window.location.assign(`/properties/${property.id}`)}>
          View details
        </Button>
      </div>
    </article>
  );
}
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Heart, MapPin, BedDouble, Phone, Cctv, Check, 
  Shirt, Wifi, WashingMachine, Droplets, Wind, 
  Thermometer, ShieldCheck 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
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

// Facility Icon Mapper
const getFacilityIcon = (facilityName: string) => {
  const name = facilityName.toLowerCase();
  if (name.includes("cctv")) return <Cctv className="w-3 h-3 shrink-0" />;
  if (name.includes("laundry")) return <Shirt className="w-3 h-3 shrink-0" />;
  if (name.includes("wi-fi") || name.includes("wifi")) return <Wifi className="w-3 h-3 shrink-0" />;
  if (name.includes("washing")) return <WashingMachine className="w-3 h-3 shrink-0" />;
  if (name.includes("water") || name.includes("ro")) return <Droplets className="w-3 h-3 shrink-0" />;
  if (name.includes("ac") || name.includes("air")) return <Wind className="w-3 h-3 shrink-0" />;
  if (name.includes("geyser")) return <Thermometer className="w-3 h-3 shrink-0" />;
  if (name.includes("security") || name.includes("guard")) return <ShieldCheck className="w-3 h-3 shrink-0" />;
  if (name.includes("housekeeping")) return <Check className="w-3 h-3 shrink-0" />;
  return <Check className="w-3 h-3 shrink-0" />; // Fallback
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

  const openProperty = () => {
    router.push(`/properties/${property.id}`);
  };
  
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

  // DYNAMIC DISTANCE CALCULATION
  const nearestColleges = property.lat != null && property.lng != null
    ? getTailoredColleges(property.lat, property.lng, property.preference)
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

  let distanceUI = <span className="text-[13px] font-medium text-muted truncate flex-1 min-w-0">{property.location ?? ''}</span>;
  if (nearestColleges.length > 0) {
    const currentCollege = nearestColleges[collegeIndex];
    distanceUI = (
      <span className={`text-[13px] font-medium text-muted truncate transition-opacity duration-500 ease-in-out flex-1 min-w-0 ${isFading ? "opacity-0" : "opacity-100"}`}>
        {Number.isFinite(currentCollege.distance) ? currentCollege.distance.toFixed(1) : '—'} km to {currentCollege.name}
      </span>
    );
  }
  
  const locality = property.location?.split(",")[0]?.trim() || "North Campus";

  return (
    <article
      onClick={openProperty}
      // Added flex/h-full so the card stretches to match taller siblings in a row
      className="group flex flex-col h-full cursor-pointer overflow-hidden rounded-[1.75rem] bg-white shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl border border-neutral-100"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-neutral-100">
        <Image
          src={optimizeImageUrl(property.images[0]?.url)}
          alt={property.title}
          fill
          priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          unoptimized
        />
        {showAvailability && (
          <span className={`absolute top-3 right-3 rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sm ${
            availableBeds === 0 ? "bg-red-500 text-white" : "bg-white/95 text-green-700 backdrop-blur-sm"
          }`}>
            <BedDouble className="h-3.5 w-3.5" />
            {availableBeds === 0 ? "Full" : `${availableBeds} left`}
          </span>
        )}
      </div>

      {/* INNER CONTENT WRAPPER: Flex-1 ensures it fills remaining space */}
      <div className="flex flex-1 items-stretch justify-between gap-3 p-4 sm:p-5">
        
        {/* LEFT COLUMN - Information */}
        <div className="flex flex-1 flex-col min-w-0">
          <p className="text-[22px] font-black text-ink leading-none">
            {formatPrice(property.price)}<span className="text-sm font-semibold text-muted">/mo</span>
          </p>
          
          <h2 className="mt-2 line-clamp-2 text-base font-bold leading-tight text-ink">
            {property.preference === "Any" ? "Boys & Girls PG" : `${property.preference} PG`} 
            {" "}in{" "} 
            <span className="text-amber-700">{locality}</span>
          </h2>

          {property.propertyCode && (
            <div className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-slate-700">
              <span>ID:</span>
              <span className="font-extrabold text-amber-700">{property.propertyCode}</span>
            </div>
          )}

          {displayRoomTypes && (
            <p className="mt-2 text-xs font-semibold text-muted">
              {displayRoomTypes}
            </p>
          )}

          <div className="mt-2 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-muted" aria-hidden />
            {distanceUI}
          </div>

          {/* mt-auto forces the facilities to stick to the bottom of this column */}
          <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
            {(property.facilities ?? []).slice(0, 3).map((facility) => (
              <span 
                key={facility} 
                className="inline-flex items-center gap-1 rounded-full border border-neutral-100 bg-neutral-50 px-2 py-1 text-[10px] font-bold text-neutral-600"
              >
                {getFacilityIcon(facility)}
                {facility}
              </span>
            ))}
          </div>
        </div>
        
        {/* RIGHT COLUMN - Actions */}
        <div className="flex w-[110px] shrink-0 flex-col items-end justify-between">
          
          {/* Top Icons Row */}
          <div className="flex w-full items-center justify-end gap-2">
            <a
              href="tel:+916200232083"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 transition hover:bg-green-200"
              onClick={(e) => e.stopPropagation()} 
              title="Call Owner"
            >
              <Phone className="h-4 w-4" />
            </a>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linen text-ink transition hover:bg-oat focus:outline-none"
              aria-label={saved ? "Remove from wishlist" : "Save property"}
              title={!isSignedIn ? "Login to save" : saved ? "Remove from wishlist" : "Save property"}
            >
              <Heart className={saved ? "h-5 w-5 fill-clay text-clay" : "h-5 w-5"} aria-hidden />
            </button>
          </div>

          {/* mt-auto forces the buttons to stick to the absolute bottom of the card */}
          <div className="mt-auto flex w-full flex-col gap-2 pt-4">
            <button
              className="w-full rounded-full bg-[#78b264] py-2.5 text-xs font-bold tracking-wider text-white shadow-sm transition hover:opacity-90 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/properties/${property.id}`);
              }}
            >
              Pre-Book
            </button>

            <button
              className="w-full rounded-full bg-[#60c0be] py-2.5 text-xs font-bold tracking-wider text-white shadow-sm transition hover:opacity-90 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/properties/${property.id}?scheduleVisit=true`);
              }}
            >
              Schedule Visit
            </button>
          </div>

        </div>
      </div>
    </article>
  );
}
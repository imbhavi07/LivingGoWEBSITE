"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, BedDouble, Check, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/Button";
import { formatPrice } from "@/lib/utils";
import type { Property } from "@/types/property";

type FeaturedPropertyCardProps = {
  property: Property;
  saved: boolean;
  onSave: (id: string) => void | Promise<void>;
};

export function FeaturedPropertyCard({ property, saved, onSave }: FeaturedPropertyCardProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();

  function handleSave() {
    if (!isSignedIn) {
      router.push("/login");
      return;
    }
    void onSave(property.id);
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const slideshowImages = property.images
    .filter((_, index) => index % 2 === 0)
    .slice(0, 5);

  useEffect(() => {
    if (slideshowImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slideshowImages.length);
    }, 5000); 

    return () => clearInterval(timer);
  }, [slideshowImages.length]);

  const totalBeds = (property.bedsSingle ?? 0) + (property.bedsDouble ?? 0) + (property.bedsTriple ?? 0);
  const availableBeds = Math.max(0, totalBeds - (property.occupiedBeds ?? 0));
  const showAvailability = totalBeds > 0;
  const locality =
  property.location
    ?.split(",")[0]
    ?.trim() || "North Campus";
  
  return (
    <article className="group w-[85%] max-w-[260px] sm:w-full sm:max-w-none mx-auto bg-white rounded-xl overflow-hidden shadow-soft flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] md:aspect-[5/4] overflow-hidden bg-gray-100">
          
          {slideshowImages.map((image, index) => (
            <Image
              key={`${property.id}-image-${index}`}
              // THE FIX IS HERE: add .url to extract the actual image link
              src={typeof image === 'string' ? image : (image as { url: string }).url}
              alt={`Beautiful, verified student rooms in ${property.location}`}
              fill
              className={`object-cover transition-all duration-1000 group-hover:scale-105 ${
                index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            />
          ))}

          {showAvailability && (
            <span className={`absolute top-2 right-2 z-20 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold flex items-center gap-1 ${
              availableBeds === 0 ? "bg-red-500 text-white" : "bg-white/95 text-green-700"
            }`}>
              <BedDouble className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              {availableBeds === 0 ? "Full" : `${availableBeds} left`}
            </span>
          )}
        </div>
      </Link>
      
      <div className="p-2.5 sm:p-3 pb-2 flex flex-col gap-1.5">
        
        <div className="flex items-start justify-between">
          <span className="w-fit rounded-full bg-green-100 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-green-700 flex items-center gap-1 sm:gap-1.5">
            <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Verified by LivingGo
          </span>
          <button
            onClick={handleSave}
            className="rounded-full bg-linen p-1.5 sm:p-2 text-ink transition hover:bg-oat -mt-1 -mr-1"
            aria-label={saved ? "Remove from wishlist" : "Save property"}
            title={!isSignedIn ? "Login to save" : saved ? "Remove from wishlist" : "Save property"}
          >
            <Heart className={saved ? "h-3.5 w-3.5 sm:h-4 sm:w-4 fill-clay text-clay" : "h-3.5 w-3.5 sm:h-4 sm:w-4"} aria-hidden />
          </button>
        </div>

        <div className="-mt-0.5">
          <p className="text-lg sm:text-xl font-black text-ink leading-none">{formatPrice(property.price)}<span className="text-[10px] sm:text-xs font-semibold text-muted">/mo</span></p>
        </div>

        <div className="flex items-center justify-between gap-2 -mt-0.5">

          <h2 className="line-clamp-1 text-xs sm:text-sm font-bold text-ink">
            {property.preference === "Any"
              ? "Boys & Girls PG"
              : `${property.preference} PG`}{" "}
            in{" "}
            <span className="text-amber-700">
              {locality}
            </span>
          </h2>

          <div className="flex flex-shrink-0 gap-1">
            <span className="inline-flex items-center gap-1 bg-linen px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-bold text-ink whitespace-nowrap">
              <UserRound className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              {property.preference}
            </span>
          </div>

        </div>

        <Button variant="secondary" className="w-full mt-1 py-1 text-[10px] sm:text-xs" onClick={() => window.location.assign(`/properties/${property.id}`)}>
          View details
        </Button>
      </div>
    </article>
  );
}
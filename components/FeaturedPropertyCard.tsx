"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, BedDouble, Check } from "lucide-react";
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

  const totalBeds = (property.bedsSingle ?? 0) + (property.bedsDouble ?? 0) + (property.bedsTriple ?? 0);
  const availableBeds = Math.max(0, totalBeds - (property.occupiedBeds ?? 0));
  const showAvailability = totalBeds > 0;

  return (
    <article className="group w-full bg-white rounded-xl overflow-hidden shadow-soft flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
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
      <div className="p-3 flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-lg font-black text-ink">{formatPrice(property.price)}<span className="text-sm font-semibold text-muted">/mo</span></p>
            <h2 className="mt-1 line-clamp-1 text-base font-bold text-ink">{property.title}</h2>
          </div>
          <button
            onClick={handleSave}
            className="rounded-full bg-linen p-3 text-ink transition hover:bg-oat"
            aria-label={saved ? "Remove from wishlist" : "Save property"}
            title={!isSignedIn ? "Login to save" : saved ? "Remove from wishlist" : "Save property"}
          >
            <Heart className={saved ? "h-5 w-5 fill-clay text-clay" : "h-5 w-5"} aria-hidden />
          </button>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] text-green-700 flex items-center gap-1.5">
            <Check className="h-3 w-3" />
            Verified by LivingGo
          </span>
        </div>
        <Button variant="secondary" className="w-full mt-2 py-1.5 text-xs" onClick={() => window.location.assign(`/properties/${property.id}`)}>
          View details
        </Button>
      </div>
    </article>
  );
}
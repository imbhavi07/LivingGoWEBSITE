"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
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

  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-2xl transition hover:-translate-y-3 hover:scale-[1.04] hover:shadow-lift">
      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative h-56 overflow-hidden">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
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
        <p className="flex items-center gap-2 text-sm text-muted">
          <MapPin className="h-4 w-4" aria-hidden />
          {property.location}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-linen px-3 py-1 text-xs font-bold text-ink">{property.roomType}</span>
          <span className="rounded-full bg-linen px-3 py-1 text-xs font-bold text-ink">{property.preference}</span>
          {property.facilities.slice(0, 2).map((facility) => (
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
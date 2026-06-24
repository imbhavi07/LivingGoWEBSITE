import Image from "next/image";
import Link from "next/link";
import { BedDouble, Check, UserRound } from "lucide-react";
import { WishlistButton } from "./WishlistButton";
import { Button } from "@/components/Button";
import { formatPrice } from "@/lib/utils";
import type { Property } from "@/types/property";

type FeaturedPropertyCardProps = {
  property: Property;
  saved: boolean;
  onSave: (id: string) => void;
};

export function FeaturedPropertyCard({ property, saved, onSave }: FeaturedPropertyCardProps) {
  const totalBeds = (property.bedsSingle ?? 0) + (property.bedsDouble ?? 0) + (property.bedsTriple ?? 0);
  const availableBeds = Math.max(0, totalBeds - (property.occupiedBeds ?? 0));
  const showAvailability = totalBeds > 0;

  return (
    <article className="group w-[85%] max-w-[260px] sm:w-full sm:max-w-none mx-auto bg-white rounded-xl overflow-hidden shadow-soft flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] md:aspect-[5/4] overflow-hidden bg-gray-100">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            priority
            className="object-cover transition-all duration-1000 group-hover:scale-105"
          />
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
            <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Verified by LivingGo
          </span>
          <WishlistButton propertyId={property.id} saved={saved} onSave={onSave} />
        </div>

        <div>
          <p className="text-lg sm:text-xl font-black text-ink leading-none">{formatPrice(property.price)}<span className="text-[10px] sm:text-xs font-semibold text-muted">/mo</span></p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <h2 className="line-clamp-1 text-xs sm:text-sm font-bold text-muted-foreground truncate">{property.title}</h2>
          <span className="inline-flex items-center gap-1 bg-linen px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold text-ink whitespace-nowrap">
            <UserRound className="h-2.5 w-2.5" /> {property.preference} PG
          </span>
        </div>

        <Button variant="secondary" className="w-full mt-1 py-1 text-[10px] sm:text-xs" onClick={() => window.location.assign(`/properties/${property.id}`)}>
          View details
        </Button>
      </div>
    </article>
  );
}
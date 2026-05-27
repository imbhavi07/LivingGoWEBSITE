"use client";

import { useParams } from "next/navigation";
import { Check, Clock, GraduationCap, Heart, MapPin, Phone, ShieldCheck, Train, UtensilsCrossed } from "lucide-react";
import { Button, buttonClasses } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Gallery } from "@/components/Gallery";
import { DetailsSkeleton } from "@/components/loading/DetailsSkeleton";
import { useProperty } from "@/hooks/useProperties";
import { useWishlist } from "@/hooks/useWishlist";
import { formatPrice } from "@/lib/utils";

type NearbyPlace = {
  name: string;
  distance: string;
  distanceMeters: number;
  type: "girls_college" | "coed_college" | "metro";
};

type NearbyPlacesData = {
  colleges: NearbyPlace[];
  metro: NearbyPlace | null;
};

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();
  const { property, isLoading, error } = useProperty(params.id);
  const wishlist = useWishlist();

  if (isLoading) return <DetailsSkeleton />;

  if (error || !property) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState title="Property not found" message="This listing may have been removed or the link may be incorrect." />
      </main>
    );
  }

  const saved = wishlist.isSaved(property.id);
  const nearbyPlaces = property.nearbyPlaces as NearbyPlacesData | null;
  const hasNearby = nearbyPlaces && (nearbyPlaces.colleges?.length > 0 || nearbyPlaces.metro);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10 lg:px-8">
      <Gallery images={property.images} title={property.title} />
      <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">

          {/* Title & Description */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-linen px-3 py-1 text-xs font-bold text-ink">{property.roomType}</span>
              <span className="rounded-full bg-linen px-3 py-1 text-xs font-bold text-ink">
                {property.preference === "Any" ? "Boys & Girls" : property.preference + " Only"}
              </span>
              {property.rulesStrictness && (
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${property.rulesStrictness === "Strict" ? "bg-red-50 text-red-700" : "bg-green-50 text-moss"}`}>
                  {property.rulesStrictness} Rules
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-black text-ink sm:text-5xl">{property.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-muted">
              <MapPin className="h-4 w-4" aria-hidden />
              {property.location}
            </p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted">{property.description}</p>
          </div>

          {/* Nearby colleges & metro ─────────────────────────────────── */}
          {hasNearby && (
            <section>
              <h2 className="text-2xl font-black text-ink">Nearby</h2>
              <p className="mt-1 text-sm text-muted">Walking/road distances from this PG</p>
              <div className="mt-4 space-y-3">

                {/* Colleges */}
                {nearbyPlaces.colleges?.map((place) => (
                  <div
                    key={place.name}
                    className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-soft"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      place.type === "girls_college"
                        ? "bg-pink-50 text-pink-600"
                        : "bg-blue-50 text-blue-600"
                    }`}>
                      <GraduationCap className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-ink truncate">{place.name}</p>
                      <p className="text-xs text-muted">
                        {place.type === "girls_college" ? "Girls college" : "Co-ed college"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black text-ink">{place.distance}</p>
                      <p className="text-xs text-muted">away</p>
                    </div>
                  </div>
                ))}

                {/* Metro */}
                {nearbyPlaces.metro && (
                  <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-soft">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                      <Train className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-ink truncate">{nearbyPlaces.metro.name}</p>
                      <p className="text-xs text-muted">Metro station</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black text-ink">{nearbyPlaces.metro.distance}</p>
                      <p className="text-xs text-muted">away</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Privacy note */}
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-linen p-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                <p className="text-xs text-muted">
                  Exact location is shared only after enquiry to protect owner privacy.
                </p>
              </div>
            </section>
          )}

          {/* Pricing */}
          <section>
            <h2 className="text-2xl font-black text-ink">Pricing</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {property.priceSingle ? (
                <div className="rounded-2xl bg-white p-4 shadow-soft">
                  <p className="text-xs font-bold uppercase text-muted">Single Room</p>
                  <p className="mt-1 text-2xl font-black text-ink">{formatPrice(property.priceSingle)}<span className="text-sm font-semibold text-muted">/mo</span></p>
                </div>
              ) : null}
              {property.priceDouble ? (
                <div className="rounded-2xl bg-white p-4 shadow-soft">
                  <p className="text-xs font-bold uppercase text-muted">Double Sharing</p>
                  <p className="mt-1 text-2xl font-black text-ink">{formatPrice(property.priceDouble)}<span className="text-sm font-semibold text-muted">/mo</span></p>
                </div>
              ) : null}
              {property.priceTriple ? (
                <div className="rounded-2xl bg-white p-4 shadow-soft">
                  <p className="text-xs font-bold uppercase text-muted">Triple Sharing</p>
                  <p className="mt-1 text-2xl font-black text-ink">{formatPrice(property.priceTriple)}<span className="text-sm font-semibold text-muted">/mo</span></p>
                </div>
              ) : null}
              {!property.priceSingle && !property.priceDouble && !property.priceTriple && (
                <div className="rounded-2xl bg-white p-4 shadow-soft sm:col-span-3">
                  <p className="text-xs font-bold uppercase text-muted">Monthly Rent</p>
                  <p className="mt-1 text-2xl font-black text-ink">{formatPrice(property.price)}<span className="text-sm font-semibold text-muted">/mo</span></p>
                </div>
              )}
            </div>
          </section>

          {/* Meals */}
          {property.mealPlan && property.mealPlan !== "Not Included" && (
            <section>
              <h2 className="text-2xl font-black text-ink">Meals</h2>
              <div className="mt-4 rounded-2xl bg-white p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="h-5 w-5 text-moss" aria-hidden />
                  <p className="font-bold text-ink">{property.mealPlan}</p>
                </div>
                {property.mealTimes && property.mealTimes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {property.mealTimes.map((time) => (
                      <span key={time} className="rounded-full bg-linen px-3 py-1 text-xs font-bold text-ink">{time}</span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Facilities */}
          <section>
            <h2 className="text-2xl font-black text-ink">Facilities</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {property.facilities.map((facility) => (
                <div key={facility} className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-bold text-ink shadow-soft">
                  <Check className="h-5 w-5 text-moss" aria-hidden />
                  {facility}
                </div>
              ))}
            </div>
          </section>

          {/* Rules */}
          {(property.curfewTime || property.noticePeriod) && (
            <section>
              <h2 className="text-2xl font-black text-ink">Rules & Policies</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {property.curfewTime && (
                  <div className="rounded-2xl bg-white p-4 shadow-soft">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted">
                      <Clock className="h-4 w-4" aria-hidden />
                      Curfew
                    </div>
                    <p className="mt-1 font-black text-ink">{property.curfewTime}</p>
                  </div>
                )}
                {property.noticePeriod && (
                  <div className="rounded-2xl bg-white p-4 shadow-soft">
                    <p className="text-xs font-bold uppercase text-muted">Notice Period</p>
                    <p className="mt-1 font-black text-ink">{property.noticePeriod}</p>
                  </div>
                )}
                {property.rulesStrictness && (
                  <div className="rounded-2xl bg-white p-4 shadow-soft">
                    <p className="text-xs font-bold uppercase text-muted">House Rules</p>
                    <p className="mt-1 font-black text-ink">{property.rulesStrictness}</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="h-fit rounded-3xl bg-white p-6 shadow-soft">
          <p className="text-sm font-bold uppercase text-muted">Starting from</p>
          <p className="mt-2 text-4xl font-black text-ink">{formatPrice(property.price)}<span className="text-sm font-semibold text-muted">/mo</span></p>
          <div className="mt-5 space-y-3 rounded-3xl bg-linen p-4">
            <p className="text-sm font-bold text-ink">Owner info</p>
            <p className="text-lg font-black text-ink">{property.owner.name}</p>
            <p className="flex items-center gap-2 text-sm font-bold text-moss">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              {property.owner.verified ? "Verified owner" : "Verification pending"}
            </p>
          </div>
          <div className="mt-4 rounded-2xl bg-amber-50 p-3">
            <p className="text-xs font-bold text-amber-700">📍 Exact location shared after enquiry</p>
          </div>
          <div className="mt-5 grid gap-3">
            <a className={buttonClasses("primary", "w-full")}>
              Lock Property
            </a>
            <Button variant="secondary" className="w-full" onClick={() => wishlist.toggle(property.id)}>
              <Heart className={saved ? "h-4 w-4 fill-clay text-clay" : "h-4 w-4"} aria-hidden />
              {saved ? "Saved" : "Save property"}
            </Button>
          </div>
        </aside>
      </section>
    </main>
  );
}

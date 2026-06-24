"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Check, Clock, GraduationCap, Heart, MapPin, ShieldCheck, Train, UtensilsCrossed, BedDouble } from "lucide-react";
import { Button, buttonClasses } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Gallery } from "@/components/Gallery";
import { DetailsSkeleton } from "@/components/loading/DetailsSkeleton";
import { useProperty } from "@/hooks/useProperties";
import { useWishlist } from "@/hooks/useWishlist";
import { formatPrice } from "@/lib/utils";
import { StarRating, type RatingData } from "@/components/StarRating";
import { ReviewSection } from "@/components/ReviewSection";
import { LockPropertyModal } from "@/components/LockPropertyModal";
import dynamic from "next/dynamic";

const PanoramaViewer = dynamic(
  () => import("@/components/PanoramaViewer"),
  { ssr: false, loading: () => <div className="h-96 w-full bg-linen rounded-lg flex items-center justify-center text-muted">Loading panorama…</div> }
);

type Review = {
  id: string;
  cleanliness: number;
  food: number;
  security: number;
  management: number;
  location: number;
  comment?: string | null;
  createdAt: string;
  student: { id: string; name: string };
};

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
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const userRole = (user?.publicMetadata?.role as string) ?? null;

  const [showLockModal, setShowLockModal] = useState(false);
  const [showPanorama, setShowPanorama] = useState(false);
  const [activePanorama, setActivePanorama] = useState<string | null>(null);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const propertyAny = property as any;
  const rawRating = propertyAny.rating;
  const rating: RatingData =
    rawRating && typeof rawRating === "object" && "overall" in rawRating
      ? (rawRating as RatingData)
      : { overall: null, cleanliness: null, food: null, security: null, management: null, location: null, count: 0 };
  const reviews: Review[] = propertyAny.reviews ?? [];

  // Bed availability per room type
  const totalBeds = (property.bedsSingle ?? 0) + (property.bedsDouble ?? 0) + (property.bedsTriple ?? 0);
  const availableBeds = Math.max(0, totalBeds - (property.occupiedBeds ?? 0));

  function handleLockClick() {
    if (!isSignedIn) {
      router.push("/login");
      return;
    }
    setShowLockModal(true);
  }

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10 lg:px-8">
        <Gallery images={property.images} title={property.title} />
        {property.panoramas &&
         property.panoramas.length > 0 && (
           <div className="mt-6 rounded-3xl bg-white p-5 shadow-soft">
             <h3 className="text-xl font-black text-ink">
               🌐 360° Virtual Tour
             </h3>
             <p className="mt-1 text-sm text-muted">
               Explore different areas of this property
             </p>
             <div className="mt-4 flex flex-wrap gap-3">
               {property.panoramas.map((panorama) => (
                 <Button
                   key={panorama.id}
                   variant="secondary"
                   onClick={() => {
                     setActivePanorama(
                       panorama.imageUrl
                     );
                     setShowPanorama(true);
                   }}
                 >
                   {panorama.title}
                 </Button>
               ))}
             </div>
           </div>
         )}
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
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${property.rulesStrictness === "Strict" ? "bg-red-50 text-red-700" : "bg-green-50 text-moss`}}>
                    {property.rulesStrictness} Rules
                  </span>
                )}
                {rating.overall !== null && (
                  <span className="rounded-full bg-amber-50 px-3 py-1">
                    <StarRating value={rating.overall} count={rating.count} size="sm" />
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

            {/* ── NEW: Room Availability ──────────────────────────────────── */}
            {totalBeds > 0 && (
              <section>
                <h2 className="text-2xl font-black text-ink">Room Availability</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {(property.bedsSingle ?? 0) > 0 && (
                    <div className="rounded-2xl bg-white p-4 shadow-soft">
                      <div className="flex items-center gap-2 mb-2">
                        <BedDouble className="h-4 w-4 text-muted" />
                        <p className="text-xs font-bold uppercase text-muted">Single Room</p>
                      </div>
                      <p className="text-2xl font-black text-ink">{property.bedsSingle}</p>
                      <p className="text-xs text-muted mt-0.5">total beds</p>
                      {property.priceSingle && (
                        <p className="mt-2 text-sm font-bold text-ink">{formatPrice(property.priceSingle)}/mo</p>
                      )}
                    </div>
                  )}
                  {(property.bedsDouble ?? 0) > 0 && (
                    <div className="rounded-2xl bg-white p-4 shadow-soft">
                      <div className="flex items-center gap-2 mb-2">
                        <BedDouble className="h-4 w-4 text-muted" />
                        <p className="text-xs font-bold uppercase text-muted">Double Sharing</p>
                      </div>
                      <p className="text-2xl font-black text-ink">{property.bedsDouble}</p>
                      <p className="text-xs text-muted mt-0.5">total beds</p>
                      {property.priceDouble && (
                        <p className="mt-2 text-sm font-bold text-ink">{formatPrice(property.priceDouble)}/mo</p>
                      )}
                    </div>
                  )}
                  {(property.bedsTriple ?? 0) > 0 && (
                    <div className="rounded-2xl bg-white p-4 shadow-soft">
                      <div className="flex items-center gap-2 mb-2">
                        <BedDouble className="h-4 w-4 text-muted" />
                        <p className="text-xs font-bold uppercase text-muted">Triple Sharing</p>
                      </div>
                      <p className="text-2xl font-black text-ink">{property.bedsTriple}</p>
                      <p className="text-xs text-muted mt-0.5">total beds</p>
                      {property.priceTriple && (
                        <p className="mt-2 text-sm font-bold text-ink">{formatPrice(property.priceTriple)}/mo</p>
                      )}
                    </div>
                  )}
                </div>
                {/* Overall availability bar */}
                <div className="mt-3 rounded-2xl bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-ink">Overall Availability</span>
                    <span className={`text-sm font-black ${availableBeds === 0 ? "text-red-600" : "text-green-700`}">
                      {availableBeds === 0 ? "Full" : `${availableBeds} of ${totalBeds} beds available`}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-linen rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${availableBeds === 0 ? "bg-red-400" : "bg-green-500`}`}
                      style={{ width: `${(availableBeds / totalBeds) * 100}%` }}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Nearby */}
            {hasNearby && (
              <section>
                <h2 className="text-2xl font-black text-ink">Nearby</h2>
                <p className="mt-1 text-sm text-muted">Walking/road distances from this PG</p>
                <div className="mt-4 space-y-3">
                  {nearbyPlaces.colleges?.map((place) => (
                    <div key={place.name} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-soft">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${place.type === "girls_college" ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600`}">
                        <GraduationCap className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-ink truncate">{place.name}</p>
                        <p className="text-xs text-muted">{place.type === "girls_college" ? "Girls college" : "Co-ed college"}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-ink">{place.distance}</p>
                        <p className="text-xs text-muted">away</p>
                      </div>
                    </div>
                  ))}
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
                  <div className="mt-3 flex items-center gap-2 rounded-2xl bg-linen p-3">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                    <p className="text-xs text-muted">Exact location is shared only after enquiry to protect owner privacy.</p>
                  </div>
                </section>
            )}

            {/* Pricing */}
            <section>
              <h2 className="text-2xl font-black text-ink">Pricing</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {property.priceSingle && (
                  <div className="rounded-2xl bg-white p-4 shadow-soft">
                    <p className="text-xs font-bold uppercase text-muted">Single Room</p>
                    <p className="mt-1 text-2xl font-black text-ink">{formatPrice(property.priceSingle)}<span className="text-sm font-semibold text-muted">/mo</span></p>
                  </div>
                )}
                {property.priceDouble && (
                  <div className="rounded-2xl bg-white p-4 shadow-soft">
                    <p className="text-xs font-bold uppercase text-muted">Double Sharing</p>
                    <p className="mt-1 text-2xl font-black text-ink">{formatPrice(property.priceDouble)}<span className="text-sm font-semibold text-muted">/mo</span></p>
                  </div>
                )}
                {property.priceTriple && (
                  <div className="rounded-2xl bg-white p-4 shadow-soft">
                    <p className="text-xs font-bold uppercase text-muted">Triple Sharing</p>
                    <p className="mt-1 text-2xl font-black text-ink">{formatPrice(property.priceTriple)}<span className="text-sm font-semibold text-muted">/mo</span></p>
                  </div>
                )}
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
                  {(property.mealTimes?.length ?? 0) > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {property.mealTimes?.map((time: string) => (
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
                {property.facilities.map((facility: string) => (
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
                        <Clock className="h-4 w-4" aria-hidden />Curfew
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
                      <p className="mt-1 font-bold text-ink">{property.rulesStrictness}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            <ReviewSection
              propertyId={property.id}
              rating={rating}
              reviews={reviews}
              userRole={userRole}
            />
          </div>

          {/* Sidebar */}
          <aside className="h-fit rounded-3xl bg-white p-6 shadow-soft">
            <p className="text-sm font-bold uppercase text-muted">Starting from</p>
            <p className="mt-2 text-4xl font-black text-ink">{formatPrice(property.price)}<span className="text-sm font-semibold text-muted">/mo</span></p>

            {rating.overall !== null && (
              <div className="mt-3">
                <StarRating value={rating.overall} count={rating.count} size="md" />
              </div>
            )}

            {/* Availability pill in sidebar */}
            {totalBeds > 0 && (
              <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${availableBeds === 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700`}">
                <span className={`h-1.5 w-1.5 rounded-full ${availableBeds === 0 ? "bg-red-500" : "bg-green-500`}" />
                {availableBeds === 0 ? "No beds available" : `${availableBeds} beds available`}
              </div>
            )}

            <div className="mt-5 space-y-3 rounded-3xl bg-linen p-4">
              <p className="text-sm font-bold text-ink">Owner info</p>
              <p className="text-lg font-black text-ink">{property.owner.name}</p>
              <p className="flex items-center gap-2 text-sm font-bold text-moss">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                {property.owner.verified ? "Verified owner" : "Verification pending"}
              </p>
            </div>
            <div className="mt-4 rounded-2xl bg-amber-50 p-3">
              <p className="text-xs font-bold text-amber-700">📍 Full address revealed after token payment approval</p>
            </div>
            <div className="mt-5 grid gap-3">
              <button
                onClick={handleLockClick}
                disabled={totalBeds > 0 && availableBeds === 0}
                className={buttonClasses("primary", undefined, "w-full")}
                style={totalBeds > 0 && availableBeds === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
              >
                {totalBeds > 0 && availableBeds === 0 ? "Property Full" : "Lock Property"}
              </button>
              <Button variant="secondary" className="w-full" onClick={() => wishlist.toggle(property.id)}>
                <Heart className={saved ? "h-4 w-4 fill-clay text-clay" : "h-4 w-4"} aria-hidden />
                {saved ? "Saved" : "Save property"}
              </Button>
            </div>
          </aside>
        </section>
      </main>

      {showLockModal && (
        <LockPropertyModal
          propertyId={property.id}
          propertyTitle={property.title}
          monthlyRent={property.price}
          onClose={() => setShowLockModal(false)}
        />
      )}

      {showPanorama && activePanorama && (
        <div className="fixed inset-0 z-[100] bg-black">
          <div className="absolute right-5 top-5 z-50">
            <Button
              variant="secondary"
              onClick={() =>
                setShowPanorama(false)
              }
            >
              ✕ Close Tour
            </Button>
          </div>

          {property.panoramas &&
            property.panoramas.length > 1 && (
              <div className="absolute left-5 top-5 z-50 flex gap-2">
                {property.panoramas.map((panorama) => (
                  <button
                    key={panorama.id}
                    onClick={() =>
                      setActivePanorama(
                        panorama.imageUrl
                      )
                    }
                    className = " rounded-xl bg-white px-4 py-2 text-sm font-bold shadow-lg hover:bg-linen "
                  >
                    {panorama.title}
                  </button>
                ))}
              </div>
            )}

            <PanoramaViewer
              imageUrl={activePanorama}
            />
          </div>
        )}
    </>
  );
}
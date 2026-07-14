"use client";
import { JSX, useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Check, Clock, GraduationCap, Heart, MapPin, ShieldCheck, Train, UtensilsCrossed, BedDouble } from "lucide-react";
import { Button, buttonClasses } from "@/components/Button";
import { Gallery } from "@/components/Gallery";
import { useWishlist } from "@/hooks/useWishlist";
import { formatPrice } from "@/lib/utils";
import { StarRating, type RatingData } from "@/components/StarRating";
import { ReviewSection } from "@/components/ReviewSection";
import { LockPropertyModal } from "@/components/LockPropertyModal";
import { ScheduleVisitModal } from "@/components/ScheduleVisitModal";
import dynamic from "next/dynamic";
import {
  Wifi,
  Shirt,
  Droplets,
  AirVent,
  Cctv,
  Thermometer,
  Building2,
  WashingMachine,
  Car,
  Coffee
} from "lucide-react";

// Cloudinary image optimization helper
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

const facilityIcons: Record<string, JSX.Element> = {
  "Wi-Fi": <Wifi className="h-4 w-4" />,
  "Laundry": <Shirt className="h-4 w-4" />,
  "RO Water": <Droplets className="h-4 w-4" />,
  "Security Guard": <ShieldCheck className="h-4 w-4" />,
  "AC": <AirVent className="h-4 w-4" />,
  "CCTV": <Cctv className="h-4 w-4" />,
  "Geyser": <Thermometer className="h-4 w-4" />,
  "Lift": <Building2 className="h-4 w-4" />,
  "Washing Machine": <WashingMachine className="h-4 w-4" />,
  "Parking": <Car className="h-4 w-4" />,
  "Study Lounge": <Coffee className="h-4 w-4" />,
};

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

type PropertyImage = {
  id?: string;
  url: string;
  roomCategory?: string;
  [key: string]: unknown;
};

type Panorama = {
  id: string;
  title: string;
  imageUrl: string;
  [key: string]: unknown;
};

const LOCATION_REGEX = /(Civil Lines|Kamla Nagar|Hudson Lane|Vijay Nagar|North Campus|Satya Niketan)/i;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PropertyClient({ property }: { property: any }) {
  const wishlist = useWishlist();
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const userRole = (user?.publicMetadata?.role as string) ?? null;

  const [showLockModal, setShowLockModal] = useState(false);
  const [showPanorama, setShowPanorama] = useState(false);
  const [activePanorama, setActivePanorama] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState("common");
  const [showScheduleVisitModal, setShowScheduleVisitModal] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("scheduleVisit") === "true") {
      setShowScheduleVisitModal(true);
      // Remove the query parameter so it doesn't reopen on refresh
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);
  // Fix scroll bug: Ensure page scrolls to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Bulletproof filter function: If categorization fails, fallback to ALL images
  const getImagesForCategory = (category: string) => {
    if (!property?.images || !Array.isArray(property.images)) return [];
    
    const filtered = property.images.filter((img: PropertyImage) => 
      img.roomCategory === category || img.roomCategory === "common"
    );
    
    return filtered.length > 0 ? filtered : property.images;
  };

  const roomOptions = useMemo(() => {
    const options = [];
    if (property?.priceSingle) {
      options.push({
        key: "single",
        price: property.priceSingle,
        images: getImagesForCategory("single"),
      });
    }
    if (property?.priceDouble) {
      options.push({
        key: "double",
        price: property.priceDouble,
        images: getImagesForCategory("double"),
      });
    }
    if (property?.priceTriple) {
      options.push({
        key: "triple",
        price: property.priceTriple,
        images: getImagesForCategory("triple"),
      });
    }
    return options;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property]);

  const cheapestRoom = useMemo(() => {
    return roomOptions.length > 0 ? [...roomOptions].sort((a, b) => a.price - b.price)[0] : null;
  }, [roomOptions]);

  useEffect(() => {
    if (selectedRoom === "common" && cheapestRoom) {
      setSelectedRoom(cheapestRoom.key);
    }
  }, [selectedRoom, cheapestRoom]);

  const displayedImages = useMemo(() => {
    if (!property?.images) return [];
    const rawImages = roomOptions.find((r) => r.key === selectedRoom)?.images ?? property.images;
    
    return rawImages.map((img: PropertyImage) => ({
      ...img,
      url: optimizeImageUrl(img.url),
    }));
  }, [property, selectedRoom, roomOptions]);

  const maskedLocation = useMemo(() => {
    if (!property?.location) return "North Campus";
    return property.location.toLowerCase().includes("shared after")
      ? (property.title?.match(LOCATION_REGEX)?.[0] || "North Campus")
      : property.location.split(',')[0];
  }, [property]);

  const saved = wishlist.isSaved(property?.id);
  const nearbyPlaces = property?.nearbyPlaces as NearbyPlacesData | null;
  const hasNearby = nearbyPlaces && (nearbyPlaces.colleges?.length > 0 || nearbyPlaces.metro);

  type LocalPropertyOptional = { rating?: unknown; reviews?: Review[] };
  const propertyOptional = property as LocalPropertyOptional;
  const rawRating = propertyOptional?.rating;
  const rating: RatingData =
    rawRating && typeof rawRating === "object" && "overall" in rawRating
      ? (rawRating as RatingData)
      : { overall: null, cleanliness: null, food: null, security: null, management: null, location: null, count: 0 };
  const reviews: Review[] = propertyOptional?.reviews ?? [];

  const totalBeds = (property?.bedsSingle ?? 0) + (property?.bedsDouble ?? 0) + (property?.bedsTriple ?? 0);
  const availableBeds = Math.max(0, totalBeds - (property?.occupiedBeds ?? 0));

  function handleLockClick() {
    if (!isSignedIn) {
      router.push("/login");
      return;
    }
    setShowLockModal(true);
  }

  const displayedPrice = roomOptions.find((r) => r.key === selectedRoom)?.price ?? property?.price;

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10 lg:px-8">
        <Gallery images={displayedImages} title={property?.propertyCode || "Property View"}/>
        
        {property?.panoramas && property.panoramas.length > 0 && (
           <div className="mt-6 rounded-3xl bg-white p-5 shadow-soft">
             <h3 className="text-xl font-black text-ink">
               🌐 360° Virtual Tour
             </h3>
             <p className="mt-1 text-sm text-muted">
               Explore different areas of this property
             </p>
             <div className="mt-4 flex flex-wrap gap-3">
               {property.panoramas.map((panorama: Panorama) => (
                 <Button
                   key={panorama.id}
                   variant="secondary"
                   onClick={() => {
                     setActivePanorama(optimizeImageUrl(panorama.imageUrl));
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
                <span className="rounded-full bg-linen px-3 py-1 text-xs font-bold text-ink">{property?.roomType}</span>
                {property?.rulesStrictness && (
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${property.rulesStrictness === "Strict" ? "bg-red-50 text-red-700" : "bg-green-50 text-moss"}`}>
                    {property.rulesStrictness} Rules
                  </span>
                )}
                {rating.overall !== null && (
                  <span className="rounded-full bg-amber-50 px-3 py-1">
                    <StarRating value={rating.overall} count={rating.count} size="sm" />
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-3xl font-black text-ink sm:text-5xl">
                {property?.preference === "Any" ? "Boys & Girls PG" : `${property?.preference} PG`} 
                {" "}in{" "} 
                <span className="text-amber-700">{maskedLocation}</span>
              </h1>

              {property?.propertyCode && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Property ID
                  </span>

                  <span className="font-mono text-sm font-black text-amber-900">              
                    {property.propertyCode}
                  </span>

                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(property.propertyCode)}
                    className="rounded-md px-2 py-1 text-xs font-bold text-amber-700 hover:bg-amber-100"
                  >
                    Copy
                  </button>
                </div>
              )}

              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-muted">
                <MapPin className="h-4 w-4" aria-hidden />
                {maskedLocation} (Message/Call Us for exact address)
              </p>
              <p className="mt-4 max-w-3xl text-base leading-8 text-muted">{property?.description}</p>
            </div>

            {/* Room Availability */}
            {totalBeds > 0 && (
              <section>
                <h2 className="text-2xl font-black text-ink">Room Availability</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {(property?.bedsSingle ?? 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedRoom("single")}
                      className={`rounded-2xl p-4 text-left transform transition-all duration-300 ease-out
                      ${
                        selectedRoom === "single"
                          ? "bg-amber-50 ring-2 ring-amber-500 scale-105 -translate-y-1 shadow-2xl"
                          : "bg-white shadow-soft hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <BedDouble className="h-4 w-4 text-muted" />
                        <p className="text-xs font-bold uppercase text-muted">Single Room</p>
                      </div>
                      <p className="text-2xl font-black text-ink">{property.bedsSingle}</p>
                      <p className="text-xs text-muted mt-0.5">total beds</p>
                      {property.priceSingle && (
                        <p className="mt-2 text-sm font-bold text-ink">{formatPrice(property.priceSingle)}/mo</p>
                      )}
                    </button>
                  )}
                  {(property?.bedsDouble ?? 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedRoom("double")}
                      className={`rounded-2xl p-4 text-left transform transition-all duration-300 ease-out
                      ${
                        selectedRoom === "double"
                          ? "bg-amber-50 ring-2 ring-amber-500 scale-105 -translate-y-1 shadow-2xl"
                          : "bg-white shadow-soft hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <BedDouble className="h-4 w-4 text-muted" />
                        <p className="text-xs font-bold uppercase text-muted">Double Sharing</p>
                      </div>
                      <p className="text-2xl font-black text-ink">{property.bedsDouble}</p>
                      <p className="text-xs text-muted mt-0.5">total beds</p>
                      {property.priceDouble && (
                        <p className="mt-2 text-sm font-bold text-ink">{formatPrice(property.priceDouble)}/mo</p>
                      )}
                    </button>
                  )}
                  {(property?.bedsTriple ?? 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedRoom("triple")}
                      className={`rounded-2xl p-4 text-left transform transition-all duration-300 ease-out
                      ${
                        selectedRoom === "triple"
                          ? "bg-amber-50 ring-2 ring-amber-500 scale-105 -translate-y-1 shadow-2xl"
                          : "bg-white shadow-soft hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <BedDouble className="h-4 w-4 text-muted" />
                        <p className="text-xs font-bold uppercase text-muted">Triple Sharing</p>
                      </div>
                      <p className="text-2xl font-black text-ink">{property.bedsTriple}</p>
                      <p className="text-xs text-muted mt-0.5">total beds</p>
                      {property.priceTriple && (
                        <p className="mt-2 text-sm font-bold text-ink">{formatPrice(property.priceTriple)}/mo</p>
                      )}
                    </button>
                  )}
                </div>

                {/* Overall availability bar */}
                <div className="mt-3 rounded-2xl bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-ink">Overall Availability</span>
                    <span className={`text-sm font-black ${availableBeds === 0 ? "text-red-600" : "text-green-700"}`}>
                      {availableBeds === 0 ? "Full" : `${availableBeds} of ${totalBeds} beds available`}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-linen rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${availableBeds === 0 ? "bg-red-400" : "bg-green-500"}`}
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
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${place.type === "girls_college" ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600"}`}>
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
                </div>
              </section>
            )}

            {/* Meals */}
            {property?.mealPlan && property.mealPlan !== "Not Included" && (
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
            {property?.facilities?.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-ink">Facilities</h2>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.facilities.map((facility: string) => (
                    <div 
                      key={facility} 
                      className="flex items-center gap-3 rounded-2xl bg-white p-3 text-xs md:text-sm font-bold text-ink shadow-soft border border-linen/50"
                    >
                      <div className="text-moss">
                        {facilityIcons[facility] || <Check className="h-4 w-4" />}
                      </div>
                      <span className="truncate">{facility}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Rules */}
            {(property?.curfewTime || property?.noticePeriod) && (
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
                      <p className="text-xs font-bold uppercase text-muted">Lock-In Period</p>
                      <p className="mt-1 font-black text-ink">{"11 Months"}</p>
                      <p className="mt-2 text-xs font-semibold text-red-600 leading-relaxed">
                        If you vacate the room within the lock-in period, your security deposit
                        will be forfeited.
                      </p>
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
              propertyId={property?.id}
              rating={rating}
              reviews={reviews}
              userRole={userRole}
            />
          </div>

<aside className="h-fit rounded-3xl bg-white p-6 shadow-soft">
  <p className="text-sm font-bold uppercase text-muted">Starting from</p>
  {property?.propertyCode && (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        Property ID
      </p>
      <div className="mt-1 flex items-center justify-between">
        <span className="font-mono text-lg font-black text-ink">
          {property.propertyCode}
        </span>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(property.propertyCode)}
          className="rounded-md bg-white px-2 py-1 text-xs font-bold shadow hover:bg-slate-100"
        >
          Copy
        </button>
      </div>
    </div>
  )}

  <p
    key={displayedPrice}
    className="mt-2 text-4xl font-black text-ink transition-all duration-300 animate-in fade-in zoom-in-95"
  >
    {formatPrice(displayedPrice)}
    <span className="text-sm font-semibold text-muted">/mo</span>
  </p>

  {rating.overall !== null && (
    <div className="mt-3">
      <StarRating value={rating.overall} count={rating.count} size="md" />
    </div>
  )}

  {totalBeds > 0 && (
    <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${availableBeds === 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${availableBeds === 0 ? "bg-red-500" : "bg-green-500"}`} />
      {availableBeds === 0 ? "No beds available" : `${availableBeds} beds available`}
    </div>
  )}

  <div className="mt-7 pt-4 border-t border-black/10 space-y-3">
    <div className="rounded-2xl bg-amber-50 p-3">
      <p className="text-center text-sm font-bold text-amber-700">
        Message/Call Us For Exact Address
      </p>
    </div>
    <button
      onClick={handleLockClick}
      disabled={totalBeds > 0 && availableBeds === 0}
      className={buttonClasses("primary", undefined, "w-full")}
      style={totalBeds > 0 && availableBeds === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
    >
      {totalBeds > 0 && availableBeds === 0 ? "Property Full" : "Pre-Book Property"}
    </button>
    <Button variant="secondary" className="w-full" onClick={() => wishlist.toggle(property?.id)}>
      <Heart className={saved ? "h-4 w-4 fill-clay text-clay" : "h-4 w-4"} aria-hidden />
      {saved ? "Saved" : "Save property"}
    </Button>
  </div>

  <div className="mt-3 flex grid grid-cols-2 gap-2">
    <a
      href={`https://wa.me/919355405403?text=${encodeURIComponent(
        `Hi, I'm interested in property *${property?.propertyCode ?? ""}* listed on LivingGo. Could you please share more details?`
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white hover:bg-[#1ebe5d] transition-colors"
    >
      <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      Enquire Now
    </a>
    <button
      onClick={() => setShowScheduleVisitModal(true)}
      className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus:outline-none focus:ring-2 focus:ring-ink/20 disabled:cursor-not-allowed disabled:opacity-60 min-h-11 px-5 text-sm bg-ink text-white shadow-soft hover:bg-black w-full"
    >
      Schedule Visit
    </button>
  </div>
</aside>
        </section>
      </main>

      {showLockModal && (
        <LockPropertyModal
          propertyId={property?.id}
          propertyCode={property?.propertyCode}
          monthlyRent={displayedPrice}
          onClose={() => setShowLockModal(false)}
        />
      )}

      {showPanorama && activePanorama && (
        <div className="fixed inset-0 z-[100] bg-black">
          <div className="absolute right-5 top-5 z-50">
            <Button
              variant="secondary"
              onClick={() => setShowPanorama(false)}
            >
              ✕ Close Tour
            </Button>
          </div>

          {property?.panoramas && property.panoramas.length > 1 && (
            <div className="absolute left-5 top-5 z-50 flex gap-2">
              {property.panoramas.map((panorama: Panorama) => (
                <button
                  key={panorama.id}
                  onClick={() => setActivePanorama(optimizeImageUrl(panorama.imageUrl))}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-bold shadow-lg hover:bg-linen"
                >
                  {panorama.title}
                </button>
              ))}
            </div>
          )}

          <PanoramaViewer imageUrl={activePanorama} />
        </div>
      )}

      {showScheduleVisitModal && (
        <ScheduleVisitModal
          propertyId={property?.id ?? ""}
          propertyCode={property?.propertyCode ?? ""}
          onClose={() => setShowScheduleVisitModal(false)}
        />
      )}
    </>
  );
}

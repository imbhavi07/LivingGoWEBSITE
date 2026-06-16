"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { AlertTriangle, Crosshair, Loader2, MapPin, Save } from "lucide-react";
import { Button } from "@/components/Button";
import { ImageUploader } from "@/components/owner/ImageUploader";
import { MapPicker } from "@/components/owner/MapPicker";
import { createOwnerProperty, updateOwnerProperty } from "@/lib/api/owner-properties";
import { ownerPropertySchema } from "@/lib/validation";
import { useToast } from "@/contexts/ToastContext";
import type { OwnerProperty, OwnerPropertyPayload } from "@/types/owner";

const facilities = [
  "Wi-Fi", "Laundry", "Washing Machine", "Housekeeping",
  "Power Backup", "CCTV", "Parking", "Study Lounge", "Gym",
  "RO Water", "Geyser", "AC", "Lift", "Security Guard"
];

const mealTimeOptions = ["Breakfast", "Lunch", "Dinner", "Snacks"];

type OwnerPropertyFormProps = {
  property?: OwnerProperty;
};

type PickedLocation = {
  lat: number;
  lng: number;
  address: string;
};

export function OwnerPropertyForm({ property }: OwnerPropertyFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [preference, setPreference] = useState<"Girls" | "Boys" | "Any">(
    (property?.preference as "Girls" | "Boys" | "Any") ?? "Any"
  );
  const [images, setImages] = useState<string[]>(property?.images ?? []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(property?.facilities ?? []);
  const [selectedMealTimes, setSelectedMealTimes] = useState<string[]>(property?.mealTimes ?? []);
  const [hasSingle, setHasSingle] = useState(!!property?.priceSingle);
  const [hasDouble, setHasDouble] = useState(!!property?.priceDouble);
  const [hasTriple, setHasTriple] = useState(!!property?.priceTriple);
  const [hasDeposit, setHasDeposit] = useState(!!property?.securityDepositMonths);
  const [mealPlan, setMealPlan] = useState<string>(property?.mealPlan ?? "Not Included");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(
    property?.lat && property?.lng
      ? { lat: property.lat, lng: property.lng, address: property.location }
      : null
  );
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  function toggleFacility(facility: string) {
    setSelectedFacilities((current) =>
      current.includes(facility) ? current.filter((item) => item !== facility) : [...current, facility]
    );
  }

  function toggleMealTime(time: string) {
    setSelectedMealTimes((current) =>
      current.includes(time) ? current.filter((item) => item !== time) : [...current, time]
    );
  }

  async function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json() as { display_name?: string };
          const address = data.display_name ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setPickedLocation({ lat: latitude, lng: longitude, address });
        } catch {
          setPickedLocation({ lat: latitude, lng: longitude, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (err) => {
        setIsGettingLocation(false);
        if (err.code === 1) setError("Location permission denied. Please allow location access.");
        else setError("Could not get your location. Try picking on map.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLoaded || !isSignedIn) {
      setError("You must be signed in to save a property.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    if (!pickedLocation) {
      setError("Please pick a location on the map or use your current location.");
      return;
    }

    if (!hasSingle && !hasDouble && !hasTriple) {
      setError("Please select at least one room type (Single, Double, or Triple).");
      return;
    }

    const roomType = hasSingle ? "Single" : "Shared";
    const price = hasSingle
      ? Number(formData.get("priceSingle") ?? 0)
      : hasDouble
        ? Number(formData.get("priceDouble") ?? 0)
        : Number(formData.get("priceTriple") ?? 0);

    const parsed = ownerPropertySchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      price,
      priceSingle: formData.get("priceSingle") || undefined,
      bedsSingle: formData.get("bedsSingle") || undefined,      // ← FIX: was missing
      priceDouble: formData.get("priceDouble") || undefined,
      bedsDouble: formData.get("bedsDouble") || undefined,      // ← FIX: was missing
      priceTriple: formData.get("priceTriple") || undefined,
      bedsTriple: formData.get("bedsTriple") || undefined,      // ← FIX: was missing
      location: pickedLocation.address,
      roomType,
      sharedType: hasDouble ? "Double" : hasTriple ? "Triple" : undefined,
      preference: formData.get("preference"),
      mealPlan: formData.get("mealPlan"),
      mealTimes: selectedMealTimes,
      curfewTime: formData.get("curfewTime"),
      noticePeriod: formData.get("noticePeriod"),
      rulesStrictness: formData.get("rulesStrictness"),
      facilities: selectedFacilities,
      images
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check property details.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: OwnerPropertyPayload = {
      ...parsed.data,
      imageFiles,
      lat: pickedLocation.lat,
      lng: pickedLocation.lng,
    };

    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");

      if (property) {
        await updateOwnerProperty(property.id, payload, token);
        showToast("Property updated and sent for review.", "success");
      } else {
        await createOwnerProperty(payload, token);
        showToast("Property submitted for admin moderation.", "success");
      }
      router.push("/owner/properties");
    } catch {
      setError("Could not save property. Please try again.");
      showToast("Could not save property.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {showMapPicker && (
        <MapPicker
          onConfirm={(loc) => {
            setPickedLocation(loc);
            setShowMapPicker(false);
          }}
          onClose={() => setShowMapPicker(false)}
          initialLat={pickedLocation?.lat}
          initialLng={pickedLocation?.lng}
        />
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">

          {/* Basic Info */}
          <section className="space-y-5 rounded-3xl bg-white p-5 shadow-soft sm:p-6">
            <p className="text-xs font-black uppercase text-clay">Basic Information</p>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-ink">Property title</span>
              <input name="title" defaultValue={property?.title} className="input" placeholder="Aster House PG for Girls" required />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-ink">Description</span>
              <textarea
                name="description"
                defaultValue={property?.description}
                className="input min-h-36 py-4"
                placeholder="Describe rooms, building, rules, meals, commute, and nearby colleges."
                required
              />
            </label>

            <div className="space-y-2">
              <span className="text-sm font-bold text-ink">PG Type</span>
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-linen p-1">
                {(["Girls", "Boys", "Any"] as const).map((type) => (
                  <label
                    key={type}
                    className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${
                      preference === type
                      ? "bg-white shadow-soft text-ink"
                      : "text-muted hover:text-ink"
                    }`}
                  >
                    <input
                      type="radio"
                      name="preference"
                      value={type}
                      checked={preference === type}
                      onChange={() => setPreference(type)}
                      className="sr-only"
                    />
                    <span>
                      {type === "Girls" ? "👩 Girls Only" : type === "Boys" ? "👨 Boys Only" : "👥 Co-ed"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-bold text-ink">Property location</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-linen py-3 text-sm font-bold text-ink transition hover:bg-oat disabled:opacity-60"
                >
                  {isGettingLocation
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Crosshair className="h-4 w-4" aria-hidden />
                  }
                  {isGettingLocation ? "Getting location..." : "Use current location"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-linen py-3 text-sm font-bold text-ink transition hover:bg-oat"
                >
                  <MapPin className="h-4 w-4" aria-hidden />
                  Pick on map
                </button>
              </div>

              {pickedLocation ? (
                <div className="flex items-start gap-2 rounded-2xl bg-green-50 p-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-moss" aria-hidden />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-moss">Location set</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted line-clamp-2">{pickedLocation.address}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPickedLocation(null)}
                    className="text-xs font-bold text-clay hover:underline"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-2xl bg-amber-50 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                  <p className="text-xs leading-5 text-amber-700">
                    Select the current location of your PG.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Pricing */}
          <section className="space-y-5 rounded-3xl bg-white p-5 shadow-soft sm:p-6">
            <p className="text-xs font-black uppercase text-clay">Inventory & Pricing</p>

            <div className="space-y-4 rounded-3xl border border-black/5 bg-linen p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={hasSingle} onChange={(e) => setHasSingle(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-ink accent-ink" />
                <span className="font-bold text-ink">Single Room</span>
              </label>
              {hasSingle && (
                <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-ink">Monthly Rent (₹)</span>
                    <input name="priceSingle" type="number" min={1000} defaultValue={property?.priceSingle} className="input" placeholder="15000" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-ink">Total Beds Available</span>
                    <input name="bedsSingle" type="number" min={1} defaultValue={property?.bedsSingle} className="input" placeholder="4" />
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-3xl border border-black/5 bg-linen p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={hasDouble} onChange={(e) => setHasDouble(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-ink accent-ink" />
                <span className="font-bold text-ink">Double Sharing</span>
              </label>
              {hasDouble && (
                <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-ink">Monthly Rent (₹)</span>
                    <input name="priceDouble" type="number" min={1000} defaultValue={property?.priceDouble} className="input" placeholder="12000" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-ink">Total Beds Available</span>
                    <input name="bedsDouble" type="number" min={1} defaultValue={property?.bedsDouble} className="input" placeholder="4" />
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-3xl border border-black/5 bg-linen p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={hasTriple} onChange={(e) => setHasTriple(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-ink accent-ink" />
                <span className="font-bold text-ink">Triple Sharing</span>
              </label>
              {hasTriple && (
                <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-ink">Monthly Rent (₹)</span>
                    <input name="priceTriple" type="number" min={1000} defaultValue={property?.priceTriple} className="input" placeholder="10000" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-ink">Total Beds Available</span>
                    <input name="bedsTriple" type="number" min={1} defaultValue={property?.bedsTriple} className="input" placeholder="4" />
                  </label>
                </div>
              )}
            </div>
          </section>

          {/* Amenities */}
          <section className="space-y-5 rounded-3xl bg-white p-5 shadow-soft sm:p-6">
            <p className="text-xs font-black uppercase text-clay">Amenities</p>
            <div className="space-y-3">
              {facilities.map((facility) => (
                <label key={facility} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedFacilities.includes(facility)}
                    onChange={() => toggleFacility(facility)}
                    className="h-4 w-4 rounded border-gray-300 text-ink accent-ink"
                  />
                  <span className="text-sm text-ink">{facility}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Meal Plans */}
          <section className="space-y-5 rounded-3xl bg-white p-5 shadow-soft sm:p-6">
            <p className="text-xs font-black uppercase text-clay">Meal Plans</p>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-ink">Meal Plan</span>
              <select
                name="mealPlan"
                defaultValue={mealPlan}
                className="select w-full"
              >
                <option value="Not Included">Not Included</option>
                <option value="Breakfast Only">Breakfast Only</option>
                <option value="Breakfast & Dinner">Breakfast & Dinner</option>
                <option value="Breakfast, Lunch & Dinner">Breakfast, Lunch & Dinner</option>
              </select>
            </label>
            <div className="space-y-2">
              <span className="text-sm font-bold text-ink">Meal Times</span>
              <div className="flex flex-wrap gap-2">
                {mealTimeOptions.map((time) => (
                  <label key={time} className="relative flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2 px-3 text-sm font-bold transition ${
                    selectedMealTimes.includes(time)
                      ? "bg-white shadow-soft text-ink"
                      : "text-muted hover:text-ink"
                  }">
                    <input
                      type="checkbox"
                      checked={selectedMealTimes.includes(time)}
                      onChange={() => toggleMealTime(time)}
                      className="sr-only"
                    />
                    <span>{time}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* House Rules */}
          <section className="space-y-5 rounded-3xl bg-white p-5 shadow-soft sm:p-6">
            <p className="text-xs font-black uppercase text-clay">House Rules</p>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-ink">Curfew Time</span>
              <input
                name="curfewTime"
                type="time"
                defaultValue={property?.curfewTime ?? "20:00"}
                className="input"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-ink">Notice Period</span>
              <select
                name="noticePeriod"
                defaultValue={property?.noticePeriod ?? "1 month"}
                className="select w-full"
              >
                <option value="15 days">15 days</option>
                <option value="1 month">1 month</option>
                <option value="2 months">2 months</option>
                <option value="3 months">3 months</option>
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-ink">Rules Strictness</span>
              <select
                name="rulesStrictness"
                defaultValue={property?.rulesStrictness ?? "Moderate"}
                className="select w-full"
              >
                <option value="Strict">Strict</option>
                <option value="Moderate">Moderate</option>
                <option value="Lenient">Lenient</option>
              </select>
            </label>
          </section>

          {/* Images */}
          <section className="space-y-5 rounded-3xl bg-white p-5 shadow-soft sm:p-6">
            <p className="text-xs font-black uppercase text-clay">Images</p>
            <ImageUploader
              images={images}
              setImages={setImages}
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
            />
          </section>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-items-center justify-center gap-2 rounded-2xl bg-black/90 px-6 py-3 text-sm font-bold text-white hover:bg-black/95 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden />
                  <span>Save Property</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
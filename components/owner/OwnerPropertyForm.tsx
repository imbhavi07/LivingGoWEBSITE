"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { AlertTriangle, Crosshair, Loader2, MapPin, Save, Plus } from "lucide-react";
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
  const [categorizedImages, setCategorizedImages] = useState<Record<string, string[]>>({ Common: property?.images ?? [] });
  const [categorizedFiles, setCategorizedFiles] = useState<Record<string, File[]>>({});
  
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(property?.facilities ?? []);
  const [customFacility, setCustomFacility] = useState(""); 
  
  const [selectedMealTimes, setSelectedMealTimes] = useState<string[]>(property?.mealTimes ?? []);
  const [hasSingle, setHasSingle] = useState(!!property?.priceSingle);
  const [hasDouble, setHasDouble] = useState(!!property?.priceDouble);
  const [hasTriple, setHasTriple] = useState(!!property?.priceTriple);
  const [hasDeposit, setHasDeposit] = useState(!!property?.securityDepositMonths);
  const [mealPlan, setMealPlan] = useState<string>(property?.mealPlan ?? "Not Included");
  const [managerContact, setManagerContact] = useState(property?.managerContact ?? "");
  const [securityContact, setSecurityContact] = useState(property?.securityContact ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // @ts-expect-error - Assuming exactAddress might not be fully typed in OwnerProperty yet
  const [exactAddress, setExactAddress] = useState(property?.exactAddress ?? property?.location ?? "");
  const [locality, setLocality] = useState(property?.location ?? "");

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

  function handleAddCustomFacility() {
    const trimmed = customFacility.trim();
    if (trimmed && !selectedFacilities.includes(trimmed)) {
      setSelectedFacilities([...selectedFacilities, trimmed]);
      setCustomFacility(""); 
    }
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
          setExactAddress(address);
        } catch {
          setPickedLocation({ lat: latitude, lng: longitude, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (err) => {
        setIsGettingLocation(false);
        if (err && typeof err === 'object' && 'code' in err) {
          if (err.code === 1) setError("Location permission denied. Please allow location access.");
          else setError("Could not get your location. Try picking on map.");
        } else {
          setError("Could not get your location. Try picking on map.");
        }
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

    if (!locality.trim() || !exactAddress.trim()) {
      setError("Please provide both the Exact Address and the Locality.");
      return;
    }

    const roomTypeMappings = Object.entries(categorizedFiles).flatMap(
      ([category, files]) =>
        files.map(() => ({
          roomCategory: category.toLowerCase(),
        }))
    );
    
    const allImageUrls = Object.values(categorizedImages).flat();
    const allFiles = Object.values(categorizedFiles).flat();

    const roomType = hasSingle ? "Single" : "Shared";
    const prices = [
      hasSingle ? Number(formData.get("priceSingle")) : undefined,
      hasDouble ? Number(formData.get("priceDouble")) : undefined,
      hasTriple ? Number(formData.get("priceTriple")) : undefined,
    ].filter((value): value is number => value !== undefined && value > 0);

    const price = Math.min(...prices);

    const parsed = ownerPropertySchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        price,
        priceSingle: formData.get("priceSingle") || undefined,
        bedsSingle: formData.get("bedsSingle") || undefined,
        priceDouble: formData.get("priceDouble") || undefined,
        bedsDouble: formData.get("bedsDouble") || undefined,
        priceTriple: formData.get("priceTriple") || undefined,
        bedsTriple: formData.get("bedsTriple") || undefined,
        location: locality, 
        exactAddress: exactAddress, 
        roomType,
        sharedType: hasDouble ? "Double" : hasTriple ? "Triple" : undefined,
        preference: formData.get("preference"),
        mealPlan: formData.get("mealPlan"),
        mealTimes: selectedMealTimes,
        curfewTime: formData.get("curfewTime"),
        noticePeriod: formData.get("noticePeriod"),
        rulesStrictness: formData.get("rulesStrictness"),
        securityDepositMonths: formData.get("securityDepositMonths") || undefined,
        facilities: selectedFacilities,
        images: allImageUrls,
        managerContact: formData.get("managerContact") || undefined,
        securityContact: formData.get("securityContact") || undefined
      });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check property details.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: OwnerPropertyPayload = {
      ...parsed.data,
      imageFiles: allFiles,
      roomTypeMappings,
      lat: pickedLocation.lat,
      lng: pickedLocation.lng,
    };

    try {
      if (property) {
        await updateOwnerProperty(property.id, payload);
        showToast("Property updated and sent for review.", "success");
      } else {
        await createOwnerProperty(payload);
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
            setExactAddress(loc.address);
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

            {/* RESTORED: Manager and Security Contact Fields */}
            <label className="block space-y-2 mt-4">
              <span className="text-sm font-bold text-ink">Manager&apos;s Contact Number <span className="text-xs font-normal text-muted">(Optional)</span></span>
              <input
                name="managerContact"
                type="tel"
                value={managerContact}
                onChange={(e) => setManagerContact(e.target.value)}
                className="input"
                placeholder="+91 9876543210"
              />
            </label>

            <label className="block space-y-2 mt-4">
              <span className="text-sm font-bold text-ink">Security Guard Contact Number <span className="text-xs font-normal text-muted">(Optional)</span></span>
              <input
                name="securityContact"
                type="tel"
                value={securityContact}
                onChange={(e) => setSecurityContact(e.target.value)}
                className="input"
                placeholder="+91 9876543210"
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

            <div className="space-y-2 pt-2">
              <span className="text-sm font-bold text-ink">Map Location (Pin drop)</span>
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
                <div className="flex items-start gap-2 rounded-2xl bg-green-50 p-3 mt-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-moss" aria-hidden />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-moss">Map Coordinates Set</p>
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
                <div className="flex items-start gap-2 rounded-2xl bg-amber-50 p-3 mt-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                  <p className="text-xs leading-5 text-amber-700">
                    Select the map pin of your PG.
                  </p>
                </div>
              )}
            </div>

            <label className="block space-y-2 mt-4">
              <span className="text-sm font-bold text-ink">Exact Address</span>
              <textarea
                name="exactAddress"
                value={exactAddress}
                onChange={(e) => setExactAddress(e.target.value)}
                className="input"
                placeholder="E.g., House 12, Block B, Floor 2, Phase 1..."
                required
              />
            </label>
            
            <label className="block space-y-2 mt-4">
              <span className="text-sm font-bold text-ink">Neighborhood / Locality</span>
              <input
                name="locality"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="input"
                placeholder="E.g., Kamla Nagar"
                required
              />
            </label>

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
                    <input name="priceSingle" type="number" min={1} defaultValue={property?.priceSingle} className="input" placeholder="15000" />
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
                    <input name="priceDouble" type="number" min={1} defaultValue={property?.priceDouble} className="input" placeholder="12000" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-ink">Total Beds Available</span>
                    <input name="bedsDouble" type="number" min={1} defaultValue={property?.bedsDouble} className="input" placeholder="12" />
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
                    <input name="priceTriple" type="number" min={1} defaultValue={property?.priceTriple} className="input" placeholder="9000" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-ink">Total Beds Available</span>
                    <input name="bedsTriple" type="number" min={1} defaultValue={property?.bedsTriple} className="input" placeholder="15" />
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-3xl border border-black/5 bg-linen p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={hasDeposit} onChange={(e) => setHasDeposit(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-ink accent-ink" />
                <span className="font-bold text-ink">Require Security Deposit?</span>
              </label>
              {hasDeposit && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-ink">How many months?</span>
                    <select name="securityDepositMonths" defaultValue={property?.securityDepositMonths ?? "1"} className="input">
                      <option value="0.5">0.5 Months (Half)</option>
                      <option value="1">1 Month</option>
                      <option value="2">2 Months</option>
                    </select>
                  </label>
                </div>
              )}
            </div>
          </section>

          {/* Meals */}
          <section className="space-y-5 rounded-3xl bg-white p-5 shadow-soft sm:p-6">
            <p className="text-xs font-black uppercase text-clay">Meals</p>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-ink">Meal plan</span>
              <select name="mealPlan" value={mealPlan} onChange={(e) => setMealPlan(e.target.value)} className="input">
                <option value="Not Included">Meals Not Included</option>
                <option value="Veg Only">Veg Only</option>
                <option value="Veg + Non-Veg">Veg + Non-Veg</option>
                <option value="Snacks Only">Snacks Only</option>
              </select>
            </label>
            {mealPlan !== "Not Included" && mealPlan !== "Snacks Only" && (
              <div>
                <p className="text-sm font-bold text-ink">Meal times included</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {mealTimeOptions.map((time) => (
                    <label key={time} className="flex cursor-pointer items-center gap-2 rounded-2xl bg-linen px-4 py-2 text-sm font-semibold text-ink">
                      <input type="checkbox" checked={selectedMealTimes.includes(time)} onChange={() => toggleMealTime(time)} className="h-4 w-4 accent-ink" />
                      {time}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Facilities (Includes Custom Additions) */}
          <section className="space-y-5 rounded-3xl bg-white p-5 shadow-soft sm:p-6">
            <p className="text-xs font-black uppercase text-clay">Facilities & Amenities</p>
            
            <div className="grid gap-3 sm:grid-cols-2">
              {facilities.map((facility) => (
                <label key={facility} className="flex cursor-pointer items-center gap-3 rounded-2xl bg-linen p-3 text-sm font-semibold text-ink transition hover:bg-oat">
                  <input type="checkbox" checked={selectedFacilities.includes(facility)} onChange={() => toggleFacility(facility)} className="h-4 w-4 accent-ink" />
                  {facility}
                </label>
              ))}

              {/* Render User-Added Custom Facilities */}
              {selectedFacilities.filter(f => !facilities.includes(f)).map((facility) => (
                <label key={facility} className="flex cursor-pointer items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100">
                  <input type="checkbox" checked onChange={() => toggleFacility(facility)} className="h-4 w-4 accent-amber-700" />
                  {facility}
                </label>
              ))}
            </div>

            {/* Custom Facility Input */}
            <div className="mt-4 pt-4 border-t border-linen">
              <span className="text-sm font-bold text-ink">Have a facility not listed above?</span>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-linen p-1.5 pl-4 focus-within:ring-2 focus-within:ring-ink">
                <input 
                  type="text" 
                  value={customFacility}
                  onChange={(e) => setCustomFacility(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomFacility();
                    }
                  }}
                  placeholder="e.g. PlayStation 5, Pool Table..."
                  className="flex-1 bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-muted"
                />
                <Button type="button" variant="secondary" onClick={handleAddCustomFacility} className="h-9 px-4 py-0 text-xs">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </section>

          {/* Rules */}
          <section className="space-y-5 rounded-3xl bg-white p-5 shadow-soft sm:p-6">
            <p className="text-xs font-black uppercase text-clay">Rules & Policies</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block space-y-2">
                <span className="text-sm font-bold text-ink">Curfew time</span>
                <select name="curfewTime" defaultValue={property?.curfewTime ?? "No Curfew"} className="input">
                  <option value="No Curfew">No Curfew</option>
                  <option value="9 PM">9 PM</option>
                  <option value="10 PM">10 PM</option>
                  <option value="11 PM">11 PM</option>
                  <option value="12 AM">12 AM</option>
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-ink">Lock-In Period</span>
                <select name="noticePeriod" defaultValue={property?.noticePeriod ?? "1 Month"} className="input">
                  <option value="15 Days">6 Months</option>
                  <option value="1 Month">9 Months</option>
                  <option value="2 Months">11 Months</option>
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-ink">House rules</span>
                <select name="rulesStrictness" defaultValue={property?.rulesStrictness ?? "Lenient"} className="input">
                  <option value="Lenient">Lenient</option>
                  <option value="Strict">Strict</option>
                </select>
              </label>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
              <div>
                <p className="text-sm font-black text-amber-800">Privacy & Lead Protection</p>
                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Upload <strong>INTERIOR PHOTOS ONLY</strong>. Exterior building photos will be rejected by our moderation team.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-soft sm:p-6 space-y-5">
            <p className="text-sm font-bold text-ink">Property Images</p>
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-sm font-bold text-ink">Common Areas (Kitchen, Washroom, etc.)</span>
                <ImageUploader
                  images={categorizedImages['Common'] || []}
                  onChange={(imgs) => setCategorizedImages(prev => ({...prev, Common: imgs}))}
                  onFilesChange={(files) => setCategorizedFiles(prev => ({...prev, Common: files}))}
                />
              </div>
              {hasSingle && (
                <div className="space-y-2">
                  <span className="text-sm font-bold text-ink">Single Room Photos</span>
                  <ImageUploader
                    images={categorizedImages['Single'] || []}
                    onChange={(imgs) => setCategorizedImages(prev => ({...prev, Single: imgs}))}
                    onFilesChange={(files) => setCategorizedFiles(prev => ({...prev, Single: files}))}
                  />
                </div>
              )}
              {hasDouble && (
                <div className="space-y-2">
                  <span className="text-sm font-bold text-ink">Double Room Photos</span>
                  <ImageUploader
                    images={categorizedImages['Double'] || []}
                    onChange={(imgs) => setCategorizedImages(prev => ({...prev, Double: imgs}))}
                    onFilesChange={(files) => setCategorizedFiles(prev => ({...prev, Double: files}))}
                  />
                </div>
              )}
              {hasTriple && (
                <div className="space-y-2">
                  <span className="text-sm font-bold text-ink">Triple Room Photos</span>
                  <ImageUploader
                    images={categorizedImages['Triple'] || []}
                    onChange={(imgs) => setCategorizedImages(prev => ({...prev, Triple: imgs}))}
                    onFilesChange={(files) => setCategorizedFiles(prev => ({...prev, Triple: files}))}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-3xl border border-black/10 bg-linen p-4">
              <p className="text-xs font-black uppercase text-clay">Legal Agreement</p>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-ink" />
                <span className="text-sm leading-6 text-ink">
                  I have read and agree to the{" "}
                  <a href="/legal/retainer-agreement" target="_blank" className="font-bold underline hover:text-clay">Exclusive Inventory Agreement</a>,{" "}
                  <a href="/legal/standard-commission-agreement" target="_blank" className="font-bold underline hover:text-clay">Platform Listing Agreement</a>, and{" "}
                  <a href="/legal/privacy-policy" target="_blank" className="font-bold underline hover:text-clay">Privacy Policy</a>.
                </span>
              </label>
            </div>

            {error ? <p className="rounded-2xl bg-linen p-3 text-sm font-semibold text-clay">{error}</p> : null}
            <Button className="w-full" disabled={isSubmitting}>
              <Save className="h-4 w-4" aria-hidden />
              {isSubmitting ? "Saving..." : property ? "Update property" : "Create property"}
            </Button>
          </div>
        </aside>
      </form>
    </>
  );
}
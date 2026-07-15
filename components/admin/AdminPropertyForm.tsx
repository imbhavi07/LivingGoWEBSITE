"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { AlertTriangle, Crosshair, Loader2, MapPin, Save, Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { ImageUploader } from "@/components/owner/ImageUploader";
import { MapPicker } from "@/components/owner/MapPicker";
import { createProperty } from "@/lib/api/admin";
import { ownerPropertySchema } from "@/lib/validation";
import { useToast } from "@/contexts/ToastContext";
import type { OwnerProperty, OwnerPropertyPayload } from "@/types/owner";

const facilities = [
  "Wi-Fi", "Laundry", "Washing Machine", "Housekeeping",
  "Power Backup", "CCTV", "Parking", "Study Lounge", "Gym",
  "RO Water", "Geyser", "AC", "Lift", "Security Guard"
];

const mealTimeOptions = ["Breakfast", "Lunch", "Dinner", "Snacks"];

type AdminPropertyFormProps = {
  property?: OwnerProperty;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
};

export function AdminPropertyForm({ property, onSubmit, onCancel }: AdminPropertyFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [preference, setPreference] = useState<"Girls" | "Boys" | "Any">(
    (property?.preference as "Girls" | "Boys" | "Any") ?? "Any"
  );

  // Unified image state
  const [images, setImages] = useState<string[]>(property?.images ?? []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

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

  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number; address: string } | null>(
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

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
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

    if (!locality.trim() || !exactAddress.trim()) {
      setError("Please provide both the Exact Address and the Locality.");
      return;
    }

    // Validate and parse room type prices and beds
    let priceSingle: number | undefined;
    let bedsSingle: number | undefined;
    let priceDouble: number | undefined;
    let bedsDouble: number | undefined;
    let priceTriple: number | undefined;
    let bedsTriple: number | undefined;

    if (hasSingle) {
      const priceStr = String(formData.get("priceSingle") || "");
      const bedsStr = String(formData.get("bedsSingle") || "");
      const p = parseFloat(priceStr);
      const b = parseInt(bedsStr, 10);
      if (isNaN(p) || p <= 0) {
        setError("Please provide a valid price for Single room.");
        return;
      }
      if (isNaN(b) || b <= 0) {
        setError("Please provide a valid number of beds for Single room.");
        return;
      }
      priceSingle = p;
      bedsSingle = b;
    }
    if (hasDouble) {
      const priceStr = String(formData.get("priceDouble") || "");
      const bedsStr = String(formData.get("bedsDouble") || "");
      const p = parseFloat(priceStr);
      const b = parseInt(bedsStr, 10);
      if (isNaN(p) || p <= 0) {
        setError("Please provide a valid price for Double room.");
        return;
      }
      if (isNaN(b) || b <= 0) {
        setError("Please provide a valid number of beds for Double room.");
        return;
      }
      priceDouble = p;
      bedsDouble = b;
    }
    if (hasTriple) {
      const priceStr = String(formData.get("priceTriple") || "");
      const bedsStr = String(formData.get("bedsTriple") || "");
      const p = parseFloat(priceStr);
      const b = parseInt(bedsStr, 10);
      if (isNaN(p) || p <= 0) {
        setError("Please provide a valid price for Triple room.");
        return;
      }
      if (isNaN(b) || b <= 0) {
        setError("Please provide a valid number of beds for Triple room.");
        return;
      }
      priceTriple = p;
      bedsTriple = b;
    }

    // Ensure at least one room type is selected
    if (!hasSingle && !hasDouble && !hasTriple) {
      setError("Please select at least one room type (Single, Double, or Triple).");
      return;
    }

    const roomType = hasSingle ? "Single" : "Shared";

    const parsed = ownerPropertySchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        price: Math.min(
          ...[priceSingle, priceDouble, priceTriple].filter((p): p is number => p !== undefined)
        ),
        priceSingle,
        bedsSingle,
        priceDouble,
        bedsDouble,
        priceTriple,
        bedsTriple,
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
        images: images,
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
      imageFiles: imageFiles,
      roomTypeMappings: [], // Empty array as required by API
      lat: pickedLocation.lat,
      lng: pickedLocation.lng,
    };

    // Handle manual owner name for SUPER_ADMIN
    const manualOwnerName = formData.get("manualOwnerName") as string | null;
    if (manualOwnerName && manualOwnerName.trim() !== "") {
      // If manual owner name is provided but no owner is linked,
      // the backend should handle setting source: 'LISTED'
      // We'll pass it in the FormData directly
    }

    try {
      // Convert payload to FormData for API call
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("description", payload.description);
      formData.append("price", String(payload.price));
      if (payload.priceSingle !== undefined) formData.append("priceSingle", String(payload.priceSingle));
      if (payload.bedsSingle !== undefined) formData.append("bedsSingle", String(payload.bedsSingle));
      if (payload.priceDouble !== undefined) formData.append("priceDouble", String(payload.priceDouble));
      if (payload.bedsDouble !== undefined) formData.append("bedsDouble", String(payload.bedsDouble));
      if (payload.priceTriple !== undefined) formData.append("priceTriple", String(payload.priceTriple));
      if (payload.bedsTriple !== undefined) formData.append("bedsTriple", String(payload.bedsTriple));
      if (payload.securityDepositMonths !== undefined) formData.append("securityDepositMonths", String(payload.securityDepositMonths));
      formData.append("location", payload.location);
      if (payload.lat !== undefined) formData.append("lat", String(payload.lat));
      if (payload.lng !== undefined) formData.append("lng", String(payload.lng));
      formData.append("roomType", payload.roomType);
      if (payload.sharedType !== undefined) formData.append("sharedType", payload.sharedType);
      formData.append("preference", payload.preference);
      if (payload.mealPlan !== undefined) formData.append("mealPlan", payload.mealPlan);
      formData.append("mealTimes", JSON.stringify(payload.mealTimes ?? []));
      if (payload.curfewTime !== undefined) formData.append("curfewTime", payload.curfewTime);
      if (payload.noticePeriod !== undefined) formData.append("noticePeriod", payload.noticePeriod);
      if (payload.rulesStrictness !== undefined) formData.append("rulesStrictness", payload.rulesStrictness);
      formData.append("facilities", JSON.stringify(payload.facilities));

      // Add image files
      payload.imageFiles?.forEach((file) => {
        formData.append("images", file);
      });

      // Add manual owner name if provided
      if (manualOwnerName && manualOwnerName.trim() !== "") {
        formData.append("manualOwnerName", manualOwnerName.trim());
      }

      await onSubmit(formData);
      showToast("Property saved successfully!", "success");
      onCancel();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      showToast(message, "error");
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

      <form onSubmit={handleFormSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
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
            <label className="block space-y-2 mt-4 pt-4 border-t border-linen">
              <span className="text-sm font-bold text-ink">Manual Owner Name <span className="text-xs font-normal text-muted">(For Admin Use Only)</span></span>
              <input
                name="manualOwnerName"
                type="text"
                className="input"
                placeholder="e.g., Ramesh Kumar"
              />
              <p className="text-xs text-muted">Use this if the property owner is not registered on the platform.</p>
            </label>

            {/* Manager and Security Contact Fields */}
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
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
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
                <div className="gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
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
                <div className="gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
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
                <div className="gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
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
                <span className="font-bold text-ink">Security Deposit</span>
              </label>
              {hasDeposit && (
                <div className="space-y-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-ink">Months of Rent</span>
                    <input name="securityDepositMonths" type="number" min={1} defaultValue={property?.securityDepositMonths} className="input" placeholder="2" />
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-3xl border border-black/5 bg-linen p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <span className="text-sm font-semibold text-ink">Meal Plan</span>
                <select name="mealPlan" defaultValue={mealPlan} className="select w-full">
                  <option value="Not Included">Not Included</option>
                  <option value="Included">Included</option>
                  <option value="Optional">Optional</option>
                </select>
              </label>
              {mealPlan !== "Not Included" && (
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-ink">Meal Times</span>
                  <div className="flex flex-wrap gap-2">
                    {mealTimeOptions.map((time) => (
                      <label key={time} className={`flex items-center gap-2 rounded-xl border border-black/10 bg-linen px-3 py-2 text-sm font-medium ${
                        selectedMealTimes.includes(time) ? "bg-white shadow-soft text-ink" : "text-muted hover:text-ink"
                      }`}>
                        <input
                          type="checkbox"
                          name="mealTime"
                          value={time}
                          checked={selectedMealTimes.includes(time)}
                          onChange={() => toggleMealTime(time)}
                          className="sr-only"
                        />
                        {time}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-3xl border border-black/5 bg-linen p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <span className="text-sm font-semibold text-ink">Curfew Time</span>
                <input name="curfewTime" type="time" defaultValue={property?.curfewTime} className="input" />
              </label>
            </div>

            <div className="space-y-4 rounded-3xl border border-black/5 bg-linen p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <span className="text-sm font-semibold text-ink">Notice Period</span>
                <input name="noticePeriod" type="number" min={0} defaultValue={property?.noticePeriod} className="input" placeholder="30" />
              </label>
            </div>

            <div className="space-y-4 rounded-3xl border border-black/5 bg-linen p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <span className="text-sm font-semibold text-ink">Rules Strictness</span>
                <select name="rulesStrictness" defaultValue={property?.rulesStrictness} className="select w-full">
                  <option value="Strict">Strict</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Lenient">Lenient</option>
                </select>
              </label>
            </div>

          </section>

          {/* Images */}
          <section className="space-y-5 rounded-3xl bg-white p-5 shadow-soft sm:p-6">
            <p className="text-xs font-black uppercase text-clay">Images</p>
            <div className="space-y-4">
              <ImageUploader
                images={images}
                onChange={setImages}
                onFilesChange={setImageFiles}
              />
            </div>
          </section>

          {/* Map Preview */}
          {pickedLocation && (
            <section className="space-y-5 rounded-3xl bg-white p-5 shadow-soft sm:p-6">
              <p className="text-xs font-black uppercase text-clay">Map Preview</p>
              <MapPicker
                mode="preview"
                initialLat={pickedLocation?.lat}
                initialLng={pickedLocation?.lng}
                onConfirm={() => {}}
                onClose={() => {}}
              />
            </section>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full md:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={(e) => {
                e.preventDefault();
                // Trigger form submission via the form's onSubmit handler
                const form = e.currentTarget.closest('form');
                if (form) form.requestSubmit();
              }}
              className="w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Property"}
            </Button>
          </div>

        </div>
      </form>
    </>
  );
}
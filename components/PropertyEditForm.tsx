"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/Button";

const FACILITIES_OPTIONS = [
  "WiFi", "AC", "Geyser", "Laundry", "Parking", "Security", "CCTV",
  "Housekeeping", "Water Purifier", "Power Backup", "Gym", "Common TV",
  "Study Room", "Lift", "Balcony",
];

const MEAL_TIMES_OPTIONS = ["Breakfast", "Lunch", "Dinner"];

export type PropertyEditPayload = {
  title: string;
  description: string;
  price: number;
  priceSingle?: number;
  bedsSingle?: number;
  priceDouble?: number;
  bedsDouble?: number;
  priceTriple?: number;
  securityDepositMonths?: number;
  bedsTriple?: number;
  location: string;
  lat?: number;
  lng?: number;
  roomType: string;
  sharedType?: string;
  preference: string;
  mealPlan?: string;
  mealTimes?: string[];
  curfewTime?: string;
  noticePeriod?: string;
  rulesStrictness?: string;
  managerContact?: string;
  securityContact?: string;
  facilities: string[];
  imageFiles?: File[];
};

type Props = {
  initialData: PropertyEditPayload;
  onSave: (payload: PropertyEditPayload) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
};

export function PropertyEditForm({ initialData, onSave, onCancel, isSaving }: Props) {
  const [form, setForm] = useState<PropertyEditPayload>(initialData);

  // Update form state when initialData changes (e.g., when property data loads)
  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  function set<K extends keyof PropertyEditPayload>(key: K, value: PropertyEditPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleFacility(facility: string) {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  }

  function toggleMealTime(time: string) {
    setForm((prev) => ({
      ...prev,
      mealTimes: (prev.mealTimes ?? []).includes(time)
        ? (prev.mealTimes ?? []).filter((t) => t !== time)
        : [...(prev.mealTimes ?? []), time],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(form);
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      {/* Basic Info */}
      <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
        <h2 className="mb-4 text-lg font-black text-ink">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-bold text-ink">Title</label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full rounded-2xl border border-clay/20 bg-linen px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-bold text-ink">Description</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-clay/20 bg-linen px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
              required
            />
          </div>
          <div>
            <label htmlFor="location" className="mb-1 block text-sm font-bold text-ink">Location</label>
            <input
              id="location"
              type="text"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              className="w-full rounded-2xl border border-clay/20 bg-linen px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
              required
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
        <h2 className="mb-4 text-lg font-black text-ink">Pricing</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="priceSingle" className="mb-1 block text-sm font-bold text-ink">Single Room (₹/mo)</label>
            <input
              id="priceSingle"
              type="number"
              value={form.priceSingle ?? ""}
              onChange={(e) => set("priceSingle", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-2xl border border-clay/20 bg-linen px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <div>
            <label htmlFor="bedsSingle" className="mb-1 block text-sm font-bold text-ink">Single Room — Total Beds</label>
            <input
              id="bedsSingle"
              type="number"
              min={0}
              value={form.bedsSingle ?? ""}
              onChange={(e) => set("bedsSingle", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g. 15"
              className="w-full rounded-2xl border border-clay/20 bg-linen px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <div>
            <label htmlFor="priceDouble" className="mb-1 block text-sm font-bold text-ink">Double Sharing (₹/mo)</label>
            <input
              id="priceDouble"
              type="number"
              value={form.priceDouble ?? ""}
              onChange={(e) => set("priceDouble", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-2xl border border-clay/20 bg-linen px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <div>
            <label htmlFor="bedsDouble" className="mb-1 block text-sm font-bold text-ink">Double Sharing — Total Beds</label>
            <input
              id="bedsDouble"
              type="number"
              min={0}
              value={form.bedsDouble ?? ""}
              onChange={(e) => set("bedsDouble", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g. 15"
              className="w-full rounded-2xl border border-clay/20 bg-linen px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <div>
            <label htmlFor="priceTriple" className="mb-1 block text-sm font-bold text-ink">Triple Sharing (₹/mo)</label>
            <input
              id="priceTriple"
              type="number"
              value={form.priceTriple ?? ""}
              onChange={(e) => set("priceTriple", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-2xl border border-clay/20 bg-linen px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <div>
            <label htmlFor="bedsTriple" className="mb-1 block text-sm font-bold text-ink">Triple Sharing — Total Beds</label>
            <input
              id="bedsTriple"
              type="number"
              min={0}
              value={form.bedsTriple ?? ""}
              onChange={(e) => set("bedsTriple", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g. 15"
              className="w-full rounded-2xl border border-clay/20 bg-linen px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
        </div>
      </div>

      
      {/* Room Details */}
      <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
        <h2 className="mb-4 text-lg font-black text-ink">Room Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="roomType" className="mb-1 block text-sm font-bold text-ink">Room Type</label>
            <select
              id="roomType"
              value={form.roomType}
              onChange={(e) => set("roomType", e.target.value)}
              className="w-full rounded-2xl border border-clay/20 bg-linen px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            >
              <option value="PG">PG</option>
              <option value="Flat">Flat</option>
              <option value="Hostel">Hostel</option>
            </select>
          </div>
          <div>
            <label htmlFor="preference" className="mb-1 block text-sm font-bold text-ink">Preference</label>
            <select
              id="preference"
              value={form.preference}
              onChange={(e) => set("preference", e.target.value)}
              className="w-full rounded-2xl border border-clay/20 bg-linen px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            >
              <option value="Any">Boys & Girls</option>
              <option value="Boys">Boys Only</option>
              <option value="Girls">Girls Only</option>
            </select>
          </div>
          <div>
            <label htmlFor="rulesStrictness" className="mb-1 block text-sm font-bold text-ink">Rules Strictness</label>
            <select
              id="rulesStrictness"
              value={form.rulesStrictness ?? ""}
              onChange={(e) => set("rulesStrictness", e.target.value || undefined)}
              className="w-full rounded-2xl border border-clay/20 bg-linen px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            >
              <option value="">Not specified</option>
              <option value="Flexible">Flexible</option>
              <option value="Moderate">Moderate</option>
              <option value="Strict">Strict</option>
            </select>
          </div>
          <div>
            <label htmlFor="curfewTime" className="mb-1 block text-sm font-bold text-ink">Curfew Time</label>
            <input
              id="curfewTime"
              type="text"
              value={form.curfewTime ?? ""}
              onChange={(e) => set("curfewTime", e.target.value || undefined)}
              placeholder="e.g. 10:00 PM"
              className="w-full rounded-2xl border border-clay/20 bg-linen px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <div>
            <label htmlFor="noticePeriod" className="mb-1 block text-sm font-bold text-ink">Lock-In Period</label>
            <select
              id="noticePeriod"
              value={form.noticePeriod ?? ""}
              onChange={(e) => set("noticePeriod", e.target.value || undefined)}
              className="w-full rounded-2xl border border-clay/20 bg-linen px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            >
              <option value="">Not specified</option>
              <option value="15 days">15 days</option>
              <option value="1 month">1 month</option>
              <option value="2 months">2 months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
        <h2 className="mb-4 text-lg font-black text-ink">Meals</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="mealPlan" className="mb-1 block text-sm font-bold text-ink">Meal Plan</label>
            <select
              id="mealPlan"
              value={form.mealPlan ?? ""}
              onChange={(e) => set("mealPlan", e.target.value || undefined)}
              className="w-full rounded-2xl border border-clay/20 bg-linen px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            >
              <option value="">Not specified</option>
              <option value="Not Included">Not Included</option>
              <option value="Included">Included</option>
              <option value="Optional">Optional</option>
            </select>
          </div>
          {form.mealPlan && form.mealPlan !== "Not Included" && (
            <div>
              <label className="mb-2 block text-sm font-bold text-ink">Meal Times</label>
              <div className="flex flex-wrap gap-2">
                {MEAL_TIMES_OPTIONS.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => toggleMealTime(time)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                      (form.mealTimes ?? []).includes(time)
                        ? "bg-ink text-white"
                        : "bg-linen text-ink hover:bg-clay/20"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Facilities */}
      <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
        <h2 className="mb-4 text-lg font-black text-ink">Facilities</h2>
        <div className="flex flex-wrap gap-2">
          {FACILITIES_OPTIONS.map((facility) => (
            <button
              key={facility}
              type="button"
              onClick={() => toggleFacility(facility)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                form.facilities.includes(facility)
                  ? "bg-ink text-white"
                  : "bg-linen text-ink hover:bg-clay/20"
              }`}
            >
              {form.facilities.includes(facility) && (
                <X className="mr-1 inline h-3 w-3" aria-hidden />
              )}
              {facility}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSaving} className="flex-1">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
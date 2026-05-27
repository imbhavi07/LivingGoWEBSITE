"use client";

import type { ChangeEvent } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { PropertyFilters } from "@/types/property";

type FilterBarProps = {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
};

export function FilterBar({ filters, onChange }: FilterBarProps) {
  function update(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    onChange({ ...filters, [event.target.name]: event.target.value });
  }

  return (
    <section className="rounded-3xl bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filters
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase text-muted">Budget</span>
          <select name="budget" value={filters.budget ?? ""} onChange={update} className="input">
            <option value="">Any budget</option>
            <option value="10000">Under ₹10,000</option>
            <option value="15000">Under ₹15,000</option>
            <option value="20000">Under ₹20,000</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase text-muted">Location</span>
          <input
            name="location"
            value={filters.location ?? ""}
            onChange={update}
            placeholder="Search city or area"
            className="input"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase text-muted">Room</span>
          <select name="roomType" value={filters.roomType ?? ""} onChange={update} className="input">
            <option value="">Any room</option>
            <option value="Single">Single</option>
            <option value="Shared">Shared</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase text-muted">Preference</span>
          <select name="preference" value={filters.preference ?? ""} onChange={update} className="input">
            <option value="">Any preference</option>
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
            <option value="Any">Any</option>
          </select>
        </label>
      </div>
    </section>
  );
}

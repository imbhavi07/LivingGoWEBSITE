"use client";

import type { ChangeEvent } from "react";
import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    // Create a new URLSearchParams object based on the current URL
    const params = new URLSearchParams(searchParams.toString());
    
    if (event.target.value) {
      params.set(event.target.name, event.target.value);
    } else {
      params.delete(event.target.name); // Clean up empty filters
    }
    
    // Update the URL without reloading the page, preserving scroll state
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <section className="rounded-3xl bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
        <div className="mb-5">
  <label className="space-y-2 block">
    <span className="text-xs font-semibold uppercase text-muted">
      Search
    </span>

    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

      <input
        type="text"
        name="location"
        defaultValue={searchParams.get("location") ?? ""}
        onChange={update}
        placeholder="Search by Property ID, Property Name or Locality..."
        className="input w-full pl-10"
      />
    </div>
  </label>
</div>
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filters
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase text-muted">Budget</span>
          <select name="budget" defaultValue={searchParams.get("budget") ?? ""} onChange={update} className="input">
            <option value="">Any budget</option>
            <option value="10000">Under ₹10,000</option>
            <option value="15000">Under ₹15,000</option>
            <option value="20000">Under ₹20,000</option>
            <option value="25000">Under ₹25,000</option>
            <option value="30000">Under ₹30,000</option>
            <option value="35000">Under ₹35,000</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase text-muted">Room</span>
          <select name="roomType" defaultValue={searchParams.get("roomType") ?? ""} onChange={update} className="input">
            <option value="">Any room</option>
            <option value="Single">Single</option>
            <option value="Shared">Shared</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase text-muted">Preference</span>
          <select name="preference" defaultValue={searchParams.get("preference") ?? ""} onChange={update} className="input">
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
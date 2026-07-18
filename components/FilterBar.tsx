"use client";

import type { ChangeEvent, PointerEvent } from "react";
import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [budgetValue, setBudgetValue] = useState(searchParams.get("budget") ?? "45000");

  function update(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    
    // If there is a value, set it. If it's an empty string (our neutral options), delete it from the URL.
    if (event.target.value) {
      params.set(event.target.name, event.target.value);
    } else {
      params.delete(event.target.name);
    }
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handlePointerUp(event: PointerEvent<HTMLInputElement>) {
    update({ target: event.currentTarget } as ChangeEvent<HTMLInputElement>);
  }

  return (
    <section className="rounded-3xl bg-white p-4 shadow-soft">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-3 flex flex-col w-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted">Max Budget</span>
            <span className="text-sm font-bold text-ink">
              {Number(budgetValue) >= 45000 
                ? "Any Budget" 
                : `Under ₹${Number(budgetValue).toLocaleString()}/mo`}
            </span>
          </div>
          
          <input
            type="range"
            name="budget"
            min="5000"
            max="45000"
            step="1000"
            value={budgetValue}
            onChange={(e) => setBudgetValue(e.target.value)}
            onPointerUp={handlePointerUp} 
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ink"
          />
          
          <div className="flex justify-between text-[10px] font-bold text-muted uppercase">
            <span>₹5,000</span>
            <span>₹45,000+</span>
          </div>
        </label>
        
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase text-muted">Room</span>
          <select name="roomType" defaultValue={searchParams.get("roomType") ?? ""} onChange={update} className="input">
            {/* ✅ FIXED: Added neutral empty options */}
            <option value="">Any Room Type</option>
            <option value="Single">Single</option>
            <option value="Shared">Shared</option>
          </select>
        </label>
        
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase text-muted">Gender Preference</span>
          <select name="preference" defaultValue={searchParams.get("preference") ?? ""} onChange={update} className="input">
            <option value="">Any Gender</option>
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
            <option value="Any">Co-ed</option>
          </select>
        </label>
        
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase text-muted">Area</span>
          <select name="location" defaultValue={searchParams.get("location") ?? ""} onChange={update} className="input">
            <option value="">Any Area</option>
            <option value="Kamla Nagar">Kamla Nagar</option>
            <option value="Vijay Nagar">Vijay Nagar</option>
            <option value="Shakti Nagar">Shakti Nagar</option>
            <option value="Malka Ganj">Malka Ganj</option>
            <option value="Roop Nagar">Roop Nagar</option>
            <option value="GTB Nagar">GTB Nagar</option>
          </select>
        </label>
      </div>
    </section>
  );
}
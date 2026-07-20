"use client";

import type { ChangeEvent, PointerEvent } from "react";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [budgetValue, setBudgetValue] = useState(searchParams.get("budget") ?? "45000");

  function update(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    
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
    <section className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-brand-dark/5">
      {/* 🔴 FIXED: Converted layout into a uniform stacked flex column list for perfect vertical symmetry */}
      <div className="flex flex-col gap-5">
        
        {/* Max Budget Slider Container */}
        <label className="flex flex-col w-full gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-dark/40">
              Max Budget
            </span>
            <span className="text-sm font-black text-brand-dark">
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
            className="w-full h-2 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-brand-dark"
          />
          
          <div className="flex justify-between text-[10px] font-bold text-brand-dark/40 uppercase tracking-wide">
            <span>₹5,000</span>
            <span>₹45,000+</span>
          </div>
        </label>
        
        {/* Room Type Selector Block */}
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-brand-dark/40">Room</span>
          <select 
            name="roomType" 
            defaultValue={searchParams.get("roomType") ?? ""} 
            onChange={update} 
            className="w-full bg-[#FAF8F5] text-brand-dark font-bold text-sm rounded-2xl px-4 py-3.5 border border-brand-dark/5 outline-none focus:border-brand-green/30 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233a3a3a' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1.25rem',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <option value="">Any Room Type</option>
            <option value="Single">Single</option>
            <option value="Shared">Shared</option>
          </select>
        </label>
        
        {/* Gender Preference Selector Block */}
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-brand-dark/40">Gender Preference</span>
          <select 
            name="preference" 
            defaultValue={searchParams.get("preference") ?? ""} 
            onChange={update} 
            className="w-full bg-[#FAF8F5] text-brand-dark font-bold text-sm rounded-2xl px-4 py-3.5 border border-brand-dark/5 outline-none focus:border-brand-green/30 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233a3a3a' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1.25rem',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <option value="">Any Gender</option>
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
            <option value="Any">Co-ed</option>
          </select>
        </label>
        
        {/* Area Location Selector Block */}
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-brand-dark/40">Area</span>
          <select 
            name="location" 
            defaultValue={searchParams.get("location") ?? ""} 
            onChange={update} 
            className="w-full bg-[#FAF8F5] text-brand-dark font-bold text-sm rounded-2xl px-4 py-3.5 border border-brand-dark/5 outline-none focus:border-brand-green/30 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233a3a3a' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1.25rem',
              backgroundRepeat: 'no-repeat'
            }}
          >
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
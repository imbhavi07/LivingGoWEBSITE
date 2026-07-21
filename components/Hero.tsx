"use client";

import Image from "next/image";
import { Search, MapPin } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative px-4 py-2 sm:py-4 bg-[#f9e7d3] overflow-hidden" aria-label="Hero">
      <div className="mx-auto max-w-7xl">
        
        {/* Compressed Grid Container: Removed min-height to snap elements closer together */}
        <div className="flex flex-row items-center justify-between relative overflow-hidden">
          
          {/* Left Content Column */}
          <div className="w-[60%] flex flex-col pr-2 min-w-0 z-10">
            
            {/* Bold headline scaling with tight tracking */}
            <h1 className="text-5xl sm:text-5xl lg:text-6xl font-black text-brand-dark font-display leading-[1.05] tracking-tight">
              Find Your
              <br />
              Home far
              <br />
              From <span className="text-brand-green">Home.</span>
            </h1>

            {/* Subtext Accent Bar - tightened margins */}
            <div className="inline-block bg-brand-greenMuted text-white italic px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium mt-[15px] mb-1 shadow-sm w-fit leading-normal">
              Verified PGs. Zero Brokerage. Hassle Free.
            </div>
            
          </div>

          {/* Right Content Column: Mascot Illustration - tightened positioning */}
          <div className="block w-[40%] md:w-[35%] flex-shrink-0 flex justify-end items-center self-center">
            <div className="w-full flex justify-end">
              <Image
                src="/assets/mascots/coffee.png"
                alt="LivingGo mascot holding coffee - Find verified student PGs in Delhi"
                className="w-full max-w-[220px] sm:max-w-[280px] md:max-w-[320px] h-auto object-contain drop-shadow-[0_8_24_rgba(62,39,35,0.1)]"
                priority={true}
                width={280}
                height={280}
              />
            </div>
          </div>
        </div>

        {/* RE-SIZED HORIZONTAL ROW: Scaled down elements to guarantee single-line fit */}
        <div className="mt-[15px] flex flex-row flex-wrap sm:flex-nowrap items-center justify-start gap-1.5 sm:gap-2 w-full overflow-x-auto scrollbar-none py-0.5">
          {/* Badge 1: 100+ Verified PGs */}
          <div className="bg-white rounded-lg px-2.5 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-brand-dark/5 flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-brand-dark/80 shrink-0">
            <MapPin className="h-3.5 w-3.5 text-brand-green shrink-0" aria-hidden="true" />
            <span>100+ Verified PGs</span>
          </div>
          
          {/* Badge 2: Govt. Approved */}
          <div className="bg-white rounded-lg px-2.5 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-brand-dark/5 flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-brand-dark/80 shrink-0">
            <svg className="h-3.5 w-3.5 text-brand-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Govt. Approved</span>
          </div>

          {/* Badge 3: Zero Brokerage */}
          <div className="bg-white rounded-lg px-2.5 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-brand-dark/5 flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-brand-dark/80 shrink-0">
            <svg className="h-3.5 w-3.5 text-brand-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Zero Brokerage</span>
          </div>
        </div>

        {/* Unified Search Input Engine - Pulled closer to the badges */}
        <div className="mt-[15px] w-full block">
          <div className="relative rounded-xl bg-white shadow-[0_6px_20px_rgba(0,0,0,0.04)] border border-brand-dark/10 overflow-hidden max-w-2xl mx-auto flex items-center">
            
            {/* Context Pin Icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 rounded-lg bg-brand-green/10 text-brand-green shrink-0">
              <MapPin className="h-4.5 w-4.5" aria-hidden="true" />
            </div>

            {/* Input Target */}
            <Link href="/listings" className="w-full">
            <input
              type="text"
              placeholder="Kamla Nagar"
              className="w-full pl-16 pr-14 py-3.5 text-brand-dark placeholder-brand-dark/50 text-base font-bold bg-transparent outline-none cursor-pointer"
              aria-label="Search area"
              readOnly
            />
            </Link>

            {/* Compact Control Button */}
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-brand-green p-2 text-white shadow-sm hover:bg-brand-green/95 transition-all duration-200 flex items-center justify-center h-9 w-9 shrink-0"
              type="button"
              aria-label="Submit search query"
            >
              <Search className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
            
          </div>
        </div>
        
      </div>
    </section>
  );
}
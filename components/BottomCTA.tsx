"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BottomCTA() {
  return (
    // 🔴 FIXED: Removed the negative margins. Restored natural, breathable padding to push it safely below the TrustGrid.
    <section className="relative px-4 pt-8 md:pt-12 pb-16 bg-brand-bg" aria-label="Call to Action">
      
      {/* 🔴 FIXED: Expanded the max-width slightly so it doesn't look like a tiny pill on large desktop monitors */}
      <div className="mx-auto max-w-5xl lg:max-w-6xl">
        
        {/* Soft Green Container - Restored deep internal padding (p-14/p-16) so the text doesn't touch the ceiling */}
        <div className="flex items-center justify-between bg-[#E9EFE2] rounded-[2rem] p-8 sm:p-10 md:p-14 lg:p-16 relative overflow-hidden min-h-[220px] md:min-h-[320px]">
          
          {/* CTA Content - Left Side */}
          <div className="flex flex-col gap-3 sm:gap-4 max-w-[55%] md:max-w-[60%] relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-brand-dark font-display leading-[1.1] tracking-tight">
              Ready to find your cozy PG?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-brand-dark/70 leading-relaxed font-semibold max-w-md">
              Join thousands of students who found their perfect home away from home with LivingGo.
            </p>

            {/* Premium CTA Button */}
            <div className="mt-2 md:mt-4 w-fit">
              <Link
                href="/listings"
                className="group flex items-center justify-center gap-2 rounded-xl bg-brand-green px-5 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-black text-white shadow-[0_4px_14px_0_rgba(120,178,100,0.39)] hover:bg-brand-green/90 hover:shadow-[0_6px_20px_rgba(120,178,100,0.23)] hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
              >
                <span>Start Exploring</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* 
            🔴 FIXED MASCOT CLIPPING: 
            Instead of hardcoded pixels (which caused the head to get chopped off), 
            it now uses `h-[95%] md:h-[100%]`. This mathematically forces the image to stop growing the second it hits the ceiling. 
          */}
          <div className="absolute right-[-5%] sm:right-0 md:right-8 bottom-0 h-[95%] md:h-[100%] w-[55%] sm:w-[45%] md:w-[40%] max-w-[420px] z-10 pointer-events-none flex items-end justify-end">
            <img 
              src="/assets/mascots/hello.png" 
              alt="LivingGo Mascot" 
              className="w-full h-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)]" 
            />
          </div>
          
        </div>
      </div>
    </section>
  );
}
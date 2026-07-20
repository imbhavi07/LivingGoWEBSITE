"use client";

import Image from "next/image";
import {
  ShieldCheck,
  Users,
  MousePointer2,
  LayoutDashboard,
  Headphones,
  Lock,
} from "lucide-react";

interface TrustFeature {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const features: TrustFeature[] = [
  {
    title: "Zero Brokerage",
    description: "No hidden fees, ever",
    icon: ShieldCheck,
  },
  {
    title: "Verified PG Owners",
    description: "Government verified listings",
    icon: Users,
  },
  {
    title: "360° Virtual Tours",
    description: "Explore from anywhere",
    icon: MousePointer2,
  },
  {
    title: "Student Dashboard",
    description: "Manage bookings & visits",
    icon: LayoutDashboard,
  },
  {
    title: "24x7 Support",
    description: "Always here to help",
    icon: Headphones,
  },
  {
    title: "Security Deposit",
    description: "Protected & refundable",
    icon: Lock,
  },
];

export function TrustGrid() {
  return (
    <section className="relative w-full md:mt-[-40px] mt-[-35px] overflow-hidden bg-[#f9e7d3] py-12 sm:py-16" aria-label="Why Choose LivingGo">
      <div className="mx-auto max-w-5xl px-4 relative">
        
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark font-display tracking-tight">
            WHY? <span className="font-medium text-brand-dark/60">Choose</span> LivingGo.
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-brand-dark/60 max-w-2xl mx-auto font-medium">
            Everything you need for hassle-free student living, wrapped with warmth.
          </p>
        </div>

        {/* 
          FIXED: Forced 2-column grid for ALL devices. 
          Removed 'md:grid-cols-2' so mobile inherits the exact same layout.
        */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 relative z-10 w-full md:w-[85%] mx-auto">
          {features.map((feature, index) => {
            
            // Removed 'md:' prefix so the layout holds true on mobile screens
            let gridPosition = "";
            if (index === 0) gridPosition = "col-start-1 row-start-1"; // Card 1
            if (index === 1) gridPosition = "col-start-2 row-start-1"; // Card 2
            if (index === 2) gridPosition = "col-start-1 row-start-2"; // Card 3
            if (index === 3) gridPosition = "col-start-2 row-start-2"; // Card 4
            if (index === 4) gridPosition = "col-start-2 row-start-3"; // Card 5
            if (index === 5) gridPosition = "col-start-2 row-start-4"; // Card 6

            return (
              <div
                key={index}
                // Scaled down mobile paddings (p-4) and border radii to prevent clipping
                className={`group relative p-4 sm:p-6 rounded-[1rem] sm:rounded-[1.25rem] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-brand-dark/5 hover:shadow-xl hover:-translate-y-1 hover:border-brand-green/20 transition-all duration-300 flex flex-col justify-center ${gridPosition}`}
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green mb-3 sm:mb-4 group-hover:bg-brand-green group-hover:text-white transition-colors duration-300 shrink-0">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                </div>
                {/* Scaled down mobile typography so it fits in a 2-column phone view */}
                <h3 className="font-black text-brand-dark text-[13px] sm:text-lg mb-1 sm:mb-1.5 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-[11px] sm:text-sm text-brand-dark/50 leading-snug font-medium">
                  {feature.description}
                </p>
              </div>
            );
          })}

          {/* 
            MASCOT CONTAINER:
            Maintains the row-span-2 integration on mobile.
          */}
          <div className="relative w-full h-full min-h-[160px] sm:min-h-[260px] col-start-1 row-start-3 row-span-2 flex items-end justify-center md:justify-end overflow-hidden pointer-events-none mt-2 sm:mt-0">
            <Image
              src="/assets/mascots/pointing.png"
              alt="LivingGo Mascot Pointing"
              fill
              className="object-contain object-bottom md:object-right-bottom drop-shadow-[0_15px_35px_rgba(62,39,35,0.15)]"
              priority={false}
              sizes="(max-width: 768px) 50vw, 50vw"
            />
          </div>
          
        </div>
      </div>
    </section>
  );
}
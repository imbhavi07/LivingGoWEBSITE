"use client";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { buttonClasses } from "@/components/Button";
import { FeaturedPropertyCard } from "@/components/FeaturedPropertyCard";
import { useWishlist } from "@/hooks/useWishlist";
import type { Property } from "@/types/property";
import { LiquidGlass } from "@/components/LiquidGlass";
import { useState, useEffect } from "react";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { FeaturesSection } from "@/components/FeaturesSection";
import { toProperty } from "@/lib/api/types";
// THE FIX: Imported useAnimation hook
import { motion, Variants, useAnimation } from "framer-motion";
import { EB_Garamond } from "next/font/google";

const EBGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb_garamond',
  display: 'swap',
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delay: 0.1, delayChildren: 0.3 } }
};

const slideUp: Variants = {
  hidden: { y: 60, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 60, damping: 8 } }
};

export default function HomePage() {
  // THE FIX: Replacing useState with Framer Motion's direct animation controller
  const controls = useAnimation();

  useEffect(() => {
    // Function to physically force the animation to play
    const fireAnimation = () => {
      controls.start("visible");
    };

    // Listen for the intro to finish
    window.addEventListener("introAnimationComplete", fireAnimation);
    
    // If they already skipped it in a previous session, fire it instantly
    if (sessionStorage.getItem("intro_skipped") === "true") {
      fireAnimation();
    }

    return () => {
      window.removeEventListener("introAnimationComplete", fireAnimation);
    };
  }, [controls]);

  return (
    <main className="bg-[#f9e7d3] min-h-screen flex flex-col">
      <section className="relative w-full">
        <div 
          className="absolute inset-0 z-0 pointer-events-none
                    bg-gradient-to-b from-[#7f5534] via-[#7f5534]/80 to-transparent to-[30%]
                    md:inset-y-0 md:left-0 md:right-auto md:w-full md:h-full
                    md:bg-gradient-to-b md:from-[#7f5534] md:via-[#7f5534]/70 md:to-transparent md:to-[45%]"   
        />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          // THE FIX: Attached the direct controls hook here
          animate={controls}
          className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-8 sm:px-6 md:grid-cols-[1fr_1.08fr] md:items-center md:pt-16 lg:px-8"
        >
          {/* Animated Text/Hero Group */}
          <motion.div variants={slideUp}>
            <LiquidGlass className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white shadow-soft">
              <p className="flex items-center gap-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
                  Verified Student Homes
              </p>
            </LiquidGlass>
            <Image
              src={logo}
              alt="LivingGo Logo"
              width={992}
              height={597}
              className="ml-[-50px] md:ml-[15px] mt-[-40px] md:mt-5 h-auto w-auto scale-75 md:scale-100 drop-shadow-[0_4px_3px_rgba(0,0,0,0.3)]"
            />
            <p className="mt-[-30px] md:mt-5 max-w-xl md:text-xl text-2xl leading-7 md:leading-8 text-ink drop-shadow-xl" style={EBGaramond.style}>
              Find a calm, well-managed PG/flat near campus with transparent pricing, real facilities, and virtual tours before you visit.
            </p>
            <a
              href="tel:+919068902886"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xl font-bold text-white shadow-lift transition hover:opacity-90 w-fit"
            >
              Call Us
            </a>

            <div className="hidden mt-6 gap-3 sm:flex sm:flex-row">
              <Link href="/listings" className={buttonClasses("primary", undefined, "w-full sm:w-auto")}>
                Find PGs <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </motion.div>

          {/* Animated Featured Card */}
          <motion.div variants={slideUp} className="mt-[-50px] md:mt-[1px] relative mx-auto w-full max-w-[510px]">
            <Image
              src="/assets/ui-panel.png"
              alt="Featured Property Panel"
              width={510}
              height={650}
              className="block h-auto w-full drop-shadow-[0_8px_6px_rgba(0,0,0,0.3)]"
            />
            <div className="absolute inset-0 px-[10%] pb-[5%] pt-[28%] sm:pt-[30%] flex flex-col items-center">
              <div className="mb-3 flex items-center gap-2 font-bold text-ink -translate-x-[10px] text-[15.5px]">
                <ShieldCheck className="h-4 w-4 text-ink" aria-hidden />
                Featured this week
              </div>
              <div className="w-[85%] max-w-[280px] mx-auto mt-2">
                 <PropertyPreview />
              </div>
            </div>
          </motion.div>
          <div className="md:hidden mt-6 gap-3 sm:flex sm:flex-row">
              <Link href="/listings" className={buttonClasses("primary", undefined, "w-full sm:w-auto")}>
                Find PGs <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
        </motion.div>
        <FeaturesSection />
      </section>
    </main>
  );
}

function PropertyPreview() {
  const wishlist = useWishlist();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/properties/featured`, {
          cache: "no-store" 
        });
        
        if (res.ok) {
          const rawData = await res.json();
          const transformedProperty = toProperty(rawData);
          setProperty(transformedProperty);
        }
      } catch (error) {
        console.error("Failed to fetch featured property:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  if (isLoading) return <div className="h-[280px] w-full animate-pulse rounded-xl bg-gray-200/50"></div>;
  if (!property) return null;

  return (
    <div className="[&>article]:drop-shadow-xl">
      <FeaturedPropertyCard property={property} saved={wishlist.isSaved(property.id)} onSave={wishlist.toggle} />
    </div>
  );
}
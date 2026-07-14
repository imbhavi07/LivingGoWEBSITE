"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Search, Phone } from "lucide-react";
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
  const controls = useAnimation();
  const router = useRouter();

  useEffect(() => {
    const fireAnimation = () => {
      controls.start("visible");
    };

    window.addEventListener("introAnimationComplete", fireAnimation);
    
    if (sessionStorage.getItem("intro_skipped") === "true") {
      fireAnimation();
    }

    return () => {
      window.removeEventListener("introAnimationComplete", fireAnimation);
    };
  }, [controls]);

  return (
    <main className="bg-[#f9e7d3] min-h-screen flex flex-col">
      <section className="relative w-full overflow-hidden">

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-8 sm:px-6 md:grid-cols-[1fr_1.08fr] md:items-center md:pt-16 lg:px-8"
        >
          {/* Animated Text/Hero Group */}
          <motion.div variants={slideUp}>
            <LiquidGlass className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white shadow-soft">
              <p className="flex items-center text-ink gap-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]">
                Govt. Approved Platform
              </p>
            </LiquidGlass>
            <Image
              src={logo}
              alt="LivingGo Logo"
              width={992}
              height={597}
              className="ml-[-50px] md:ml-[15px] mt-[-40px] md:mt-5 h-auto w-auto scale-75 md:scale-100 drop-shadow-[0_4px_3px_rgba(0,0,0,0.3)]"
            />
            <p className="mt-[-30px] md:mt-5 max-w-xl md:text-2xl text-xl leading-7 md:leading-8 md:text-ink text-brown [-webkit-text-stroke:0.1px_#000] drop-shadow-md" style={EBGaramond.style}>
              A Government of India approved, and verified platform.
            </p>

            {/* INSTANT REDIRECT SEARCH BAR */}
            <button 
              onClick={() => router.push('/listings')}
              className="mt-6 flex w-full max-w-lg items-center gap-2 rounded-full bg-white p-2 shadow-xl ring-2 ring-black/5 transition-all hover:ring-ink/20 text-left group"
            >
              <div className="flex pl-4">
                <Search className="h-6 w-6 text-gray-400 group-hover:text-ink transition-colors" />
              </div>
              <span className="w-full bg-transparent px-2 py-3 text-lg font-medium text-gray-400">
                Search PGs...
              </span>
              <span className="rounded-full bg-ink px-8 py-3 text-lg font-black text-white transition-transform group-hover:scale-105 group-hover:bg-ink/90">
                Search
              </span>
            </button>

            {/* GIANT CALL BUTTON WITH EMERALD-950 OUTLINE */}
            <a
              href="tel:+916200232083"
              className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-[#7F9D75] border-2 border-emerald-950 px-10 py-5 text-2xl font-black text-white shadow-[0_8px_25px_rgba(127,157,117,0.4)] transition-all duration-300 hover:scale-105 hover:bg-[#6b8b5f] w-full sm:w-auto"
            >
              <Phone className="h-6 w-6" /> Call Us <sup className="text-sm font-bold">24x7</sup>
            </a>

            {/* SUPERSIZED AND BALANCED SECONDARY BUTTONS */}
            <div className="hidden mt-8 gap-4 sm:flex sm:flex-row items-stretch">
              {/* FIND PGs WITH WHITE OUTLINE & SYNCED SIZING */}
              <Link 
                href="/listings" 
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink border-2 border-white px-9 py-4 text-xl font-black text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl hover:bg-ink/90 min-w-[220px]"
              >
                Find PGs <ArrowRight className="h-6 w-6" aria-hidden />
              </Link>
              
              {/* REFER & EARN WITH SPINNING 3D RUPEE LOGO */}
              <Link 
                href="/earn" 
                className="inline-flex items-center justify-center gap-3 rounded-full bg-white border-2 border-ink px-9 py-4 text-xl font-black text-ink shadow-lg transition-all hover:scale-105 hover:bg-linen min-w-[220px]"
              >
                <div style={{ perspective: 400 }} className="flex items-center justify-center">
                  <motion.span
                    className="inline-block text-2xl drop-shadow-[0_2px_3px_rgba(0,0,0,0.15)] origin-center text-amber-600 font-bold"
                    animate={{ rotateY: 360 }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    ₹
                  </motion.span>
                </div>
                <span>Refer & Earn</span>
                <ArrowRight className="h-6 w-6" aria-hidden />
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
              className="block h-auto w-full drop-shadow-[0_10px_15px_#FF9152]"
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

          {/* MOBILE BUTTON LAYOUT */}
          <div className="md:hidden mt-6 flex flex-col gap-4 w-full">
            <Link 
              href="/listings" 
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink border-2 border-white px-8 py-5 text-xl font-black text-white shadow-xl transition-transform hover:scale-105 w-full"
            >
              Find PGs <ArrowRight className="h-6 w-6" aria-hidden />
            </Link>
            
            <Link 
              href="/earn" 
              className="inline-flex items-center justify-center gap-3 rounded-full bg-white border-2 border-ink px-8 py-5 text-xl font-black text-ink shadow-lg transition-transform hover:scale-105 w-full"
            >
              <div style={{ perspective: 400 }} className="flex items-center justify-center">
                <motion.span
                  className="inline-block text-2xl drop-shadow-[0_2px_3px_rgba(0,0,0,0.15)] origin-center text-amber-600 font-bold"
                  animate={{ rotateY: 360 }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  ₹
                </motion.span>
              </div>
              <span>Refer & Earn</span>
              <ArrowRight className="h-6 w-6" aria-hidden />
            </Link>
          </div>
        </motion.div>
        
        {/* 🔥 INFINITE MARQUEE TICKER 🔥 */}
        <div className="relative z-30 flex w-full overflow-hidden bg-ink py-4 shadow-xl md:mt-4">
          <motion.div
            className="flex w-max flex-nowrap items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 12, repeat: Infinity }}
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex flex-nowrap gap-12 px-6 text-sm md:text-base font-black uppercase tracking-widest text-[#f9e7d3]">
                <span className="whitespace-nowrap">✨ No Brokerage</span>
                <span className="whitespace-nowrap opacity-50">•</span>
                <span className="whitespace-nowrap">🛡️ DigiLocker Verified</span>
                <span className="whitespace-nowrap opacity-50">•</span>
                <span className="whitespace-nowrap">🌐 360 Virtual Tour</span>
                <span className="whitespace-nowrap opacity-50">•</span>
                <span className="whitespace-nowrap">✨ No Brokerage</span>
                <span className="whitespace-nowrap opacity-50">•</span>
                <span className="whitespace-nowrap">🛡️ DigiLocker Verified</span>
                <span className="whitespace-nowrap opacity-50">•</span>
                <span className="whitespace-nowrap">🌐 360 Virtual Tour</span>
                <span className="whitespace-nowrap opacity-50">•</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mt-[-20px] relative z-10 pt-[40px]">
          <FeaturesSection />
        </div>
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
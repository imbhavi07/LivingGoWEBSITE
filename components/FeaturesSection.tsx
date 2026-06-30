"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  CalendarCheck, BadgeIndianRupee, 
  ReceiptText, FileDigit, View,   
  MapPin,  Utensils, MessageSquareWarning, X 
} from "lucide-react";
import isometricLogo from "@/public/assets/3d-logo.png"; // <-- Change to your actual file name
import { LiquidGlass } from "./LiquidGlass";
import { EB_Garamond } from "next/font/google";

const EBGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb_garamond',
  display: 'swap',
});

const features = [
  {
    title: "Instant Pre-Booking",
    description: "Secure your ideal room months in advance. Skip the last-minute scramble and move in stress-free on your own schedule.",
    icon: <CalendarCheck className="h-8 w-8 text-amber-700" />,
    bgColor: "bg-amber-100/80"
  },
  {
    title: "Zero Brokerage",
    description: "Keep your money where it belongs. We connect you directly with properties so you never pay a single rupee in broker fees.",
    icon: <BadgeIndianRupee className="h-8 w-8 text-emerald-700" />,
    bgColor: "bg-emerald-100/80"
  },
  {
    title: "DigiLocker Verified",
    description: "100% authenticated properties and tenants. We utilize official government ID verification to guarantee a perfectly safe living environment.",
    icon: <FileDigit className="h-8 w-8 text-blue-700" />,
    bgColor: "bg-blue-100/80"
  },
  {
    title: "360° Virtual Tours",
    description: "Walk through your future home directly from your screen. Inspect every corner, room, and amenity before you ever step foot inside.",
    icon: <View className="h-8 w-8 text-purple-700" />,
    bgColor: "bg-purple-100/80"
  },
  {
    title: "5000+ Campus Seats",
    description: "Massive inventory strategically located across all major North and South Campus hubs. You will never be far from your daily classes.",
    icon: <MapPin className="h-8 w-8 text-red-700" />,
    bgColor: "bg-red-100/80"
  },
  {
    title: "Automated Rent Tracking",
    description: "View previous receipts, track upcoming electricity bills, and manage all your monthly housing expenses through one seamless digital dashboard.",
    icon: <ReceiptText className="h-8 w-8 text-indigo-700" />,
    bgColor: "bg-indigo-100/80"
  },
  {
    title: "24/7 Support & Complaints",
    description: "Dedicated helplines and an instant digital complaint window. If something breaks or goes wrong, our rapid response team is on it.",
    icon: <MessageSquareWarning className="h-8 w-8 text-orange-700" />,
    bgColor: "bg-orange-100/80"
  },
  {
    title: "Curated Lunch Menus",
    description: "Say goodbye to terrible PG food. View daily updated menus and nutritional details right from our dedicated student mobile app.",
    icon: <Utensils className="h-8 w-8 text-teal-700" />,
    bgColor: "bg-teal-100/80"
  }
];

export function FeaturesSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mobileSelectedIdx, setMobileSelectedIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    // Added overflow-hidden so the background logo doesn't cause horizontal scrolling
    <section className="relative z-10 py-20 px-4 md:px-8 overflow-hidden">
      
      {/* --- THE BACKGROUND ISOMETRIC LOGO --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="relative w-full h-full opacity-50 mix-blend-multiply"
          animate={{ 
            scale: [0.6, 0.62, 0.6], 
            rotate: [0, 1, 0] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={isometricLogo} 
            alt="Best PG in Delhi"
            fill
            className="mt-[125px] md:mt[5px] object-contain object-center scale-150" // scale-150 makes it big enough to act as a watermark
            priority
          />
        </motion.div>
      </div>

      <div className="mt-[-85px] md:mt-[0px] relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-ink mb-4 drop-shadow-sm">
            Everything You Need, Built Right In
          </h2>
          <p className="text-ink/70 text-sm md:text-lg max-w-2xl mx-auto font-medium" style={EBGaramond.style}>
            We stripped away the chaos of house hunting. No hidden fees, no shady landlords: just a seamless, modern living experience.
          </p>
        </div>
        
        {/* THE GLASS CONTAINER */}
        {/* Lowered white opacity to /30 and increased blur to 3xl for better logo refraction */}
        <LiquidGlass className="relative max-w-5xl mx-auto rounded-[3rem] p-10 md:p-20">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-16">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="relative flex flex-col items-center justify-center"
                onMouseEnter={() => !isMobile && setHoveredIdx(idx)}
                onMouseLeave={() => !isMobile && setHoveredIdx(null)}
                onClick={() => isMobile && setMobileSelectedIdx(idx)}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut", 
                    delay: idx * 0.2
                  }}
                >
                  <motion.button 
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`h-24 w-24 md:h-28 md:w-28 rounded-full flex items-center justify-center shadow-xl border border-white/50 cursor-pointer backdrop-blur-md transition-colors ${feature.bgColor}`}
                    aria-label={feature.title}
                  >
                    {feature.icon}
                  </motion.button>
                </motion.div>

                {/* Desktop Hover Tooltip */}
                <AnimatePresence>
                  {!isMobile && hoveredIdx === idx && (
                    <motion.div
                      initial={{ opacity: 0, y: -15, scale: 0.9 }} // Changed y start to match upward trajectory
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      // THE FIX: Changed 'top-full left-1/2 mt-6' to 'bottom-full left-1/2 mb-6'
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-72 bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-5 z-50 pointer-events-none"
                    >
                      {/* THE FIX: Flipped the arrow caret pointer to sit at the bottom pointing down */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-white/95" />
                      
                      <h3 className="text-lg font-bold text-ink mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </LiquidGlass>
      </div>

      {/* Mobile Popup Modal */}
      <AnimatePresence>
        {isMobile && mobileSelectedIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
            onClick={() => setMobileSelectedIdx(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setMobileSelectedIdx(null)}
                className="absolute top-4 right-4 p-2 bg-linen rounded-full text-muted hover:text-ink transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className={`h-20 w-20 rounded-2xl flex items-center justify-center mb-5 border border-black/5 shadow-sm ${features[mobileSelectedIdx].bgColor}`}>
                {features[mobileSelectedIdx].icon}
              </div>
              <h3 className="text-2xl font-bold text-ink mb-3">
                {features[mobileSelectedIdx].title}
              </h3>
              <p className="text-muted leading-relaxed">
                {features[mobileSelectedIdx].description}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IntroOverlay() {
  const [isVisible, setIsVisible] = useState(true);

  // Core callback function to clear intro state and wake up home page
  const handleIntroComplete = () => {
    sessionStorage.setItem("intro_skipped", "true");
    // This is the magic signal that tells page.tsx to slide up!
    window.dispatchEvent(new Event("introAnimationComplete"));
    setIsVisible(false);
  };

  useEffect(() => {
    // Check if user has already bypassed intro in this active session
    if (sessionStorage.getItem("intro_skipped") === "true") {
      window.dispatchEvent(new Event("introAnimationComplete"));
      setIsVisible(false);
      return;
    }

    // Auto-complete intro timeline sequence after 5 seconds
    const autoTimer = setTimeout(() => {
      handleIntroComplete();
    }, 5000); 

    return () => clearTimeout(autoTimer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ 
          opacity: 0,
          pointerEvents: "none",
          transition: { ease: "easeInOut", duration: 0.5 }
        }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f9e7d3]"
      >
        {/* Restored your exact animated WebP implementation */}
        <div className="relative aspect-video w-full max-w-4xl mx-auto">
          <Image
            src="/bootup-animation.webp"
            alt="LivingGo Intro Animation"
            fill
            priority
            unoptimized
            className="object-contain"
          />
        </div>

        {/* Restored your original skip button styling but hooked to the new event logic */}
        <button
          onClick={handleIntroComplete}
          className="mt-8 px-4 py-2 text-xl font-semibold text-ink transition-colors hover:text-gray-700 flex items-center gap-2"
        >
          Skip Intro <ArrowRight className="h-6 w-6" aria-hidden="true" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
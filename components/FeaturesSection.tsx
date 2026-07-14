"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { 
  View, 
  BadgeIndianRupee, 
  FileDigit, 
  CalendarCheck, 
  Utensils, 
  ReceiptText 
} from "lucide-react";
import { EB_Garamond } from "next/font/google";

const EBGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb_garamond",
  display: "swap",
});

interface ProblemSolutionItem {
  problem: string;
  solution: string;
  bgColor: string;
  textColor: string;
  subColor: string;
  icon: React.JSX.Element;
}

const problemSolutions: ProblemSolutionItem[] = [
  {
    problem: "Fake listings & edited photos waste days of hunting.",
    solution: "We provide authenticated 360° virtual tours to inspect every corner before visiting.",
    bgColor: "#563611",
    textColor: "#F8E6D3",
    subColor: "#DBB88C",
    icon: <View className="h-8 w-8 md:h-12 md:w-12" />, 
  },
  {
    problem: "Hidden brokerage fees inflate shifting costs.",
    solution: "Direct-to-owner connections ensure a strict absolute zero brokerage policy.",
    bgColor: "#98662F",
    textColor: "#F8E6D3",
    subColor: "#F8E6D3",
    icon: <BadgeIndianRupee className="h-8 w-8 md:h-12 md:w-12" />,
  },
  {
    problem: "Identity safety and unverified properties pose security risks.",
    solution: "Every tenant and landlord is 100% verified via secure DigiLocker protocols.",
    bgColor: "#D39F62",
    textColor: "#563611",
    subColor: "#563611/80",
    icon: <FileDigit className="h-8 w-8 md:h-12 md:w-12" />,
  },
  {
    problem: "Scrambling for campus accommodation at the last minute.",
    solution: "Secure your ideal seat months in advance with flexible instant pre-booking windows.",
    bgColor: "#DBB88C",
    textColor: "#563611",
    subColor: "#563611/80",
    icon: <CalendarCheck className="h-8 w-8 md:h-12 md:w-12" />,
  },
  {
    problem: "Terrible quality PG food causing health challenges.",
    solution: "Check curated daily updated digital lunch/dinner menus straight inside the app.",
    bgColor: "#EBCAA0",
    textColor: "#563611",
    subColor: "#563611/80",
    icon: <Utensils className="h-8 w-8 md:h-12 md:w-12" />,
  },
  {
    problem: "Untracked maintenance issues and messy manual calculations.",
    solution: "Manage bills, raise tickets, and see clear receipt records in one dashboard.",
    bgColor: "#F8E6D3",
    textColor: "#563611",
    subColor: "#98662F",
    icon: <ReceiptText className="h-8 w-8 md:h-12 md:w-12" />,
  },
];

export function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); 
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // We track the scroll progress of THIS specific section naturally in the DOM.
  // The cards start dealing when the top of this section is 85% down the viewport,
  // and finish dealing when the top hits 15% of the viewport.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "start 15%"],
  });

  return (
    // NO MORE 400vh! This section flows perfectly with the rest of the page.
    <section ref={containerRef} className="relative w-full py-16 md:py-24">
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-[#563611]/10 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center px-4">
        <div className="text-center mb-12 md:mb-16 shrink-0">
          <h2 className="text-3xl md:text-5xl font-black text-ink mb-4 tracking-tight">
            Everything You Need, Built Right In
          </h2>
          <p className="text-ink/80 text-base md:text-lg font-bold max-w-2xl mx-auto" style={EBGaramond.style}>
            We stripped away the chaos of student house hunting. No hidden fees, no shady landlords: just a seamless, modern living experience.
          </p>
        </div>

        {/* Exactly 1150px height reserves perfect space for all 6 expanded cards. Zero gaps! */}
        <div className="relative w-full h-[1150px]">
          {problemSolutions.map((item, idx) => (
            <CapsuleCard 
              key={idx} 
              item={item} 
              idx={idx} 
              isMobile={isMobile}
              scrollYProgress={scrollYProgress} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CapsuleCard({ 
  item, 
  idx, 
  isMobile,
  scrollYProgress 
}: { 
  item: ProblemSolutionItem; 
  idx: number; 
  isMobile: boolean;
  scrollYProgress: MotionValue<number>; 
}) {
  const zIndex = idx;
  
  // Start slightly staggered so it looks like a deck of cards
  const initialY = idx * 15;
  
  // Mobile Card Height is ~170px. Gap is ~16px. Total = 186px.
  const finalY = idx * (isMobile ? 186 : 184); 

  // Smooth interpolation from stacked to spread out as user scrolls
  const y = useTransform(scrollYProgress, [0, 1], [initialY, finalY]);

  return (
    <motion.div
      style={{ y, zIndex }}
      className="absolute top-0 left-0 w-full h-[170px] md:h-[160px] rounded-[2.5rem] py-6 px-5 md:py-8 md:px-10 flex flex-row items-center justify-between gap-4 md:gap-6 shadow-[0_10px_20px_rgba(92,64,51,0.5)] border border-white/5"
      initial={{ backgroundColor: item.bgColor, color: item.textColor }}
    >
      <div className="flex-1 text-left">
        <p 
          className="text-[10px] md:text-sm font-bold uppercase tracking-widest opacity-70 mb-1 md:mb-2"
          style={{ color: item.subColor }}
        >
          Problem solved
        </p>
        <p className="text-sm md:text-lg font-black leading-snug">
          &ldquo;{item.problem}&rdquo; <br></br> <span className="font-medium opacity-90">{item.solution}</span>
        </p>
      </div>

      <div className="shrink-0 flex items-center justify-center opacity-40">
        {item.icon}
      </div>
    </motion.div>
  );
}
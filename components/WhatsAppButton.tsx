"use client";

import { motion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";
import { usePathname } from "next/navigation"; // 1. Import the hook

export function WhatsAppButton() {
  const pathname = usePathname(); // 2. Get the current URL path
  
  // 3. THE FIX: Kill the button instantly if the user is on an owner or admin page
  if (pathname?.startsWith("/owner") || pathname?.startsWith("/admin")) {
    return null;
  }

  const phoneNumber = "9355405403";
  const message = "Hi! I need help with student housing.";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-[100px] right-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-colors hover:bg-[#128C7E]"
      aria-label="Chat with us on WhatsApp"
    >
      <SiWhatsapp className="h-7 w-7" /> 
    </motion.a>
  );
}

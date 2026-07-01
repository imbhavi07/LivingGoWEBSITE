"use client";

import { motion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si"; // 1. Import the official logo

export function WhatsAppButton() {
  const phoneNumber = "9068902886";
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
      // Keep your existing classes here
      className="fixed bottom-[100px] right-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-colors hover:bg-[#128C7E]"
      aria-label="Chat with us on WhatsApp"
    >
      {/* 2. Use the official logo here */}
      <SiWhatsapp className="h-7 w-7" /> 
    </motion.a>
  );
}
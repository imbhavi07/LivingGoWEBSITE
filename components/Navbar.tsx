"use client";

import Link from "next/link";
import { ChevronDown, Heart, Home, LogOut, Search, UserRound } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { motion, Variants } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/listings", label: "Listings", icon: Search },
  { href: "/wishlist", label: "Wishlist", icon: Heart }
];

// THE FIX: Removed massive 1-second delays so mobile nav appears instantly
const mobileContainerBottom: Variants = {
  hidden: { y: 100, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 90, damping: 14, staggerChildren: 0.05 }
  }
};

const mobileContainerTop: Variants = {
  hidden: { y: -100, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 90, damping: 14, staggerChildren: 0.05 }
  }
};

const mobileItem: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 10 } }
};

export function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const role = user?.publicMetadata?.role ?? user?.unsafeMetadata?.role ?? "student";
  const [mounted, setMounted] = useState(false);

  const isPropertyPage = pathname.startsWith("/properties/");

  useEffect(() => setMounted(true), []);

  // Hide entirely on specific dashboards
  if (pathname.startsWith("/student/dashboard") || pathname.startsWith("/visiting")) {
    return null;
  }

  return (
    <motion.nav
      variants={isPropertyPage ? mobileContainerTop : mobileContainerBottom}
      initial="hidden"
      animate="visible"
      // Force z-index to 999 to guarantee it sits above everything
      className={cn(
        "fixed inset-x-4 z-[999] grid grid-cols-4 rounded-[1.5rem] bg-white/15 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-white/40 md:hidden",
        isPropertyPage ? "top-3" : "bottom-3"
      )}
      style={{
        backdropFilter: "blur(30px) saturate(170%)",
        WebkitBackdropFilter: "blur(30px) saturate(170%)",
      }}
    >
      <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-br from-white/25 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-white/40 pointer-events-none" />

      {navLinks.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <motion.div key={item.href} variants={mobileItem} className="flex h-full w-full relative z-10">
            <Link
              href={item.href}
              className={cn(
                "flex w-full min-h-11 flex-col items-center justify-center rounded-2xl text-[10px] font-semibold text-ink transition",
                isActive && "bg-ink text-white shadow-md"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span className="mt-0.5">{item.label}</span>
            </Link>
          </motion.div>
        );
      })}

      <motion.div variants={mobileItem} className="flex h-full w-full relative z-10">
        {!mounted ? null : user ? (
          <Link
            href={role === "admin" ? "/admin/dashboard" : role === "owner" ? "/owner/dashboard" : "/student/dashboard"}
            className={cn(
              "flex w-full min-h-11 flex-col items-center justify-center rounded-2xl text-[10px] font-semibold text-ink transition",
              pathname.includes("dashboard") && "bg-ink text-white shadow-md"
            )}
          >
            <UserRound className="h-4 w-4" aria-hidden />
            <span className="mt-0.5">{role === 'student' ? 'Dashboard' : 'Account'}</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className={cn(
              "flex w-full min-h-11 flex-col items-center justify-center rounded-2xl text-[10px] font-semibold text-ink transition",
              pathname === "/login" && "bg-ink text-white shadow-md"
            )}
          >
            <UserRound className="h-4 w-4" aria-hidden />
            <span className="mt-0.5">Sign in</span>
          </Link>
        )}
      </motion.div>
    </motion.nav>
  );
}
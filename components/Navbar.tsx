"use client";

import Link from "next/link";
import { ChevronDown, Heart, Home, LogOut, Search, UserRound } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { Playpen_Sans } from 'next/font/google';
import { Button } from "@/components/Button";
const playpenSans = Playpen_Sans({
  subsets: ['latin'],
  variable: '--font-playpensans', 
  display: 'swap',
});

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/listings", label: "Listings", icon: Search },
  { href: "/wishlist", label: "Wishlist", icon: Heart }
];

// --- Desktop Animation Physics ---
const desktopContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      delay: 1,        
      delayChildren: 1.3, 
      staggerChildren: 0.15
    }
  }
};

const desktopItem: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 6      
    } 
  }
};

// --- Mobile Animation Physics ---
const mobileContainer: Variants = {
  hidden: { y: 200, opacity: 0, scale: 0.3 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 80, 
      damping: 12,    
      delay: 1,       
      delayChildren: 1.3, 
      staggerChildren: 0.1 
    }
  }
};

const mobileItem: Variants = {
  hidden: { y: 20, opacity: 0, scale: 0.9 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 6      
    } 
  }
};

export function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const role = user?.publicMetadata?.role ?? user?.unsafeMetadata?.role ?? "student";
  const displayName = user?.fullName ?? user?.firstName ?? user?.primaryEmailAddress?.emailAddress?.split('@')[0] ?? "User";
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pathname.startsWith("/student/dashboard")) {
    return null;
  }

  return (
    <>
      {/* DESKTOP LIQUID GLASS HEADER */}
      <motion.header 
        variants={desktopContainer}
        initial="hidden"
        animate="visible"
        className="sticky top-0 z-40 hidden border-b border-white/20 bg-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] md:block"
        style={{
          backdropFilter: "blur(20px) saturate(170%)",
          WebkitBackdropFilter: "blur(20px) saturate(170%)",
        }}
      >
        {/* Specular Edge Highlight Ring */}
        <div className="absolute inset-0 z-0 ring-1 ring-inset ring-white/30 pointer-events-none" />

        <nav className="relative z-10 mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
          
          <motion.div variants={desktopItem}>
            <Link href="/" className="text-2xl font-black tracking-tight text-ink">
              <p className="text-2xl" style={playpenSans.style}>
                LivingGo.in
              </p>
            </Link>
          </motion.div>

          <motion.div variants={desktopItem} className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md p-1 shadow-soft border border-white/50">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-5 py-3 text-sm font-semibold text-muted transition hover:text-ink",
                  pathname === item.href && "bg-ink text-white hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>

          <motion.div variants={desktopItem}>
            {!mounted ? (
              <div className="h-10 w-20 animate-pulse rounded-full bg-white/20" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-4 py-2 shadow-soft border border-white/50 transition hover:bg-white">
                  <Link
                    href={
                      role === "admin" ? "/admin/dashboard" :
                      role === "owner" ? "/owner/dashboard" :
                      role === "student" ? "/student/dashboard" :
                      "/"
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white transition hover:opacity-80"
                    title="Go to Dashboard"
                  >
                    <UserRound className="h-4 w-4" aria-hidden />
                  </Link>
                  <Button
                    onClick={() => setOpen((prev) => !prev)}
                    className="flex items-center gap-1 text-left outline-none"
                  >
                    <span className="text-sm font-bold text-ink">
                      {displayName}
                      {role === 'admin' && (
                        <span className="font-semibold uppercase text-muted ml-1">(ADMIN)</span>
                      )}
                    </span>
                    <ChevronDown
                      className={cn("h-4 w-4 text-muted transition", open && "rotate-180")}
                      aria-hidden
                    />
                  </Button>
                </div>
                {open && (
                  <div className="absolute right-0 top-14 w-64 overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-black/5">
                    <div className="flex flex-col items-center gap-2 bg-ink p-5 text-white">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                        <UserRound className="h-8 w-8" aria-hidden />
                      </div>
                      <p className="text-sm font-black">{displayName}</p>
                      {role === 'admin' && (
                        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase ml-2">ADMIN</span>
                      )}
                    </div>
                    <div className="p-3">
                      <Button
                        onClick={() => { setOpen(false); signOut(); }}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-moss px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                      >
                        <LogOut className="h-4 w-4" aria-hidden />
                        Sign out
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link className="text-sm font-semibold text-ink bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-soft" href="/login">
                Sign in
              </Link>
            )}
          </motion.div>

        </nav>
      </motion.header>

      {/* MOBILE LIQUID GLASS NAVIGATION */}
      <motion.nav 
        variants={mobileContainer}
        initial="hidden"
        animate="visible"
        className="fixed inset-x-4 bottom-4 z-50 grid grid-cols-4 rounded-[2rem] bg-white/15 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-white/40 md:hidden"
        style={{
          backdropFilter: "blur(30px) saturate(170%)",
          WebkitBackdropFilter: "blur(30px) saturate(170%)",
        }}
      >
        {/* Specular Diagonal Light Sheen Overlay */}
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/25 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/40 pointer-events-none" />

        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <motion.div key={item.href} variants={mobileItem} className="flex h-full w-full relative z-10">
              <Link
                href={item.href}
                className={cn(
                  "flex w-full min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-ink transition",
                  isActive && "bg-ink text-white shadow-md"
                )}
                aria-label={item.label}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="mt-1">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}

        <motion.div variants={mobileItem} className="flex h-full w-full relative z-10">
          {!mounted ? null : user ? (
            (role === "admin" || role === "owner") ? (
              <Link
                href={role === "admin" ? "/admin/dashboard" : "/owner/dashboard"}
                className={cn(
                  "flex w-full min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-ink transition",
                  (pathname === "/owner/dashboard" || pathname === "/admin/dashboard") && "bg-ink text-white shadow-md"
                )}
                aria-label="Account"
              >
                <UserRound className="h-5 w-5" aria-hidden />
                <span className="mt-1">Account</span>
              </Link>
            ) : (
              <Link
                href="/student/dashboard"
                className={cn(
                  "flex w-full min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition",
                  pathname === "/student/dashboard" && "bg-ink text-white shadow-md"
                )}
                aria-label="Dashboard"
              >
                <UserRound className="h-5 w-5" aria-hidden />
                <span className="mt-1">Dashboard</span>
              </Link>
            )
          ) : (
            <Link
              href="/login"
              className={cn(
                "flex w-full min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition",
                pathname === "/login" && "bg-ink text-white shadow-md"
              )}
              aria-label="Sign in"
            >
              <UserRound className="h-5 w-5" aria-hidden />
              <span className="mt-1">Sign in</span>
            </Link>
          )}
        </motion.div>

      </motion.nav>
    </>
  );
}
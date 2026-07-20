"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Gift, User, ChevronDown, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/listings", label: "Listings" },
    { href: "/wishlist", label: "Wishlist" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-bg/95 backdrop-blur-md border-b border-brand-dark/10">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* Left: Logo Image */}
          <Link href="/" className="flex items-center shrink-0" aria-label="LivingGo Home">
            <Image
              src="/assets/logo.png"
              alt="LivingGo"
              className="h-14 md:h-16 w-auto object-contain"
              width={128}
              height={64}
              priority
            />
          </Link>

          {/* Desktop Center Navigation (The Pill) - Hidden on mobile, visible on desktop */}
          <nav className="hidden lg:flex items-center bg-brand-bg rounded-full p-1 shadow-sm border border-brand-dark/10" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm transition",
                    isActive
                      ? "bg-brand-dark text-white font-bold"
                      : "text-brand-dark hover:bg-brand-dark/5 font-semibold"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions (Call Us, Refer & Earn, Auth Menu) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Call Us Button */}
            <a
              href="tel:+916200232083"
              className="flex h-10 w-10 sm:h-auto sm:w-auto items-center justify-center gap-2 rounded-full sm:rounded-xl bg-[#e5f3e1] sm:px-4 sm:py-2.5 shadow-sm hover:bg-[#d4ead0] transition-colors border border-[#78b264]/20"
              title="Call Us"
              aria-label="Call Us"
            >
              <Phone className="h-4 w-4 text-[#4a7d3a]" aria-hidden="true" />
              <span className="hidden sm:inline font-bold text-[#4a7d3a] text-sm tracking-wide">Call Us</span>
            </a>

            {/* Refer & Earn Button */}
            <Link
              href="/earn"
              className="flex items-center gap-2 rounded-xl bg-[#78b264] px-3 py-2 sm:px-4 sm:py-2.5 shadow-card hover:shadow-card-hover hover:bg-[#669954] transition-all duration-200"
              aria-label="Refer & Earn"
            >
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg bg-white/20">
                <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-bold text-white text-[13px] sm:text-sm">Refer & Earn</span>
            </Link>

            {/* Desktop Auth Menu (Account Dropdown / Sign In) */}
            <div className="hidden md:flex items-center">
              {!isLoaded ? (
                // Loading Skeleton
                <div
                  className="flex h-10 w-24 items-center justify-center animate-pulse rounded-full bg-brand-dark/10"
                  aria-label="Loading user"
                />
              ) : isSignedIn ? (
                // Signed In: Account Dropdown
                <div className="relative" id="account-menu">
                  <button
                    type="button"
                    className="flex items-center gap-2 bg-brand-bg border border-brand-dark/10 rounded-full px-3 py-2 shadow-sm transition hover:bg-neutral-50"
                    aria-expanded="false"
                    aria-haspopup="true"
                    aria-label={`Account menu for ${user?.fullName || "User"}`}
                  >
                    {user?.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                        aria-hidden="true"
                      />
                    ) : (
                      <User className="h-5 w-5 text-brand-dark/70" aria-hidden="true" />
                    )}
                    <span className="hidden sm:inline text-sm font-medium text-brand-dark max-w-[100px] truncate">
                      {user?.fullName || "Account"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-brand-dark/70" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                // Signed Out: Sign In Link
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-sm font-bold text-brand-dark/80 hover:text-brand-dark transition-colors px-2"
                  aria-label="Sign In"
                >
                  <User className="h-4.5 w-4.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </header>
  );
}
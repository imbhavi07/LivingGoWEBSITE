"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, Home, LogOut, Search, UserRound } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/listings", label: "Listings", icon: Search },
  { href: "/wishlist", label: "Wishlist", icon: Heart }
];

// aur bhi cheezein fix kar di I guess, abhi bhi kuch bugs ho sakte hain but overall structure is good.

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
  
// navbar banadiya bccccc
  return (
    <>
      <header className="sticky top-0 z-40 hidden border-b border-black/5 bg-linen/90 backdrop-blur md:block">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
          <Link href="/" className="text-2xl font-black tracking-tight text-ink">
            <p className="text-2xl font-black tracking-tight text-ink">LivingGo.in</p>
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-soft">
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
          </div>

          {/* ✅ mounted check prevents "Sign in" flash */}
          {!mounted ? (
            <div className="h-10 w-20 animate-pulse rounded-full bg-linen" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft transition hover:bg-linen">
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
                <button
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
                </button>
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
                    <button
                      onClick={() => { setOpen(false); signOut(); }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-moss px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link className="text-sm font-semibold text-ink" href="/login">
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <nav className="fixed inset-x-4 bottom-4 z-50 grid grid-cols-4 rounded-[2rem] bg-white p-2 shadow-lift md:hidden">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted",
                isActive && "bg-ink text-white"
              )}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
        {!mounted ? null : user ? (
          (role === "admin" || role === "owner") ? (
            <Link
              href={role === "admin" ? "/admin/dashboard" : "/owner/dashboard"}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition",
                (pathname === "/owner/dashboard" || pathname === "/admin/dashboard") && "bg-ink text-white"
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
                "flex min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition",
                pathname === "/student/dashboard" && "bg-ink text-white"
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
              "flex min-h-14 flex-col items-center justify-center rounded-3xl text-xs font-semibold text-muted transition",
              pathname === "/login" && "bg-ink text-white"
            )}
            aria-label="Sign in"
          >
            <UserRound className="h-5 w-5" aria-hidden />
            <span className="mt-1">Sign in</span>
          </Link>
        )}
      </nav>
    </>
  );
}
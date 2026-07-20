"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, LogOut, Menu, Bookmark, X, Settings2, Share2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

const studentLinks = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/listings", label: "Browse Properties", icon: Building2 },
  { href: "/wishlist", label: "Wishlist", icon: Bookmark },
  { href: "/student/profile", label: "Profile", icon: Settings2 },
  { href: "/student/referral", label: "Refer & Earn", icon: Share2 }
];

export function StudentShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F4F0]">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-black/10 bg-white px-5 py-6 shadow-soft lg:block">
        <StudentSidebar onSignOut={signOut} />
      </div>
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/90 px-4 py-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/student/dashboard" className="text-xl font-black text-ink">
            LivingGo Student
          </Link>
          <button className="rounded-2xl bg-linen p-3" onClick={() => setOpen(true)} aria-label="Open student menu">
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </header>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-label="Close menu" />
          <aside className="absolute inset-y-0 left-0 w-[82vw] max-w-80 bg-white p-5 shadow-lift">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-xl font-black text-ink">LivingGo Student</p>
              <button className="rounded-2xl bg-linen p-3" onClick={() => setOpen(false)} aria-label="Close student menu">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <StudentSidebar onNavigate={() => setOpen(false)} onSignOut={signOut} />
          </aside>
        </div>
      ) : null}
      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-8">{children}</main>
    </div>
  );
}

function StudentSidebar({ onNavigate, onSignOut }: { onNavigate?: () => void; onSignOut: () => void }) {
  const pathname = usePathname();
  const isMobile = typeof onNavigate === 'function';

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/student/dashboard"
        onClick={onNavigate}
        className="hidden items-center gap-2 text-2xl font-black text-ink lg:flex"
      >
        <Image
          src="/assets/logo.png"
          alt="LivingGo Logo"
          width={992} // Fallback width for Next.js Image optimization
          height={597} // Fallback height
          className="h-16 w-auto object-contain" // Controls the actual display size
        />
        <span>Student</span>
      </Link>

      <div className="mt-3 rounded-3xl bg-linen p-4">
        <p className="text-sm font-bold text-ink">Student Workspace</p>
        <p className="mt-1 text-xs leading-5 text-muted">Find your perfect PG, manage applications, and track your journey.</p>
      </div>
      <nav className="mt-6 space-y-2">
        {studentLinks.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold text-muted transition hover:bg-linen hover:text-ink",
                active && "bg-ink text-white hover:bg-ink hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
        {isMobile && (
          <Link
            href="/"
            onClick={onSignOut}
            className={cn(
              "flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold text-muted transition hover:bg-linen hover:text-ink"
            )}
          >
            <LogOut className="h-5 w-5" aria-hidden />
            Sign out
          </Link>
        )}
      </nav>
      {!isMobile && (
        <Button variant="ghost" className="mt-auto justify-start px-4" onClick={onSignOut}>
          <LogOut className="h-5 w-5" aria-hidden />
          Sign out
        </Button>
      )}
    </div>
  );
}
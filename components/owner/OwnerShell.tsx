"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, LogOut, Menu, PlusCircle, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/Button";
import { useOwnerAuth } from "@/hooks/useOwnerAuth";
import { cn } from "@/lib/utils";
import Image from "next/image";

const ownerLinks = [
  { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/properties", label: "Properties", icon: Building2 },
  { href: "/owner/properties/new", label: "Add Property", icon: PlusCircle }
];

export function OwnerShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const auth = useOwnerAuth();

  return (
    <div className="min-h-screen bg-[#F5F1EA]">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-black/5 bg-white px-5 py-6 shadow-soft lg:block">
        <OwnerSidebar onSignOut={auth.signOut} />
      </div>
      
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 px-4 py-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          {/* THE FIX: Pointed href to "/" instead of the dashboard */}
          <Link href="/" className="flex items-center gap-2 text-xl font-black text-ink">
            <Image
              src="/assets/logo.png"
              alt="LivingGo - Verified Student PG Management Platform for Property Owners"
              width={992}
              height={597}
              className="h-8 w-auto object-contain"
            />
            <span>Owner</span>
          </Link>
          <button className="rounded-2xl bg-linen p-3" onClick={() => setOpen(true)} aria-label="Open owner menu">
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </header>

      {/* Mobile Slide-out Drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-label="Close menu" />
          <aside className="absolute inset-y-0 left-0 w-[82vw] max-w-80 bg-white p-5 shadow-lift">
            <div className="mb-5 flex items-center justify-between">
              {/* THE FIX: Converted this static div into a Link pointing to "/" */}
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2 text-xl font-black text-ink">
                <Image
                  src="/assets/logo.png"
                  alt="LivingGo - Verified Student PG Management Platform for Property Owners"
                  width={992}
                  height={597}
                  className="h-8 w-auto object-contain"
                />
                <span>Owner</span>
              </Link>
              <button className="rounded-2xl bg-linen p-3" onClick={() => setOpen(false)} aria-label="Close owner menu">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <OwnerSidebar onNavigate={() => setOpen(false)} onSignOut={auth.signOut} />
          </aside>
        </div>
      ) : null}
      
      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-8">{children}</main>
    </div>
  );
}

function OwnerSidebar({ onNavigate, onSignOut }: { onNavigate?: () => void; onSignOut: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Desktop Sidebar Logo */}
      {/* THE FIX: Pointed href to "/" */}
      <Link
        href="/"
        onClick={onNavigate}
        className="hidden items-center gap-2 text-2xl font-black text-ink lg:flex"
      >
        <Image
          src="/assets/logo.png"
          alt="LivingGo - Verified Student PG Management Platform for Property Owners"
          width={992}
          height={597}
          className="h-14 w-auto object-contain"
        />
        <span>Owner</span>
      </Link>

      <div className="mt-3 rounded-3xl bg-linen p-4">
        <p className="text-sm font-bold text-ink">Owner Workspace</p>
        <p className="mt-1 text-xs leading-5 text-muted">Manage PGs, flats, approvals, and occupancy-ready listings.</p>
      </div>
      <nav className="mt-6 space-y-2">
        {ownerLinks.map((item) => {
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
        {onNavigate && (
          <Button variant="ghost" className="mt-4 justify-start px-4" onClick={onSignOut}>
            <LogOut className="h-5 w-5" aria-hidden />
            Sign out
          </Button>
        )}
      </nav>
      {!onNavigate && (
        <Button variant="ghost" className="mt-auto justify-start px-4" onClick={onSignOut}>
          <LogOut className="h-5 w-5" aria-hidden />
          Sign out
        </Button>
      )}
    </div>
  );
}
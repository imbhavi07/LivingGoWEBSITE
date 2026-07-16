"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { ClipboardCheck, LayoutDashboard, LogOut, Menu, ShieldCheck, Shield, Users, X, Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";

const adminLinks = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/listings", label: "Moderation", icon: ClipboardCheck },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/properties", label: "Properties", icon: ClipboardCheck },
  { href: "/admin/approvals", label: "Approvals", icon: Shield },
  { href: "/admin/payments", label: "Payments", icon: ShieldCheck },
  { href: "/admin/coupons", label: "Coupons", icon: Plus }
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const auth = useAdminAuth();
  const { user } = useAuthContext();

  console.log("AuthContext User:", user);

  const isSuperAdmin = user?.role === "SUPER_ADMIN"; 

  console.log({
  role: user?.role,
  isSuperAdmin,
});
  
  return (
    <div className="min-h-screen bg-[#F6F7F8]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-black/10 bg-[#111315] p-5 text-white lg:block">
        <AdminSidebar onSignOut={auth.signOut} isSuperAdmin={isSuperAdmin} />
      </aside>
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/90 px-4 py-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-xl font-black text-ink">
            <ShieldCheck className="h-5 w-5" aria-hidden />
            LivingGo Admin
          </Link>
          <button className="rounded-2xl bg-linen p-3" onClick={() => setOpen(true)} aria-label="Open admin menu">
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </header>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-label="Close admin menu" />
          
          {/* FIX 1: Added 'flex flex-col' to the main aside wrapper */}
          <aside className="absolute inset-y-0 left-0 w-[84vw] max-w-80 bg-[#111315] p-5 text-white shadow-lift flex flex-col">
            
            {/* FIX 2: Added 'shrink-0' so the header doesn't get squished */}
            <div className="mb-5 flex shrink-0 items-center justify-between">
              <p className="text-xl font-black">LivingGo Admin</p>
              <button className="rounded-2xl bg-white/10 p-3" onClick={() => setOpen(false)} aria-label="Close admin menu">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            
            {/* FIX 3: Wrapped the sidebar in a flex-1 container to fill exact remaining space */}
            <div className="flex-1 overflow-y-auto">
              <AdminSidebar 
                onNavigate={() => setOpen(false)} 
                onSignOut={auth.signOut} 
                isSuperAdmin={isSuperAdmin} 
              />
            </div>
            
          </aside>
        </div>
      ) : null}
      <main className="px-4 py-6 sm:px-6 lg:pl-64 lg:px-8">{children}</main>
    </div>
  );
}

function AdminSidebar({ onNavigate, onSignOut}: { onNavigate?: () => void; onSignOut: () => void; isSuperAdmin: boolean }) {
  const pathname = usePathname();
  
  const { user } = useAuthContext();
  const isSuperAdmin = user?.role === "SUPER_ADMIN"; 
  

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin/dashboard" onClick={onNavigate} className="hidden items-center gap-2 text-2xl font-black lg:flex">
        <ShieldCheck className="h-6 w-6 text-clay" aria-hidden />
        LivingGo Admin
      </Link>
      <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-bold">Moderation staff</p>
        <p className="mt-1 text-xs leading-5 text-white/55">Secure internal controls for listings, owners, and platform trust.</p>
      </div>
      <nav className="mt-6 space-y-2">
        {adminLinks.map((item) => {
          if (item.label === "Coupons" && !isSuperAdmin) {
            return null;
          }   
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold text-white/60 transition hover:bg-white/10 hover:text-white",
                active && "bg-white text-ink hover:bg-white hover:text-ink"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button variant="ghost" className="mt-auto justify-start px-4 text-white hover:bg-white/10" onClick={onSignOut}>
        <LogOut className="h-5 w-5" aria-hidden />
        Sign out
      </button>
    </div>
  );
}
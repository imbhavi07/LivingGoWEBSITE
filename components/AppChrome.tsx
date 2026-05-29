"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isOwnerArea = pathname.startsWith("/owner");
  const isAdminArea = pathname.startsWith("/admin");

  if (isOwnerArea || isAdminArea) return children;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
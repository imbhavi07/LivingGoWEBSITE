"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Navbar } from "@/components/Navbar";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  const isOwnerArea = pathname.startsWith("/owner");
  const isAdminArea = pathname.startsWith("/admin");
  const isStudentArea = pathname.startsWith("/student");

  // Matches /property/[id] routes to trigger layout changes
  const isPropertyDetailPage = pathname.startsWith("/properties/");

  if (isOwnerArea || isAdminArea || isStudentArea) return children;

  return (
    <div className="flex min-h-screen flex-col">
      {/* 🔴 FIXED: Header is hidden on property detail pages */}
      {!isPropertyDetailPage && <Header />}
      
      <main className="flex-1">{children}</main>
      
      {/* 🔴 FIXED: Navbar is now always rendered */}
      <Navbar />
      
      <Footer />
    </div>
  );
}
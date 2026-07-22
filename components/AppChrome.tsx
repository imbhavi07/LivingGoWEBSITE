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
  const isVisitingArea = pathname.startsWith("/visiting");
  if (isOwnerArea || isAdminArea || isStudentArea || isVisitingArea) return children;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">{children}</main>
      <Navbar />
      
      <Footer />
    </div>
  );
}
"use client";

import { usePathname } from "next/navigation";
import { ClerkSessionSync } from "@/components/ClerkSessionSync";

export default function ClerkSessionWrapper() {
  const pathname = usePathname();

  // Never run Clerk sync for admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <ClerkSessionSync />;
}
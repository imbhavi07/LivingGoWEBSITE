"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      const loginUrl = new URL("/owner/login", window.location.origin);
      loginUrl.searchParams.set("next", pathname);
      window.location.href = loginUrl.toString();
      return;
    }

    const role = (user.publicMetadata as { role?: string })?.role;
    if (role !== "owner" && role !== "admin") {
      const loginUrl = new URL("/owner/login", window.location.origin);
      loginUrl.searchParams.set("next", pathname);
      window.location.href = loginUrl.toString();
      return;
    }
  }, [isLoaded, user, router, pathname]);

  return (
    <>
      {children}
    </>
  );
}
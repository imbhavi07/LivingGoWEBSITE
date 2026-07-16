"use client";

import { useEffect } from "react";
import VisitingNavbar from "@/components/VisitingNavbar";

export default function VisitingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const path = window.location.pathname;
    if (
      path === "/visiting/login" ||
      path.startsWith("/visiting/lead")
    ) {
      return;
    }

    const token = localStorage.getItem("visiting_token");

    if (!token) {
      window.location.href = "/visiting/login";
    }
  }, []);

  return (
    <>
      <main className="min-h-screen pb-20">{children}</main>
      <VisitingNavbar />
    </>
  );
}
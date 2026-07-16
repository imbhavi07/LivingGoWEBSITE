"use client";

import { useEffect } from "react";

export default function LeadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const token = localStorage.getItem("lead_token");

    if (!token) {
      window.location.href = "/visiting/login";
    }
  }, []);

  return <>{children}</>;
}
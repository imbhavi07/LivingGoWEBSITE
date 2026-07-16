"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("intern_token");
      localStorage.removeItem("intern_name");
    }
    router.replace("/visiting/login");
  }, []);

  return null;
}
"use client";

import { useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useAuthContext } from "@/contexts/AuthContext";
import { setSession, clearSession } from "@/lib/auth";

export function ClerkSessionSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const { refreshSession } = useAuthContext();

  const clearedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      if (!clearedRef.current) {
        clearedRef.current = true;
        clearSession().then(() => refreshSession());
      }
      return;
    }
    clearedRef.current = false;

    getToken().then((token) => {
      if (!token) return;
      setSession({
        token,
        user: {
          id: user.id,
          name: user.fullName ?? user.username ?? "Student",
          email: user.primaryEmailAddress?.emailAddress ?? "",
      role:
          (user.publicMetadata?.role as "student" | "owner" | "admin") ??
          (user.unsafeMetadata?.role as "student" | "owner" | "admin") ??
          "student",
        },
      }).then(() => refreshSession());
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user?.id]);

  return null;
}

"use client";

import { useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useAuthContext } from "@/contexts/AuthContext";
import { setSession, clearSession } from "@/lib/auth";

export function ClerkSessionSync() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const { refreshSession } = useAuthContext();

  useEffect(() => {
    if (!isSignedIn || !user) {
      clearSession().then(() => refreshSession());
      return;
    }

    getToken().then((token) => {
      if (!token) return;
      setSession({
        token,
        user: {
          id: user.id,
          name: user.fullName ?? user.username ?? "Student",
          email: user.primaryEmailAddress?.emailAddress ?? "",
          role: (user.publicMetadata?.role as "student" | "owner" | "admin") ?? "student",
        },
      }).then(() => refreshSession());
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user?.id]);

  return null;
}

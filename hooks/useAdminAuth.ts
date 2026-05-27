"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { adminLogin } from "@/lib/api/admin-auth";
import { clearSession, setSession } from "@/lib/auth";
import type { LoginPayload } from "@/types/auth";

export function useAdminAuth() {
  const router = useRouter();
  const authContext = useAuthContext();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(payload: LoginPayload) {
    setIsSubmitting(true);
    setError(null);

    try {
      const session = await adminLogin(payload);
      if (session.user.role !== "admin") {
        setError("This account does not have admin access.");
        return;
      }
      await setSession(session);
      authContext.refreshSession();
      showToast("Admin access verified.", "success");
      const nextPath = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
      router.push(nextPath ?? "/admin/dashboard");
    } catch {
      setError("Unable to sign in. Please check your admin credentials.");
      showToast("Admin sign in failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function signOut() {
    void clearSession();
    authContext.refreshSession();
    showToast("Signed out.", "info");
    router.push("/admin/login");
  }

  return { signIn, signOut, isSubmitting, error, setError };
}

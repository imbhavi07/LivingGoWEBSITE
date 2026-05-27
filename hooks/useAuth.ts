"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { login } from "@/lib/api/auth";
import { clearSession, setSession } from "@/lib/auth";
import type { LoginPayload } from "@/types/auth";

export function useAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authContext = useAuthContext();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(payload: LoginPayload) {
    setIsSubmitting(true);
    setError(null);

    try {
      const session = await login(payload);
      await setSession(session);
      authContext.refreshSession();
      showToast("Signed in successfully.", "success");
      router.push(searchParams.get("next") ?? "/wishlist");
    } catch {
      setError("Unable to sign in. Please check your credentials.");
      showToast("Unable to sign in.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function signOut() {
    void clearSession();
    authContext.refreshSession();
    showToast("Signed out.", "info");
    router.push("/login");
  }

  return { signIn, signOut, isSubmitting, error, setError };
}

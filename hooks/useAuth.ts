"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useClerk } from "@clerk/nextjs";
import { login } from "@/lib/api/auth";
import { clearSession, setSession } from "@/lib/auth";
import type { LoginPayload } from "@/types/auth";

export function useAuth() {
  const router = useRouter();
  const authContext = useAuthContext();
  const { showToast } = useToast();
  const { signOut: clerkSignOut } = useClerk();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(payload: LoginPayload) {
    setIsSubmitting(true);
    setError(null);

    try {
      const session = await login(payload);
      await setSession(session);
      authContext.refreshSession();
      await new Promise(resolve => setTimeout(resolve, 0));
      showToast("Admin access verified.", "success");
      router.push("/admin/dashboard");
    } catch {
      setError("Unable to sign in. Please check your credentials.");
      showToast("Unable to sign in.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signOut() {
  await clerkSignOut();
  void clearSession();
  authContext.refreshSession();
  showToast("Signed out.", "info");
  router.push("/login");
}

  return { signIn, signOut, isSubmitting, error, setError };
}
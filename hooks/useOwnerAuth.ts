"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { ownerLogin, ownerSignup, sendOwnerOtp, verifyOwnerOtp } from "@/lib/api/owner-auth";
import { clearSession, setSession } from "@/lib/auth";
import { useClerk } from "@clerk/nextjs";
import { getApiErrorMessage } from "@/lib/api/client";
import type { LoginPayload, OwnerOtpPayload, OwnerOtpVerifyPayload, SignupPayload } from "@/types/auth";

export function useOwnerAuth() {
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
      const session = await ownerLogin(payload);
      if (session.user.role !== "owner" && session.user.role !== "admin") {
        setError("This account does not have owner access.");
        return;
      }
      await setSession(session);
      authContext.refreshSession();
      showToast("Owner signed in.", "success");
      const nextPath = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
      router.push(nextPath ?? "/owner/dashboard");
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to sign in. Please check your owner credentials.");
      setError(message);
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signUp(payload: SignupPayload) {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await ownerSignup(payload);
      showToast(result.message, "success");
      router.push("/owner/login");
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to create owner account right now.");
      setError(message);
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function requestOtp(payload: OwnerOtpPayload) {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await sendOwnerOtp(payload);
      showToast(result.message, "success");
      return result;
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not send OTP.");
      setError(message);
      showToast(message, "error");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmOtp(payload: OwnerOtpVerifyPayload) {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await verifyOwnerOtp(payload);
      showToast(result.message, "success");
      return result;
    } catch (error) {
      const message = getApiErrorMessage(error, "OTP verification failed.");
      setError(message);
      showToast(message, "error");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function signOut() {
  await clerkSignOut();
  void clearSession();
  authContext.refreshSession();
  showToast("Signed out.", "info");
  router.push("/owner/login");
  }

  return { signIn, signUp, signOut, requestOtp, confirmOtp, isSubmitting, error, setError };
}

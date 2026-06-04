"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { useClerk } from "@clerk/nextjs";

export function useOwnerAuth() {
  const router = useRouter();
  const { showToast } = useToast();
  const { signOut: clerkSignOut } = useClerk();

  async function signOut() {
    await clerkSignOut();
    showToast("Signed out.", "info");
    router.push("/owner/login");
  }

  return { signOut };
}
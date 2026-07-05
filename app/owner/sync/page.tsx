"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

export default function OwnerSyncPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      router.replace("/owner/login");
      return;
    }

    const syncRole = async () => {
      try {
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName || "",
            intendedRole: 'owner' // STRICTLY owner
          })
        });
        
        await user.reload(); // Refresh Clerk locally so middleware instantly sees "owner"
        router.replace('/owner/dashboard');
      } catch (error) {
        console.error("Owner sync failed:", error);
        router.replace('/owner/dashboard'); // Fallback
      }
    };

    syncRole();
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linen">
      <Building2 className="mb-4 h-12 w-12 animate-pulse text-ink" />
      <p className="text-lg font-black text-ink">Preparing your owner workspace...</p>
    </div>
  );
}
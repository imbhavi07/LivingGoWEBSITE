"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";

export default function StudentSyncPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      router.replace("/login");
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
            intendedRole: 'student' // STRICTLY student
          })
        });
        
        await user.reload(); // Refresh Clerk locally
        router.replace('/listings');
      } catch (error) {
        console.error("Student sync failed:", error);
        router.replace('/listings'); // Fallback
      }
    };

    syncRole();
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linen">
      <GraduationCap className="mb-4 h-12 w-12 animate-pulse text-ink" />
      <p className="text-lg font-black text-ink">Getting things ready...</p>
    </div>
  );
}
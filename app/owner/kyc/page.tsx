"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, Clock, ShieldCheck, XCircle } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Suspense } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { Button } from "@/components/Button";
import { useSearchParams } from "next/navigation";

type KYCStatus = "checking" | "form" | "submitting" | "submitted" | "already_pending" | "approved" | "rejected";

async function getClerkToken() {
  const clerk = (window as unknown as {
    Clerk?: { session?: { getToken: () => Promise<string> } }
  }).Clerk;
  return clerk?.session?.getToken() ?? null;
}

function KYCContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const { signOut } = useClerk();
  const sessionId = searchParams.get("session_id");

  // Removed fullName and phoneNumber states entirely!
  const [isAgreed, setIsAgreed] = useState(false);
  const [status, setStatus] = useState<KYCStatus>("checking");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 1. Existing Status Check - wrapped in useCallback to prevent stale closures
  const checkStatus = useCallback(async () => {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) { setStatus("form"); return; }
      try {
        const token = await getClerkToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/owner/kyc/status?email=${encodeURIComponent(email)}`,
          { headers: { Authorization: `Bearer ${token ?? ""}` } }
        );
        if (!res.ok) { setStatus("form"); return; }
        const data = await res.json();
        const vs = data.data?.verificationStatus;
        if (vs === "approved") setStatus("approved");
        else if (vs === "rejected") setStatus("rejected")
        else setStatus("form");
      } catch {
        setStatus("form");
      }
    }, [user]); // Only depend on user since getClerkToken doesn't change

  // 1. Existing Status Check
  useEffect(() => {
    if (!isLoaded) return;
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) { setStatus("form"); return; }
    // ... keep your existing checkStatus() logic here ...
    checkStatus();
  }, [user, isLoaded, checkStatus]);

  // 2. NEW: The Session Catcher
  useEffect(() => {
    const completeSession = async () => {
      if (!sessionId || !user?.primaryEmailAddress?.emailAddress) return;

      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/owner/kyc/digilocker/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.primaryEmailAddress.emailAddress,
            sessionId: sessionId
          }),
        });

        if (res.ok) {
          // Clear the session_id from the URL so it doesn't loop
          window.history.replaceState(null, "", "/owner/kyc");
          // Update local state to show your "Application under review" UI
          setStatus("already_pending");
        } else {
          setErrorMessage("Failed to process verified data.");
        }
      } catch {
        setErrorMessage("Something went wrong verifying the session.");
      } finally {
        setIsLoading(false);
      }
    };

    // Only run this if we have a session ID and haven't verified yet
    if (sessionId && status === "form") {
      completeSession();
    }
  }, [sessionId, user, status]);

  // Call checkStatus after defining it - but only if we have user data
  useEffect(() => {
    if (user && isLoaded) {
      checkStatus();
    }
  }, [user, isLoaded, checkStatus]);

  if (status === "checking") return null;

  if (status === "submitted" || status === "already_pending") {
    return (
      <OwnerShell>
        <div className="mx-auto max-w-lg">
          <div className="rounded-3xl bg-white p-8 shadow-soft text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-black text-ink">Application under review</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Your KYC details have been submitted and are pending admin review.
              You will be able to list properties once approved — usually within 12-24 business hours.
            </p>
            <div className="mt-6 rounded-2xl bg-linen p-4 text-left text-xs text-muted space-y-1">
              <p className="font-bold text-ink text-sm mb-2">What happens next?</p>
              <p>✓ Admin reviews your Aadhaar documents</p>
              <p>✓ Identity is verified against registration details</p>
              <p>✓ You receive access to list properties</p>
            </div>
            <button
              onClick={async () => {
                await user?.reload();
                window.location.href = '/owner/dashboard';
              }}
              className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-white"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </OwnerShell>
    );
  }

  if (status === "approved") {
    return (
      <OwnerShell>
        <div className="mx-auto max-w-lg">
          <div className="rounded-3xl bg-white p-8 shadow-soft text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-black text-ink">KYC Approved!</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Your identity has been verified. Please sign in again to access your dashboard.
            </p>
            <button
              onClick={() => void signOut({ redirectUrl: "/owner/login" })}
              className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-white"
            >
              Sign in to continue →
            </button>
          </div>
        </div>
      </OwnerShell>
    );
  }

  if (status === "rejected") {
    return (
      <OwnerShell>
        <div className="mx-auto max-w-lg">
          <div className="rounded-3xl bg-white p-8 shadow-soft text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-ink">KYC Rejected</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Please resubmit with correct documents. Make sure your Aadhaar images are clear and match the details entered.
            </p>
            <button
              onClick={() => setStatus("form")}
              className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-white"
            >
              Resubmit KYC
            </button>
          </div>
        </div>
      </OwnerShell>
    );
  }

  // Fixed FormEvent deprecation by using React.FormEvent instead
  const handleDigilockerRedirect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Stops the page from refreshing

    if (!isAgreed) {
      setErrorMessage("You must agree to the agreements before verifying.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) throw new Error("User email not found. Please sign in again.");

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, ''); // Removes /api if it exists at the end
      const res = await fetch(
      `${baseUrl}/api/owner/kyc/digilocker/init?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data.message || "Failed to initiate secure redirect");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
      setIsLoading(false);
    }
  };

  return (
    <OwnerShell>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase text-clay">Identity verification</p>
        <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Complete KYC</h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-muted">
          Required before you can list properties. Verify your identity securely via Aadhaar OTP.
        </p>
      </div>

      <div className="mb-8 flex items-center gap-3 text-sm font-semibold">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-black text-white">1</span>
        <span className="text-ink">Account created</span>
        <span className="text-muted">→</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-clay text-xs font-black text-white">2</span>
        <span className="text-ink">KYC verification</span>
        <span className="text-muted">→</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linen text-xs font-black text-muted">3</span>
        <span className="text-muted">List properties</span>
      </div>

      <form onSubmit={handleDigilockerRedirect} className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-soft sm:p-8 space-y-6">

        {/* Checkbox Section */}
        <label className="flex items-start gap-3 rounded-3xl bg-linen p-4 text-sm leading-6 text-ink">
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-ink cursor-pointer"
          />
          <span>
            I agree to the <Link href="/legal/retainer-agreement" target="_blank" className="font-bold underline">Exclusive Inventory Agreement</Link>, <Link href="/legal/standard-commission-agreement" target="_blank" className="font-bold underline">Platform Listing Agreement</Link>, and <Link href="/legal/privacy-policy" target="_blank" className="font-bold underline">Privacy Policy</Link>.
          </span>
        </label>

        {/* Security Badge */}
        <div className="flex items-start gap-3 rounded-2xl bg-linen p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-clay" aria-hidden />
          <p className="text-xs leading-5 text-muted">
            Your identity data is encrypted and only visible to LivingGo admins for verification. It is never shared publicly.
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="rounded-md bg-red-50 p-3 text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex flex-col items-center">
          <Button
            type="submit"
            disabled={isLoading || !isAgreed}
            className="w-full px-6 py-3 bg-[#4A3B2C] text-white rounded-xl font-medium hover:bg-[#3A2A1D] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center h-12"
          >
            {isLoading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              "Verify via DigiLocker"
            )}
          </Button>
          <p className="text-xs text-gray-400 mt-4 text-center max-w-xs leading-relaxed">
            You will be redirected securely to the official portal. Login seamlessly using your registered mobile number.
          </p>
        </div>
      </form>
    </OwnerShell>
  );
}

// 2. Export the page with Suspense
export default function OwnerKYCPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-10">Loading verification...</div>}>
      <KYCContent />
    </Suspense>
  );
}
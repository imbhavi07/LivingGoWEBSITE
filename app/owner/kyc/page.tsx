"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, ShieldCheck, XCircle } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { Button } from "@/components/Button";

type KYCStatus = "checking" | "form" | "submitting" | "submitted" | "already_pending" | "approved" | "rejected";

async function getClerkToken() {
  const clerk = (window as unknown as {
    Clerk?: { session?: { getToken: () => Promise<string> } }
  }).Clerk;
  return clerk?.session?.getToken() ?? null;
}

export default function OwnerKYCPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [status, setStatus] = useState<KYCStatus>("checking");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) { setStatus("form"); return; }

    async function checkStatus() {
      try {
        const token = await getClerkToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/owner/kyc/status?email=${encodeURIComponent(email!)}`,
          { headers: { Authorization: `Bearer ${token ?? ""}` } }
        );
        if (!res.ok) { setStatus("form"); return; }
        const data = await res.json();
        const vs = data.data?.verificationStatus;
        if (vs === "approved") setStatus("approved");
        else if (vs === "pending_approval") setStatus("already_pending");
        else if (vs === "rejected") setStatus("rejected");
        else setStatus("form");
      } catch {
        setStatus("form");
      }
    }
    void checkStatus();
  }, [user, isLoaded]);

  const handleDigilockerRedirect = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setErrorMessage("");

  try {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) throw new Error("User email not found. Please sign in again.");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/owner/kyc/digilocker/init?email=${encodeURIComponent(email)}`
    );
    const data = await res.json();

    if (data.redirectUrl) {
      // Hands the user over to the official DigiLocker mobile-login screen
      window.location.href = data.redirectUrl;
    } else {
      throw new Error(data.message || "Failed to initiate secure redirect");
    }
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    setIsLoading(false);
  }
};

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

      <form onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-soft sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-bold text-ink">Full name</span>
            <input name="name" className="input" defaultValue={user?.fullName ?? ""} required />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-bold text-ink">Phone number</span>
            <input name="phone" className="input" inputMode="numeric" placeholder="10-digit mobile number" required />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-bold text-ink">Owner type</span>
            <select name="ownerType" className="input" defaultValue="PG Owner">
              <option value="PG Owner">PG Owner</option>
              <option value="Flat Owner">Flat Owner</option>
            </select>
          </label>
                    <label className="flex items-start gap-3 rounded-3xl bg-linen p-4 text-sm leading-6 text-ink sm:col-span-2">
            <input name="legalAccepted" type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-ink" required />
            <span>
              I agree to the{" "}
              <Link href="/legal/retainer-agreement" target="_blank" className="font-bold underline">Exclusive Inventory Agreement</Link>,{" "}
              <Link href="/legal/standard-commission-agreement" target="_blank" className="font-bold underline">Platform Listing Agreement</Link>, and{" "}
              <Link href="/legal/privacy-policy" target="_blank" className="font-bold underline">Privacy Policy</Link>.
            </span>
          </label>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-linen p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-clay" aria-hidden />
          <p className="text-xs leading-5 text-muted">
            Your identity data is encrypted and only visible to LivingGo admins for verification. It is never shared publicly.
          </p>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-2xl bg-linen p-3 text-sm font-semibold text-clay">{errorMessage}</p>
        )}

        {/* Error message slot */}
        {errorMessage && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        {/* DigiLocker Call to Action */}
        <div className="mt-8 flex flex-col items-center">
          <Button
            onClick={handleDigilockerRedirect}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-[#4A3B2C] text-white rounded-xl font-medium hover:bg-[#3A2A1D] transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Connecting securely...
              </>
            ) : (
              "Verify via DigiLocker"
            )}
          </Button>
          
          {/* shayad error aaye to yeh message dikhana hai */}
          <p className="text-xs text-gray-400 mt-4 text-center max-w-xs leading-relaxed">
            You will be redirected securely to the official portal. 
            Login seamlessly using your registered mobile number.
          </p>
        </div>
      </form>
    </OwnerShell>
  );
}
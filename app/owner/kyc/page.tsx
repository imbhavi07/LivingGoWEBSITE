"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Clock, ShieldCheck, Upload, XCircle } from "lucide-react";
import { useUser} from "@clerk/nextjs";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { Button } from "@/components/Button";

type KYCStatus = "form" | "submitting" | "submitted" | "already_pending" | "approved" | "rejected";

export default function OwnerKYCPage() {
  const { user } = useUser();
  // const { getToken } = useAuth();
  const [status, setStatus] = useState<KYCStatus>("form");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/owner/kyc/status?email=${encodeURIComponent(email)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const vs = data.data?.verificationStatus;
        if (vs === "approved") setStatus("approved");
        else if (vs === "pending_approval") setStatus("already_pending");
        else if (vs === "rejected") setStatus("rejected");
      } catch {
        // silently fail — show form as default
      }
    }
    void checkStatus();
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const aadhaarNumber = (formData.get("aadhaarNumber") as string)?.trim();
    if (aadhaarNumber.length !== 12 || !/^\d{12}$/.test(aadhaarNumber)) {
      setError("Aadhaar number must be exactly 12 digits.");
      return;
    }

    const aadhaarFront = formData.get("aadhaarFront");
    const aadhaarBack = formData.get("aadhaarBack");

    if (
      !(aadhaarFront instanceof File) || aadhaarFront.size === 0 ||
      !(aadhaarBack instanceof File) || aadhaarBack.size === 0
    ) {
      setError("Please upload both Aadhaar front and back images.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (aadhaarFront.size > maxSize || aadhaarBack.size > maxSize) {
      setError("Each image must be under 5MB.");
      return;
    }

    setError(null);
    setStatus("submitting");

    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) throw new Error("No email found. Please sign in again.");
      formData.append("clerkEmail", email);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/owner/kyc`,
      {
        method: "POST",
        body: formData,
      }
);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Submission failed. Please try again.");
      }

      setStatus("submitted");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("form");
    }
  }

  // ── Status screens ───────────────────────────────────────────────────

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
              You&apos;ll be able to list properties once approved — usually within 1–2 business days.
            </p>
            <div className="mt-6 rounded-2xl bg-linen p-4 text-left text-xs text-muted space-y-1">
              <p className="font-bold text-ink text-sm mb-2">What happens next?</p>
              <p>✓ Admin reviews your Aadhaar documents</p>
              <p>✓ Identity is verified against registration details</p>
              <p>✓ You receive access to list properties</p>
            </div>
            <Link
              href="/owner/dashboard"
              className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-white"
            >
              Go to Dashboard
            </Link>
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
              Your identity has been verified. You can now list properties on LivingGo.
            </p>
            <Link
              href="/owner/properties/new"
              className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-white"
            >
              Add your first property →
            </Link>
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

  // ── KYC Form ─────────────────────────────────────────────────────────

  return (
    <OwnerShell>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase text-clay">Identity verification</p>
        <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Complete KYC</h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-muted">
          Required before you can list properties. Your Aadhaar details are reviewed by our admin team and never shared publicly.
        </p>
      </div>

      {/* Steps */}
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

      <form onSubmit={handleSubmit} className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-soft sm:p-8">
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
          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-bold text-ink">Aadhaar number</span>
            <input name="aadhaarNumber" className="input" inputMode="numeric" minLength={12} maxLength={12} placeholder="12-digit Aadhaar number" required />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-bold text-ink">Aadhaar front</span>
            <div className="relative">
              <input name="aadhaarFront" type="file" accept="image/*"
                className="input py-1 pr-12 file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-3 file:py-2 file:text-white" required />
              <Upload className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            </div>
            <p className="text-xs text-muted">JPG/PNG, max 5MB</p>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-bold text-ink">Aadhaar back</span>
            <div className="relative">
              <input name="aadhaarBack" type="file" accept="image/*"
                className="input py-1 pr-12 file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-3 file:py-2 file:text-white" required />
              <Upload className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            </div>
            <p className="text-xs text-muted">JPG/PNG, max 5MB</p>
          </label>
          <label className="flex items-start gap-3 rounded-3xl bg-linen p-4 text-sm leading-6 text-ink sm:col-span-2">
            <input name="legalAccepted" type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-ink" required />
            <span>
              I confirm these Aadhaar details are valid and I agree to the{" "}
              <Link href="/legal/retainer-agreement" target="_blank" className="font-bold underline">Exclusive Inventory Agreement</Link>,{" "}
              <Link href="/legal/standard-commission-agreement" target="_blank" className="font-bold underline">Platform Listing Agreement</Link>, and{" "}
              <Link href="/legal/privacy-policy" target="_blank" className="font-bold underline">Privacy Policy</Link>.
            </span>
          </label>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-linen p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-clay" aria-hidden />
          <p className="text-xs leading-5 text-muted">
            Your Aadhaar details are encrypted and only visible to LivingGo admins for verification. They are never shared publicly.
          </p>
        </div>

        {error && (
          <p className="mt-4 rounded-2xl bg-linen p-3 text-sm font-semibold text-clay">{error}</p>
        )}

        <Button className="mt-6 w-full" disabled={status === "submitting"}>
          {status === "submitting" ? "Submitting..." : "Submit for approval"}
        </Button>
      </form>
    </OwnerShell>
  );
}
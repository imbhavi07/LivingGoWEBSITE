"use client";

// components/LockPropertyModal.tsx  (NEW FILE)

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { X, QrCode, CheckCircle, Loader2, AlertCircle, Copy } from "lucide-react";
import { submitTokenPayment } from "@/lib/api/token-payment";

type LockPropertyModalProps = {
  propertyId: string;
  propertyTitle: string;
  monthlyRent: number;
  onClose: () => void;
};

type Step = "info" | "qr" | "utr" | "success" | "error";

// UPI QR: generates a UPI deep-link QR using a free QR API
// Replace UPI_ID with your actual UPI ID
const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID ?? "livinggo@upi";

export function LockPropertyModal({ propertyId, propertyTitle, monthlyRent, onClose }: LockPropertyModalProps) {
  const { getToken } = useAuth();
  const tokenAmount = Math.ceil(monthlyRent / 2);

  const [step, setStep] = useState<Step>("info");
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // UPI payment link
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=LivingGo&am=${tokenAmount}&cu=INR&tn=Token+for+${encodeURIComponent(propertyTitle)}`;
  // QR code via Google Charts API (free, no key needed)
  const qrUrl = `https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=${encodeURIComponent(upiLink)}&choe=UTF-8`;

  function copyUpi() {
    void navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit() {
    if (!utrNumber.trim()) {
      setUtrError("Please enter your UTR number");
      return;
    }
    if (utrNumber.trim().length < 10) {
      setUtrError("UTR number must be at least 10 characters");
      return;
    }
    setUtrError(null);
    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not logged in");
      await submitTokenPayment(token, propertyId, utrNumber.trim());
      setStep("success");
    } catch (err: unknown) {
      setUtrError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <h2 className="text-lg font-black text-ink">Lock Property</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-linen transition-colors" aria-label="Close">
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        <div className="px-6 py-5">

          {/* ── STEP 1: Info ─────────────────────────────────────────────── */}
          {step === "info" && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-sm font-bold text-amber-800 mb-1">📋 How locking works</p>
                <ul className="text-sm text-amber-700 space-y-1.5 list-disc list-inside">
                  <li>Pay a token amount to reserve this PG</li>
                  <li>Admin verifies your payment (UTR number)</li>
                  <li>Once approved, full address is revealed</li>
                  <li>Owner is notified and contacts you</li>
                </ul>
              </div>

              <div className="rounded-2xl bg-linen p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Property</span>
                  <span className="text-sm font-bold text-ink text-right max-w-[60%] truncate">{propertyTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Monthly Rent</span>
                  <span className="text-sm font-bold text-ink">₹{monthlyRent.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between border-t border-black/5 pt-3">
                  <span className="text-sm font-bold text-ink">Token Amount (50%)</span>
                  <span className="text-lg font-black text-ink">₹{tokenAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={() => setStep("qr")}
                className="w-full rounded-2xl bg-ink py-3 text-sm font-bold text-white hover:bg-ink/90 transition-colors flex items-center justify-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                Proceed to Pay ₹{tokenAmount.toLocaleString("en-IN")}
              </button>
            </div>
          )}

          {/* ── STEP 2: QR Code ──────────────────────────────────────────── */}
          {step === "qr" && (
            <div className="space-y-5">
              <p className="text-sm text-muted text-center">
                Scan the QR with any UPI app to pay <span className="font-black text-ink">₹{tokenAmount.toLocaleString("en-IN")}</span>
              </p>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="rounded-2xl border-2 border-black/10 p-3 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="UPI QR Code" width={220} height={220} className="rounded-xl" />
                </div>
              </div>

              {/* UPI ID copy */}
              <div className="flex items-center gap-3 rounded-2xl bg-linen px-4 py-3">
                <div className="flex-1">
                  <p className="text-xs text-muted">UPI ID</p>
                  <p className="text-sm font-bold text-ink">{UPI_ID}</p>
                </div>
                <button
                  onClick={copyUpi}
                  className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-ink border border-black/10 hover:bg-ink hover:text-white transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="rounded-xl bg-blue-50 px-4 py-2 text-xs text-blue-700 font-medium">
                💡 Also works with: Google Pay, PhonePe, Paytm, BHIM, or any bank UPI app
              </div>

              <button
                onClick={() => setStep("utr")}
                className="w-full rounded-2xl bg-ink py-3 text-sm font-bold text-white hover:bg-ink/90 transition-colors"
              >
                I've paid — Enter UTR Number →
              </button>

              <button onClick={() => setStep("info")} className="w-full text-center text-sm text-muted hover:text-ink">
                ← Back
              </button>
            </div>
          )}

          {/* ── STEP 3: UTR Entry ─────────────────────────────────────────── */}
          {step === "utr" && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-700">
                ✓ Payment of <span className="font-black">₹{tokenAmount.toLocaleString("en-IN")}</span> initiated. Enter your UTR to confirm.
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  UTR / Transaction Reference Number
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => { setUtrNumber(e.target.value); setUtrError(null); }}
                  placeholder="e.g. 407612345678"
                  className="w-full rounded-xl border border-black/10 bg-linen px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ink/20"
                  autoFocus
                />
                {utrError && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {utrError}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted">
                  Find the UTR in your UPI app under transaction details after payment.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full rounded-2xl bg-ink py-3 text-sm font-bold text-white hover:bg-ink/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? "Submitting…" : "Submit for Admin Approval"}
              </button>

              <button onClick={() => setStep("qr")} className="w-full text-center text-sm text-muted hover:text-ink">
                ← Back to QR
              </button>
            </div>
          )}

          {/* ── STEP 4: Success ───────────────────────────────────────────── */}
          {step === "success" && (
            <div className="space-y-5 text-center py-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-ink">Payment Submitted!</h3>
                <p className="mt-2 text-sm text-muted">
                  Your token payment is under admin review. You'll see the full address and owner details once approved.
                </p>
              </div>
              <div className="rounded-2xl bg-linen p-4 text-left space-y-2">
                <p className="text-xs font-bold text-muted uppercase">What happens next</p>
                <div className="flex items-start gap-2 text-sm text-ink">
                  <span className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-amber-100 text-amber-700 text-xs font-black flex items-center justify-center">1</span>
                  Admin verifies your UTR (usually within 24 hours)
                </div>
                <div className="flex items-start gap-2 text-sm text-ink">
                  <span className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-amber-100 text-amber-700 text-xs font-black flex items-center justify-center">2</span>
                  Full property address is revealed on your dashboard
                </div>
                <div className="flex items-start gap-2 text-sm text-ink">
                  <span className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-amber-100 text-amber-700 text-xs font-black flex items-center justify-center">3</span>
                  Owner is notified and will contact you
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full rounded-2xl bg-ink py-3 text-sm font-bold text-white hover:bg-ink/90 transition-colors"
              >
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
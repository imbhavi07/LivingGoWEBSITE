"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import confetti from 'canvas-confetti';

// Confetti celebration function
function triggerConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#22c55e', '#eab308', '#ffffff'],
  });
}

type LockPropertyModalProps = {
  propertyId: string;
  propertyTitle: string;
  monthlyRent: number;
  onClose: () => void;
};

type Step = "info" | "payment" | "loading" | "success" | "error";

export function LockPropertyModal({ propertyId, propertyTitle, monthlyRent, onClose }: LockPropertyModalProps) {
  const tokenAmount = Math.ceil(monthlyRent / 2);
  const router = useRouter();

  // CHANGE THIS TO THE ACTUAL COMPANY UPI ID
  const COMPANY_UPI_ID = "tejas251275@ibl"; 
  const COMPANY_NAME = "LivingGo";

  const [step, setStep] = useState<Step>("info");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [finalAmount, setFinalAmount] = useState(tokenAmount);
  
  // Payment state
  const [utrNumber, setUtrNumber] = useState("");
  const [upiIntentString, setUpiIntentString] = useState("");

  // Trigger confetti when success step is reached
  useEffect(() => {
    if (step === "success") {
      triggerConfetti();
    }
  }, [step]);

  useEffect(() => {
    const final = tokenAmount - discountAmount;
    setFinalAmount(final);
    // Dynamically generate the precise UPI string for the QR code
    setUpiIntentString(`upi://pay?pa=${COMPANY_UPI_ID}&pn=${encodeURIComponent(COMPANY_NAME)}&am=${final}&cu=INR&tn=Token%20for%20${encodeURIComponent(propertyTitle.substring(0,20))}`);
  }, [tokenAmount, discountAmount, propertyTitle]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a referral or coupon code");
      return;
    }

    setApplyingCoupon(true);
    setCouponError(null);

    try {
      const response = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          purchaseAmount: tokenAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to apply code");
      }

      setDiscountAmount(data.data.discount_amount || 0);
      setCouponError(null);
    } catch (err: unknown) {
      setCouponError((err as Error).message || "An error occurred");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleSubmitUtr = async () => {
    if (utrNumber.length < 12) {
      setErrorMessage("Please enter a valid 12-digit UTR/Reference number.");
      return;
    }

    setStep("loading");
    setErrorMessage(null);

    try {
      // Send UTR and booking details to your database for admin verification
      const verifyRes = await fetch("/api/payments/submit-utr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          amount: finalAmount,
          utrNumber,
          appliedCode: couponCode.trim() || undefined,
        }),
      });

      if (!verifyRes.ok) {
        throw new Error("Failed to submit transaction details. Please try again.");
      }

      setStep("success");
    } catch (err: unknown) {
      setStep("error");
      setErrorMessage(err instanceof Error ? err.message : "Error submitting transaction.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && step !== "loading") onClose(); }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-black text-ink">Lock Property</h2>
          {step !== "loading" && (
            <button onClick={onClose} className="rounded-full p-2 hover:bg-linen transition-colors" aria-label="Close">
              <X className="h-5 w-5 text-muted" />
            </button>
          )}
        </div>

        <div className="px-6 py-5">

          {/* ── STEP 1: Core Summary & Coupon ─────────────────────────────── */}
          {step === "info" && (
            <div className="space-y-5">
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

                {/* Coupon Section */}
                <div className="mt-4 pt-3 border-t border-black/5">
                  <h3 className="text-sm font-bold text-ink mb-2">Apply Referral/Coupon Code</h3>
                  {couponError && (
                    <div className="mb-2 p-2 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs font-semibold">
                      {couponError}
                    </div>
                  )}
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="e.g. BHAVI500"
                      className="flex-1 px-3 py-2 bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink transition-all duration-200 text-sm font-mono"
                      disabled={applyingCoupon}
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                      className={`px-4 py-2 bg-ink text-white rounded-xl font-bold text-sm hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                  {discountAmount > 0 && (
                    <div className="mt-2 p-3 bg-moss/10 rounded-xl border border-moss/20">
                      <div className="flex justify-between text-sm mt-1">
                        <span className="font-semibold text-moss">Discount Applied:</span>
                        <span className="font-bold text-moss">-₹{discountAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center px-2">
                <span className="text-sm font-bold text-muted">Total Payable</span>
                <span className="text-2xl font-black text-ink">₹{finalAmount.toLocaleString("en-IN")}</span>
              </div>

              <button
                onClick={() => setStep("payment")}
                className="w-full rounded-2xl bg-ink py-4 text-sm font-black text-white hover:bg-ink/90 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                  <ShieldCheck className="h-5 w-5" />
                  Proceed To Pay Securely
              </button>
            </div>
          )}

          {/* ── STEP 2: Direct UPI QR Code & UTR Collection ───────────────── */}
          {step === "payment" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h3 className="text-xl font-black text-ink">Scan to Pay</h3>
                <p className="text-sm text-muted mt-1">Use GPay, PhonePe, or Paytm</p>
              </div>

              <div className="flex justify-center bg-white p-4 rounded-3xl border-2 border-linen mx-auto w-fit shadow-sm">
                <QRCode value={upiIntentString} size={180} level="H" />
              </div>

              <div className="bg-linen p-4 rounded-2xl text-center space-y-1">
                <p className="text-xs text-muted uppercase font-bold">Paying to</p>
                <p className="text-sm font-black text-ink">{COMPANY_NAME}</p>
                <p className="text-2xl font-black text-ink mt-2">₹{finalAmount.toLocaleString("en-IN")}</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-ink flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-moss" />
                  Enter 12-Digit UTR Number
                </label>
                <input
                  type="number"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.slice(0, 12))}
                  placeholder="e.g. 312456789012"
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink transition-all duration-200 text-lg tracking-widest font-mono"
                />
                {errorMessage && <p className="text-xs text-red-500 font-semibold">{errorMessage}</p>}
                <p className="text-xs text-muted">You can find the UTR or Ref number in your UPI app&apos;s transaction history.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("info")}
                  className="w-1/3 rounded-2xl bg-linen py-3 text-sm font-bold text-ink hover:bg-black/5 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitUtr}
                  disabled={utrNumber.length < 12}
                  className="w-2/3 rounded-2xl bg-ink py-3 text-sm font-bold text-white hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  Submit Payment
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Processing state spinner ────────────────────────── */}
          {step === "loading" && (
            <div className="space-y-4 text-center py-10">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-ink" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">Recording Transaction...</h3>
                <p className="text-xs text-muted mt-1 px-4">
                  Securing your booking and updating the dashboard.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 4: Error handler ───────────────────── */}
          {step === "error" && (
            <div className="space-y-5 text-center py-6">
              <div className="flex justify-center">
                <AlertCircle className="h-14 w-14 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">Submission Failed</h3>
                <p className="mt-1 text-sm text-red-600 font-medium px-2">{errorMessage}</p>
              </div>
              <button
                onClick={() => setStep("payment")}
                className="w-full rounded-2xl bg-ink py-3 text-sm font-bold text-white hover:bg-ink/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ── STEP 5: Success confirmation screen ──────────────────────── */}
          {step === "success" && (
            <div className="space-y-5 text-center py-6">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-moss" />
              </div>
              <div>
                <h3 className="text-xl font-black text-ink">Booking Requested!</h3>
                <p className="mt-2 text-sm text-muted">
                  Your UTR has been submitted securely. Our team will verify the transaction and unlock your dashboard shortly.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  router.push("/student/dashboard");
                }}
                className="w-full rounded-2xl bg-ink py-3 text-sm font-bold text-white hover:bg-ink/90 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
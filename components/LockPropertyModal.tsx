"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

type LockPropertyModalProps = {
  propertyId: string;
  propertyTitle: string;
  monthlyRent: number;
  onClose: () => void;
};

type Step = "info" | "loading" | "success" | "error";

// Explicit type structures to eliminate 'any' completely
interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string | undefined;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  config?: Record<string, unknown>;
  prefill?: {
    method: string;
  };
  theme?: {
    color: string;
  };
  handler: (response: RazorpayPaymentResponse) => void | Promise<void>;
  modal?: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

export function LockPropertyModal({ propertyId, propertyTitle, monthlyRent, onClose }: LockPropertyModalProps) {
  const tokenAmount = Math.ceil(monthlyRent / 2);
  const router = useRouter();

  const [step, setStep] = useState<Step>("info");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load Razorpay Standard Checkout Script Dynamically when modal mounts
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  async function handleRazorpayPayment() {
    setStep("loading");
    setErrorMessage(null);

    try {
      // 1. Fire Request to your Next.js backend to generate Split Order ID
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, amount: tokenAmount }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize booking session. Try again.");
      }

      const orderData = (await response.json()) as { id: string };

      // 2. Map options to force standard web checkout layout and isolate payment methods exclusively to UPI
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Loaded from your config variables
        amount: tokenAmount * 100, // Razorpay works strictly in subunit paisa (e.g. ₹7,500 = 750000)
        currency: "INR",
        name: "LivingGo",
        description: `Token deposit for ${propertyTitle}`,
        order_id: orderData.id,
        
        config: {
          display: {
            // This blacklists all the expensive payment methods
            hide: [
              { method: "card" },
              { method: "netbanking" },
              { method: "wallet" },
              { method: "emi" },
              { method: "paylater" }
            ],
            preferences: { 
              show_default_blocks: true 
            },
          },
        },
        
        prefill: {
          method: "upi",
        },
        
        theme: {
          color: "#111111", // Matches your sleek text-ink brand styling
        },
        
        // Handlers fire instantly when customer completes secure biometric verification on phone
        handler: async function (paymentResponse: RazorpayPaymentResponse) {
          setStep("loading");
          try {
            // Confirm transaction state safely on your backend servers via cryptographic check
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                propertyId,
              }),
            });

            if (verifyRes.ok) {
              setStep("success");
            } else {
              throw new Error("Payment validation failed. Contact support.");
            }
          } catch (err: unknown) {
            setStep("error");
            setErrorMessage(err instanceof Error ? err.message : "Verification error occurred.");
          }
        },
        modal: {
          ondismiss: function () {
            setStep("info");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err: unknown) {
      setStep("error");
      setErrorMessage(err instanceof Error ? err.message : "Could not process payment initialization.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && step !== "loading") onClose(); }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <h2 className="text-lg font-black text-ink">Lock Property</h2>
          {step !== "loading" && (
            <button onClick={onClose} className="rounded-full p-2 hover:bg-linen transition-colors" aria-label="Close">
              <X className="h-5 w-5 text-muted" />
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          
          {/* ── STEP 1: Core Summary / Info ─────────────────────────────── */}
          {step === "info" && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                <p className="text-sm font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  Instant Automated Booking
                </p>
                <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside opacity-90">
                  <li>Pay a token amount to instantly secure this PG.</li>
                  <li>System verifies transactions instantly via bank webhooks.</li>
                  <li>No text boxes or manual manual verification numbers needed.</li>
                  <li>Full property dashboard details open up in real time.</li>
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
                onClick={handleRazorpayPayment}
                className="w-full rounded-2xl bg-ink py-3 text-sm font-bold text-white hover:bg-ink/90 transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Pay ₹{tokenAmount.toLocaleString("en-IN")}
              </button>
            </div>
          )}

          {/* ── STEP 2: Processing state spinner ────────────────────────── */}
          {step === "loading" && (
            <div className="space-y-4 text-center py-8">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-ink" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">Securing Your Space...</h3>
                <p className="text-xs text-muted mt-1 px-4">
                  Confirming your UPI transaction with banking networks. Do not close or refresh this page.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 3: Cryptographic failure handler ───────────────────── */}
          {step === "error" && (
            <div className="space-y-5 text-center py-4">
              <div className="flex justify-center">
                <AlertCircle className="h-14 w-14 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-ink">Transaction Incomplete</h3>
                <p className="mt-1 text-sm text-red-600 font-medium px-2">{errorMessage}</p>
              </div>
              <button
                onClick={() => setStep("info")}
                className="w-full rounded-2xl bg-ink py-3 text-sm font-bold text-white hover:bg-ink/90 transition-colors"
              >
                Return to Checkout
              </button>
            </div>
          )}

          {/* ── STEP 4: Success confirmation screen ──────────────────────── */}
          {step === "success" && (
            <div className="space-y-5 text-center py-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-ink">Property Locked!</h3>
                <p className="mt-2 text-sm text-muted">
                  Your payment has been cleared automatically. The full address and owner accounts are unlocked on your active dashboard panels.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  router.refresh(); // Instantly pull updated database records
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
"use client";

import { Suspense, useState } from "react";
import { ShieldCheck, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const ALLOWED_EMAILS = [
  "rctaccommodations@gmail.com",
  "semwalb3@gmail.com",
  "falitnautiyal7@gmail.com",
];

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen animate-pulse bg-[#111315]" />}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const { setError } = useAdminAuth();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);

  async function handleSendOtp(email: string) {
    setIsLoading(true);
    setLocalError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json() as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Failed to send OTP");
      setSelectedEmail(email);
      setStep("otp");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      setLocalError("Enter the 6-digit OTP");
      return;
    }
    setIsLoading(true);
    setLocalError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: selectedEmail, otp }),
        }
      );
      const data = await res.json() as { token?: string; message?: string };
      if (!res.ok) throw new Error(data.message ?? "Invalid OTP");

      // Save token and redirect
      if (data.token) {
        localStorage.setItem("LivingGo_token", data.token);
        localStorage.setItem("LivingGo_user", JSON.stringify({ role: "admin", email: selectedEmail }));
      }
      router.push("/admin/dashboard");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#111315] p-4 text-white lg:grid-cols-[1fr_480px] lg:p-0">
      <section className="hidden flex-col justify-between p-12 lg:flex">
        <div className="flex items-center gap-2 text-2xl font-black">
          <ShieldCheck className="h-7 w-7 text-clay" aria-hidden />
          LivingGo Admin
        </div>
        <div>
          <p className="text-sm font-black uppercase text-clay">Internal moderation</p>
          <h1 className="mt-4 max-w-2xl text-6xl font-black leading-tight">
            Secure controls for platform trust.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/60">
            Review property submissions, remove fake listings, and protect students and owners from spam accounts.
          </p>
        </div>
        <p className="text-sm text-white/45">Admin-only access. OTP verification required.</p>
      </section>

      <section className="flex items-center">
        <div className="mx-auto w-full max-w-md rounded-[2rem] bg-white p-6 text-ink shadow-lift sm:p-8">
          <div className="mb-8 rounded-3xl bg-linen p-4">
            <ShieldCheck className="h-8 w-8 text-clay" aria-hidden />
            <p className="mt-3 text-sm font-bold uppercase text-clay">Admin login</p>
            <h2 className="mt-2 text-3xl font-black">
              {step === "email" ? "Select your email" : "Enter OTP"}
            </h2>
            {step === "otp" && (
              <p className="mt-1 text-sm text-muted">
                OTP sent to {selectedEmail}
              </p>
            )}
          </div>

          {step === "email" ? (
            <div className="space-y-3">
              {ALLOWED_EMAILS.map((email) => (
                <button
                  key={email}
                  type="button"
                  disabled={isLoading}
                  onClick={() => void handleSendOtp(email)}
                  className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-linen px-4 py-4 text-left text-sm font-bold text-ink transition hover:bg-oat disabled:opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-clay" aria-hidden />
                    {email}
                  </div>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-bold">6-digit OTP</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="input text-center text-2xl tracking-[0.5em] font-black"
                  placeholder="······"
                  autoFocus
                />
              </label>
              <Button
                className="w-full"
                disabled={isLoading || otp.length !== 6}
                onClick={() => void handleVerifyOtp()}
              >
                {isLoading ? "Verifying..." : "Verify & Enter Dashboard"}
              </Button>
              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(""); setLocalError(null); }}
                className="w-full text-center text-sm text-muted hover:text-ink"
              >
                Use a different email
              </button>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-2xl bg-linen p-3 text-sm font-semibold text-clay">{error}</p>
          )}
        </div>
      </section>
    </main>
  );
}
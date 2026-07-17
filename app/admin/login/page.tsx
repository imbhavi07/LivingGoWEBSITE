"use client";

import { Suspense, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { setSession } from "@/lib/auth";
import type { AuthUser } from "@/types/auth";  // ← ye bhi add karo

const ALLOWED_EMAILS = [
  "rctaccommodations@gmail.com",
  "semwalb3@gmail.com",
  "falitnautiyal7@gmail.com",
  "shaannothere@gmail.com",
  "techshaan@hotmail.com",
  "faizaanahmedahmed123@gmail.com",
  "faizaanahmed601@gmail.com",
  "parulthakur200504@gmail.com",
  "parulllthakur17@gmail.com",
  "heypragya345@gmail.com"
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
  const auth = useAuthContext();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isValidEmail = ALLOWED_EMAILS.includes(email.trim().toLowerCase());

  async function handleSendOtp() {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        }
      );
      const data = await res.json() as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Failed to send OTP");
      setOtpSent(true);
      setSuccessMsg(`OTP sent to ${email}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp() {
  if (otp.length !== 6) {
    setError("Enter the 6-digit OTP");
    return;
  }
  setIsLoading(true);
  setError(null);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin/verify-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      }
    );
    const data = await res.json() as { token?: string; user?: { role: string; name: string; email: string; id: string }; message?: string };
    if (!res.ok) throw new Error(data.message ?? "Invalid OTP");

    if (data.token && data.user) {
      await setSession({
      token: data.token,
      user: data.user as AuthUser,
      });

      auth.refreshSession();      // ← THIS IS MISSING
    }

    router.push("/admin/dashboard");

    router.push("/admin/dashboard");
  } catch (err) {
    setError(err instanceof Error ? err.message : "OTP verification failed");
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
            Review property submissions, remove fake listings, and protect students and owners.
          </p>
        </div>
        <p className="text-sm text-white/45">Admin-only access. OTP verification required.</p>
      </section>

      <section className="flex items-center">
        <div className="mx-auto w-full max-w-md rounded-[2rem] bg-white p-6 text-ink shadow-lift sm:p-8">
          <div className="mb-8 rounded-3xl bg-linen p-4">
            <ShieldCheck className="h-8 w-8 text-clay " aria-hidden />
            <p className="mt-3 text-sm font-bold uppercase text-clay">Admin login</p>
            <h2 className="mt-2 text-3xl font-black">Sign in securely</h2>
            <p className="mt-1 text-sm text-muted">Only authorized emails can access the admin panel.</p>
          </div>

          <div className="space-y-4">
            {/* Email input */}
            <label className="block space-y-2">
              <span className="text-sm font-bold text-ink">Admin email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setOtpSent(false);
                  setOtp("");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="input"
                placeholder="Enter your admin email"
                disabled={isLoading}
              />
              {email && !isValidEmail && (
                <p className="text-xs font-semibold text-clay">
                  This email is not authorized for admin access.
                </p>
              )}
            </label>

            {/* Send OTP button */}
            <Button
              className="w-full"
              disabled={!isValidEmail || isLoading}
              onClick={() => void handleSendOtp()}
            >
              {isLoading && !otpSent ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending OTP...</>
              ) : otpSent ? "Resend OTP" : "Send OTP"}
            </Button>

            {/* OTP input — only shows after OTP is sent */}
            {otpSent && (
              <div className="space-y-3 rounded-3xl bg-linen p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-ink">Enter OTP</span>
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
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
                  ) : "Enter Admin Dashboard"}
                </Button>
              </div>
            )}

            {successMsg && (
              <p className="rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-700">
                {successMsg}
              </p>
            )}
            {error && (
              <p className="rounded-2xl bg-linen p-3 text-sm font-semibold text-clay">
                {error}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
"use client";

import { FormEvent, Suspense, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/Button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { loginSchema } from "@/lib/validation";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen animate-pulse bg-[#111315]" />}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const auth = useAdminAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password")
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details.");
      auth.setError(null);
      return;
    }

    setError(null);
    await auth.signIn(parsed.data);
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
          <h1 className="mt-4 max-w-2xl text-6xl font-black leading-tight">Secure controls for platform trust.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/60">
            Review property submissions, remove fake listings, and protect students and owners from spam accounts.
          </p>
        </div>
        <p className="text-sm text-white/45">Admin-only access. JWT and role checks required.</p>
      </section>
      <section className="flex items-center">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md rounded-[2rem] bg-white p-6 text-ink shadow-lift sm:p-8">
          <div className="mb-8 rounded-3xl bg-linen p-4">
            <ShieldCheck className="h-8 w-8 text-clay" aria-hidden />
            <p className="mt-3 text-sm font-bold uppercase text-clay">Admin login</p>
            <h2 className="mt-2 text-3xl font-black">Sign in securely</h2>
          </div>
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-bold">Email</span>
              <input name="email" type="email" className="input" required />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-bold">Password</span>
              <input name="password" type="password" className="input" minLength={8} required />
            </label>
          </div>
          {error || auth.error ? <p className="mt-4 rounded-2xl bg-linen p-3 text-sm font-semibold text-clay">{error ?? auth.error}</p> : null}
          <Button className="mt-6 w-full" disabled={auth.isSubmitting}>
            {auth.isSubmitting ? "Verifying..." : "Enter admin dashboard"}
          </Button>
        </form>
      </section>
    </main>
  );
}

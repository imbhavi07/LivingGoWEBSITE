"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/Button";
import { useOwnerAuth } from "@/hooks/useOwnerAuth";

export default function OwnerLoginPage() {
  const { signIn, isSubmitting, error } = useOwnerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="grid min-h-screen bg-linen lg:grid-cols-[1fr_0.9fr] lg:p-0">
      <section className="hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-2xl font-black">LivingGo</Link>
        <div>
          <Building2 className="mb-5 h-10 w-10 text-clay" aria-hidden />
          <h1 className="max-w-xl text-5xl font-black leading-tight">
            Owner tools for premium student housing.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
            Manage listings, approvals, pricing, images, and availability from one calm workspace.
          </p>
        </div>
        <p className="text-sm text-white/60">PG owners and flat owners workspace</p>
      </section>

      <section className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center lg:hidden">
            <Link href="/" className="text-2xl font-black text-ink">LivingGo</Link>
            <p className="mt-1 text-sm text-muted">Owner login</p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-soft">
            <h2 className="text-2xl font-black text-ink">Owner Sign In</h2>
            <p className="mt-1 text-sm text-muted">Access your owner dashboard</p>

            <div className="mt-6 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-bold text-ink">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full"
                  placeholder="your@email.com"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-bold text-ink">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full"
                  placeholder="••••••••"
                />
              </label>

              {error && (
                <p className="rounded-2xl bg-linen p-3 text-sm font-semibold text-clay">
                  {error}
                </p>
              )}

              <Button
                className="w-full"
                disabled={isSubmitting || !email || !password}
                onClick={() => void signIn({ email, password })}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                ) : "Sign in"}
              </Button>

              <p className="text-center text-sm text-muted">
                Do not have an account?{" "}
                <Link href="/owner/signup" className="font-bold text-ink hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
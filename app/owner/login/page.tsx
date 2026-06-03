"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { SignIn } from "@clerk/nextjs";

// Hides email field, divider, continue button — shows Google button only
const googleOnlyAppearance = {
  elements: {
    dividerRow: "hidden",
    formFieldRow: "hidden",
    formButtonPrimary: "hidden",
    footerAction: "hidden",
    footerPages: "hidden",
  },
};

export default function OwnerLoginPage() {
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
            <p className="mt-1 mb-6 text-sm text-muted">Access your owner dashboard</p>

            <div className="flex justify-center">
              <SignIn
                routing="hash"
                fallbackRedirectUrl="/owner/dashboard"
                signUpUrl="/owner/signup"
                appearance={googleOnlyAppearance}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

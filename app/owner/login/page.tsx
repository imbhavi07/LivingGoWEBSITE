"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { SignIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

export default function OwnerLoginPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) return;
    const role = (user.publicMetadata as { role?: string })?.role;
    
    if (role === "owner" || role === "admin") {
      router.replace("/owner/dashboard");
    } else {
      // If logged in but role isn't owner yet, force them through sync
      router.replace("/owner/sync");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || user) return null;

  return (
    <main className="grid min-h-screen bg-linen lg:grid-cols-[1fr_0.9fr]">
      <section className="hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-2xl font-black">LivingGo</Link>
        <div>
          <Building2 className="mb-5 h-10 w-10 text-clay" aria-hidden />
          <h1 className="max-w-xl text-5xl font-black leading-tight">
            Owner tools for premium student housing.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
            Manage listings, approvals, pricing, images, and availability.
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
            <div className="flex flex-col items-center gap-3">
              <SignIn
                routing="hash"
                fallbackRedirectUrl="/owner/sync"
                forceRedirectUrl="/owner/sync"
                signUpUrl="/owner/signup"
                appearance={{
                  elements: { footer: "hidden" },
                }}
              />
              <p className="text-sm text-muted">
                Don&apos;t have an account?{" "}
                <Link href="/owner/signup" className="font-bold text-ink underline">
                  Register as owner
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
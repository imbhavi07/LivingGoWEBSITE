import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Building2 } from "lucide-react";

export default function OwnerLoginPage() {
  return (
    <main className="grid min-h-screen bg-linen lg:grid-cols-[1fr_0.9fr] lg:p-0">
      <section className="hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-2xl font-black">LivingGo</Link>
        <div>
          <Building2 className="mb-5 h-10 w-10 text-clay" aria-hidden />
          <h1 className="max-w-xl text-5xl font-black leading-tight">Owner tools for premium student housing.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/70">Manage listings, approvals, pricing, images, and availability from one calm workspace.</p>
        </div>
        <p className="text-sm text-white/60">PG owners and flat owners workspace</p>
      </section>
      <section className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center lg:hidden">
            <Link href="/" className="text-2xl font-black text-ink">LivingGo</Link>
            <p className="mt-1 text-sm text-muted">Owner login</p>
          </div>
          <SignIn
            routing="hash"
            fallbackRedirectUrl="/owner/dashboard"
            signUpUrl="/owner/signup"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-soft rounded-3xl border-0 bg-white p-6",
                headerTitle: "text-ink font-black",
                headerSubtitle: "text-muted",
                formButtonPrimary: "bg-ink hover:bg-ink/90 rounded-full font-bold text-sm",
                formFieldInput: "rounded-2xl border-black/10 focus:ring-ink",
                footerActionLink: "text-ink font-bold",
              },
            }}
          />
        </div>
      </section>
    </main>
  );
}
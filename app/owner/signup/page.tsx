import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function OwnerSignupPage() {
  return (
    <main className="grid min-h-screen bg-linen lg:grid-cols-[1fr_0.9fr]">
      <section className="hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-2xl font-black">LivingGo</Link>
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-clay">Owner platform</p>
          <h1 className="max-w-xl text-5xl font-black leading-tight">List your PG or flat for student housing.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/70">Create an account, complete KYC verification, and start receiving enquiries from verified students.</p>
        </div>
        <p className="text-sm text-white/40">
          Already have an account?{" "}
          <Link href="/owner/login" className="font-bold text-white/70 underline">Sign in</Link>
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-8">
        <div className="w-full">
          <div className="mb-6 text-center lg:hidden">
            <Link href="/" className="text-2xl font-black text-ink">LivingGo</Link>
            <p className="mt-1 text-sm text-muted">Owner signup</p>
          </div>
          <SignUp
            routing="hash"
            fallbackRedirectUrl="/owner/kyc"
            signInUrl="/owner/login"
            unsafeMetadata={{ role: "owner" }}
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-soft rounded-3xl border-0 bg-white p-6",
                headerTitle: "text-ink font-black",
                headerSubtitle: "text-muted",
                formButtonPrimary: "hidden",
                formFieldRow: "hidden",
                dividerRow: "hidden",
                socialButtonsBlockButton: "bg-white border border-black/10 rounded-2xl font-semibold text-ink hover:bg-linen",
              },
            }}
          />
        </div>
      </section>
    </main>
  );
}

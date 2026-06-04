"use client";

import { Suspense } from "react";  // add Suspense
import { useSearchParams } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { GraduationCap } from "lucide-react";

// Wrap in Suspense because useSearchParams needs it
export default function StudentSignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const hasError = searchParams.get("error") === "no-account";

  return (
    <main className="flex min-h-screen items-center bg-linen px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 rounded-3xl bg-white p-4 shadow-soft">
          <GraduationCap className="h-8 w-8 text-clay" aria-hidden />
          <p className="mt-3 text-sm font-bold uppercase text-clay">Student signup</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Create your account</h1>
        </div>

        {/* ← error banner goes here, above SignUp */}
        {hasError && (
          <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">
            No account found. Please sign up to continue.
          </div>
        )}

        <SignUp
          routing="hash"
          fallbackRedirectUrl="/listings"
          signInUrl="/login"
          unsafeMetadata={{ role: "student" }}
          appearance={googleOnlyAppearance}
        />
      </div>
    </main>
  );
}

const googleOnlyAppearance = {
  elements: {
    dividerRow: "hidden",
    formFieldRow: "hidden",
    formButtonPrimary: "hidden",
  },
};
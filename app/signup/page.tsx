"use client";

import { SignUp } from "@clerk/nextjs";
import { GraduationCap } from "lucide-react";

// Hides email field, divider, continue button — shows Google button only
const googleOnlyAppearance = {
  elements: {
    dividerRow: "hidden",
    formFieldRow: "hidden",
    formButtonPrimary: "hidden",
  },
};

export default function StudentSignupPage() {
  return (
    <main className="flex min-h-screen items-center bg-linen px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 rounded-3xl bg-white p-4 shadow-soft">
          <GraduationCap className="h-8 w-8 text-clay" aria-hidden />
          <p className="mt-3 text-sm font-bold uppercase text-clay">Student signup</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Create your account</h1>
        </div>
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

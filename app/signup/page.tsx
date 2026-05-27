"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/Button";
import { signup } from "@/lib/api/auth";
import { setSession } from "@/lib/auth";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { z } from "zod";

const studentSignupSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export default function StudentSignupPage() {
  return (
    <Suspense fallback={<main className="min-h-screen animate-pulse bg-linen" />}>
      <StudentSignupForm />
    </Suspense>
  );
}

function StudentSignupForm() {
  const router = useRouter();
  const authContext = useAuthContext();
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = studentSignupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password")
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const session = await signup(parsed.data);
      await setSession(session);
      authContext.refreshSession();
      showToast("Account created. Welcome to LivingGo!", "success");
      router.push("/listings");
    } catch {
      setError("Could not create account. Email may already be registered.");
      showToast("Signup failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center bg-linen px-4 py-8">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-8 rounded-3xl bg-linen p-4">
          <GraduationCap className="h-8 w-8 text-clay" aria-hidden />
          <p className="mt-3 text-sm font-bold uppercase text-clay">Student signup</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Create your account</h1>
        </div>
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-bold text-ink">Full name</span>
            <input name="name" className="input" required />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-bold text-ink">Email</span>
            <input name="email" type="email" className="input" required />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-bold text-ink">Password</span>
            <input name="password" type="password" className="input" minLength={8} required />
          </label>
        </div>
        {error ? <p className="mt-4 rounded-2xl bg-linen p-3 text-sm font-semibold text-clay">{error}</p> : null}
        <Button className="mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-ink">Sign in</Link>
        </p>
      </form>
    </main>
  );
}

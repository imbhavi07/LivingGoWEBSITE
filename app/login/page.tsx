"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Building2, GraduationCap, Sparkles } from "lucide-react";
import { SignIn, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

type LoginMode = "student" | "owner";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [mode, setMode] = useState<LoginMode>("student");
  const { isSignedIn } = useUser();

  return (
    <main className="mx-auto grid min-h-[76vh] max-w-6xl items-center gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-lift sm:p-8 lg:min-h-[560px]">
        <div className={cn("absolute inset-x-8 top-10 h-48 rounded-full blur-3xl transition-all duration-700", mode === "student" ? "bg-clay/35" : "translate-y-40 bg-moss/40")} />
        <div className={cn("absolute -right-20 top-20 h-56 w-56 rounded-full border border-white/10 transition duration-700", mode === "owner" && "translate-x-[-60px] translate-y-28 scale-125")} />
        <div className="relative z-10 flex min-h-[440px] flex-col justify-between">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
            
            {mode === "student" ? "Find student homes faster" : "Manage rentals with clarity"}
          </div>
          <div className="py-10">
            <div className="relative mb-8 h-28">
              <div className={cn("absolute left-0 top-0 rounded-[2rem] bg-white/10 p-6 transition-all duration-700", mode === "student" ? "rotate-0 scale-100 opacity-100" : "-translate-y-4 rotate-[-8deg] scale-75 opacity-30")}>
                <GraduationCap className="h-14 w-14 text-clay" aria-hidden />
              </div>
              <div className={cn("absolute left-20 top-8 rounded-[2rem] bg-white/10 p-6 transition-all duration-700", mode === "owner" ? "translate-x-0 rotate-0 scale-100 opacity-100" : "translate-x-10 rotate-6 scale-75 opacity-30")}>
                <Building2 className="h-14 w-14 text-moss" aria-hidden />
              </div>
            </div>
            <p className="text-sm font-bold uppercase text-white/50">
              {mode === "student" ? "Student access" : "Owner access"}
            </p>
            <h1 className="mt-3 max-w-md text-4xl font-black leading-tight sm:text-5xl">
              {mode === "student" ? "Rooms, PGs, and flats made easier." : "Your housing business, neatly organized."}
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/65">
              {mode === "student"
                ? "Save homes, compare listings, and contact verified owners from one place."
                : "Add listings, upload images, track approvals, and manage active properties."}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              ["24/7", "Access"],
              [mode === "student" ? "Saved" : "Active", "Listings"],
              ["Secure", "Auth"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl bg-white/10 p-4">
                <p className="text-xl font-black">{value}</p>
                <p className="mt-1 text-xs font-semibold text-white/55">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-soft sm:p-8">
        <div className="relative grid grid-cols-2 rounded-full bg-linen p-1">
          <span className={cn(
            "absolute bottom-1 top-1 left-1 w-[calc(50%-0.5rem)] rounded-full bg-ink shadow-soft transition-transform duration-500 ease-out",
            mode === "owner" && "translate-x-[calc(100%+0.25rem)]"
          )} />
          <button
            type="button"
            onClick={() => setMode("student")}
            className={cn("relative z-10 flex min-h-12 items-center justify-center gap-2 rounded-full text-sm font-black transition", mode === "student" ? "text-white" : "text-muted")}
          >
            <GraduationCap className="h-4 w-4" aria-hidden />
            Student login
          </button>
          <button
            type="button"
            onClick={() => setMode("owner")}
            className={cn("relative z-10 flex min-h-12 items-center justify-center gap-2 rounded-full text-sm font-black transition", mode === "owner" ? "text-white" : "text-muted")}
          >
            <Building2 className="h-4 w-4" aria-hidden />
            Owner login
          </button>
        </div>

        <div className="mt-8">
          {isSignedIn ? (
            <div className="rounded-3xl bg-linen p-6 text-center">
              <p className="font-black text-ink text-lg">You&apos;re already signed in!</p>
              <p className="mt-2 text-sm text-muted">Browse listings or go to your dashboard.</p>
              <Link
                href={mode === "owner" ? "/owner/dashboard" : "/listings"}
                className="mt-4 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-white"
              >
                {mode === "owner" ? "Go to Dashboard" : "Browse listings"}
              </Link>
            </div>
          ) : (
            <div className="flex justify-center">
              <SignIn
                routing="hash"
                fallbackRedirectUrl={mode === "owner" ? "/owner/dashboard" : "/listings"}
                signUpUrl={mode === "owner" ? "/owner/signup" : "/signup"}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function LoginSkeleton() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-[420px] w-full animate-pulse rounded-3xl bg-white shadow-soft" />
    </main>
  );
}
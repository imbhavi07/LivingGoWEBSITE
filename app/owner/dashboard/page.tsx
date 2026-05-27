"use client";

import { Building2, Clock3, ToggleRight } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "@/components/Button";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { OwnerStatCard } from "@/components/owner/OwnerStatCard";
import { useOwnerDashboard } from "@/hooks/useOwnerProperties";

export default function OwnerDashboardPage() {
  const { stats, isLoading } = useOwnerDashboard();

  return (
    <OwnerShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-clay">Owner dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Manage your rentals</h1>
        </div>
        <Link href="/owner/properties/new" className={buttonClasses("primary")}>
          Add Property
        </Link>
      </div>
      {isLoading || !stats ? (
        <section className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-3xl bg-white shadow-soft" />
          ))}
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-3">
          <OwnerStatCard label="Total listings" value={stats.totalListings} icon={Building2} tone="bg-linen text-clay" />
          <OwnerStatCard label="Active listings" value={stats.activeListings} icon={ToggleRight} tone="bg-green-50 text-moss" />
          <OwnerStatCard label="Pending approval" value={stats.pendingListings} icon={Clock3} tone="bg-amber-50 text-amber-700" />
        </section>
      )}
    </OwnerShell>
  );
}

"use client";

// app/owner/dashboard/page.tsx  (FULL REPLACEMENT)

import { Building2, Clock3, ToggleRight } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "@/components/Button";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { OwnerStatCard } from "@/components/owner/OwnerStatCard";
import { OwnerBookings } from "@/components/owner/OwnerBookings";
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
      {isLoading ? (
        <section className="grid gap-5 md:grid-cols-3 mb-6">
          <OwnerStatCard label="Total listings" value={0} icon={Building2} tone="bg-linen text-clay" />
          <OwnerStatCard label="Active listings" value={0} icon={ToggleRight} tone="bg-green-50 text-moss" />
          <OwnerStatCard label="Pending approval" value={0} icon={Clock3} tone="bg-amber-50 text-amber-700" />
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-3 mb-6">
          <OwnerStatCard label="Total listings" value={stats?.totalListings ?? 0} icon={Building2} tone="bg-linen text-clay" />
          <OwnerStatCard label="Active listings" value={stats?.activeListings ?? 0} icon={ToggleRight} tone="bg-green-50 text-moss" />
          <OwnerStatCard label="Pending approval" value={stats?.pendingListings ?? 0} icon={Clock3} tone="bg-amber-50 text-amber-700" />
        </section>
      )}

      {/* NEW: Student bookings / token payments */}
      <OwnerBookings />
    </OwnerShell>
  );
}
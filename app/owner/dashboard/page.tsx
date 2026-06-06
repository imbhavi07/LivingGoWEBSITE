"use client";

import { Building2, Clock3, ToggleRight } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "@/components/Button";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { OwnerStatCard } from "@/components/owner/OwnerStatCard";

export default function OwnerDashboardPage() {
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
      <section className="grid gap-5 md:grid-cols-3">
        <OwnerStatCard label="Total listings" value={3} icon={Building2} tone="bg-linen text-clay" />
        <OwnerStatCard label="Active listings" value={2} icon={ToggleRight} tone="bg-green-50 text-moss" />
        <OwnerStatCard label="Pending approval" value={1} icon={Clock3} tone="bg-amber-50 text-amber-700" />
      </section>
    </OwnerShell>
  );
}

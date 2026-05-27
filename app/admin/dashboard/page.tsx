"use client";

import { Building2, CheckCircle2, Clock3, Shield, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { useAdminStats } from "@/hooks/useAdmin";

export default function AdminDashboardPage() {
  const { stats, isLoading } = useAdminStats();

  return (
    <AdminShell>
      <div className="mb-6">
        <p className="text-sm font-black uppercase text-clay">Internal overview</p>
        <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Admin dashboard</h1>
      </div>
      {isLoading || !stats ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-3xl bg-white shadow-soft" />
          ))}
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <AdminStatCard label="Total users" value={stats.totalUsers} icon={Users} />
          <AdminStatCard label="Total properties" value={stats.totalProperties} icon={Building2} />
          <AdminStatCard label="Pending listings" value={stats.pendingApprovals} icon={Clock3} />
          <AdminStatCard label="Approved listings" value={stats.approvedListings} icon={CheckCircle2} />
          <AdminStatCard label="Owner approvals" value={stats.pendingOwnerApprovals ?? 0} icon={Shield} />
        </section>
      )}
      <section className="mt-6 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
        <h2 className="text-2xl font-black text-ink">Moderation queue</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Review pending listings, validate owner submissions, remove fake properties, and suspend spam accounts from the dedicated moderation screens.
        </p>
      </section>
    </AdminShell>
  );
}
 

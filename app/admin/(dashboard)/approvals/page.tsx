"use client";

import Link from "next/link";
import { Eye, XCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { buttonClasses } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useOwnerApprovals } from "@/hooks/useAdmin";
import { formatIST } from "@/lib/utils";
import { Button } from "@/components/Button";
export default function AdminApprovalsPage() {
  const { approvals, isLoading, approve, reject } = useOwnerApprovals();

  return (
    <AdminShell>
      <div className="mb-6">
        <p className="text-sm font-black uppercase text-clay">Owner verification</p>
        <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Pending approvals</h1>
      </div>
      {isLoading ? <div className="h-96 animate-pulse rounded-3xl bg-white shadow-soft" /> : null}
      {!isLoading && approvals.length === 0 ? (
        <EmptyState title="No pending owner approvals" message="New owner applications will appear here after OTP verification." />
      ) : null}
      {!isLoading && approvals.length ? (
        <section className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-black/5">
          {approvals.map((approval) => (
            <article key={approval.id} className="grid gap-4 border-b border-black/5 p-5 last:border-0 xl:grid-cols-[1fr_auto] xl:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black text-ink">{approval.name}</h2>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">Pending review</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-muted">{approval.email} | {approval.phone}</p>
                <p className="mt-1 text-xs font-semibold text-muted">Submitted: {formatIST(approval.createdAt)}</p>
              </div>
              <div className="flex flex-wrap gap-2 xl:justify-end">
                <Link href={`/admin/approvals/${approval.id}`} className={buttonClasses("secondary", undefined, "px-4")}>
                  <Eye className="h-4 w-4" aria-hidden />
                  Review
                </Link>
                <button className={buttonClasses("primary", undefined, "px-4")} onClick={() => void approve(approval.id)}>
                  Approve
                </button>
                <button className={buttonClasses("ghost", undefined, "px-4 text-red-700")} onClick={() => void reject(approval.id)}>
                  <XCircle className="h-4 w-4" aria-hidden />
                  Reject
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </AdminShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Check, X, Clock, ExternalLink, Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminGetTokenPayments, adminModeratePayment, type AdminTokenPayment } from "@/lib/api/token-payment";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
] as const;

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [payments, setPayments] = useState<AdminTokenPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await adminGetTokenPayments(activeTab);
      setPayments(data);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function handleAction(id: string, action: "approved" | "rejected") {
    setActioningId(id);
    setError(null);
    try {
      await adminModeratePayment(id, action);
      // Remove from current list (it's moved to a different tab now)
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update payment");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase text-clay">Admin dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">Token Payments</h1>
          <p className="mt-1 text-sm text-muted">Review and approve student token payments to unlock property details.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-black/5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 ${
                activeTab === tab.key ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 font-medium">{error}</div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-3xl bg-white" />)}
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-soft">
            <Clock className="h-8 w-8 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No {activeTab} payments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-3xl bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-4">

                  {/* Student & Property info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-linen px-3 py-1 text-xs font-bold text-ink">
                        {payment.student.name}
                      </span>
                      <span className="text-xs text-muted">{payment.student.email}</span>
                      {payment.student.phone && (
                        <span className="text-xs text-muted">• {payment.student.phone}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="font-black text-ink">{payment.property.title}</p>
                      <a
                        href={`/admin/listings/${payment.property.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-ink"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <p className="text-sm text-muted">{payment.property.location}</p>
                    <p className="text-sm text-muted">
                      Owner: <span className="font-bold text-ink">{payment.property.owner.name}</span>
                      {payment.property.owner.phone && <span> • {payment.property.owner.phone}</span>}
                    </p>

                    <div className="flex items-center gap-4 pt-2 border-t border-black/5 mt-2">
                      <div>
                        <p className="text-xs text-muted">Token Amount</p>
                        <p className="text-lg font-black text-ink">₹{payment.amount.toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">UTR Number</p>
                        <p className="text-sm font-mono font-bold text-ink">{payment.utrNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">Applied Code</p>
                        <p className="text-sm font-mono font-bold text-ink">{payment.appliedCode || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted">Submitted</p>
                        <p className="text-sm font-bold text-ink">
                          {new Date(payment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {activeTab === "pending" && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(payment.id, "approved")}
                        disabled={actioningId === payment.id}
                        className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {actioningId === payment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(payment.id, "rejected")}
                        disabled={actioningId === payment.id}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  )}

                  {activeTab === "approved" && (
                    <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                      ✓ Approved
                    </span>
                  )}
                  {activeTab === "rejected" && (
                    <span className="shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                      ✗ Rejected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
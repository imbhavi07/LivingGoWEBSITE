"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  ShieldCheck,
  Clock,
  Check,
  X,
  Percent,
  IndianRupee,
  Loader2,
} from "lucide-react";

// ----------------------------------------------------------------------------
// Types (mirror backend Prisma shape — keep in a shared package in practice)
// ----------------------------------------------------------------------------

type RoomCategory = "SINGLE_SHARING" | "DOUBLE_SHARING" | "TRIPLE_SHARING" | "STUDIO" | "FULL_FLAT" | "ALL";

interface PendingCoupon {
  id: string;
  code: string;
  discountType: "FLAT" | "PERCENTAGE";
  discountValue: string;
  ownerType: "STUDENT" | "CREATOR" | "AFFILIATE";
  requestNote: string | null;
  requestedBy: { id: string; email: string; name: string | null };
  createdAt: string;
}

const ROOM_CATEGORIES: RoomCategory[] = [
  "ALL",
  "SINGLE_SHARING",
  "DOUBLE_SHARING",
  "TRIPLE_SHARING",
  "STUDIO",
  "FULL_FLAT",
];

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function AdminCouponsPage() {
  const [pending, setPending] = useState<PendingCoupon[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoadingQueue(true);
    try {
      const res = await fetch("/api/admin/coupons/pending", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setPending(data.pending);
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const notify = (kind: "success" | "error", message: string) => {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-linen text-ink">
      <header className="border-b border-ink/10 bg-linen/95 backdrop-blur px-6 py-5 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-linen">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Coupon control</h1>
              <p className="text-sm text-ink/50">Super Admin — rctaccommodations@gmail.com</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        {toast && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              toast.kind === "success"
                ? "border-moss/30 bg-moss/10 text-moss"
                : "border-clay/30 bg-clay/10 text-clay"
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr]">
          <CreateCouponForm onCreated={() => notify("success", "Coupon created and activated.")} onError={(m) => notify("error", m)} />
          <ApprovalQueue
            pending={pending}
            loading={loadingQueue}
            onDecision={async (couponId, decision, rejectionReason) => {
              const res = await fetch("/api/admin/coupons/review", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ couponId, decision, rejectionReason }),
              });
              if (res.ok) {
                notify("success", decision === "APPROVE" ? "Request approved." : "Request rejected.");
                fetchQueue();
              } else {
                const data = await res.json().catch(() => ({}));
                notify("error", data.message ?? "Action failed.");
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Create system coupon form
// ----------------------------------------------------------------------------

function CreateCouponForm({ onCreated, onError }: { onCreated: () => void; onError: (m: string) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FLAT",
    discountValue: "",
    maxDiscountAmount: "",
    minBookingAmount: "",
    validUntil: "",
    maxTotalRedemptions: "",
    maxRedemptionsPerUser: "1",
    applicableRoomCategories: ["ALL"] as RoomCategory[],
    commissionType: "PERCENTAGE" as "PERCENTAGE" | "FLAT",
    commissionValue: "",
  });

  const toggleCategory = (cat: RoomCategory) => {
    setForm((f) => {
      if (cat === "ALL") return { ...f, applicableRoomCategories: ["ALL"] };
      const withoutAll = f.applicableRoomCategories.filter((c) => c !== "ALL");
      const has = withoutAll.includes(cat);
      const next = has ? withoutAll.filter((c) => c !== cat) : [...withoutAll, cat];
      return { ...f, applicableRoomCategories: next.length ? next : ["ALL"] };
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
          minBookingAmount: form.minBookingAmount ? Number(form.minBookingAmount) : undefined,
          validUntil: new Date(form.validUntil).toISOString(),
          maxTotalRedemptions: form.maxTotalRedemptions ? Number(form.maxTotalRedemptions) : undefined,
          maxRedemptionsPerUser: Number(form.maxRedemptionsPerUser),
          applicableRoomCategories: form.applicableRoomCategories,
          commissionType: form.commissionValue ? form.commissionType : undefined,
          commissionValue: form.commissionValue ? Number(form.commissionValue) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.message ?? "Could not create coupon.");
        return;
      }
      onCreated();
      setForm((f) => ({ ...f, code: "", discountValue: "", maxDiscountAmount: "", minBookingAmount: "", commissionValue: "" }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-ink/10 bg-white/60 p-6 sm:p-8">
      <h2 className="mb-1 text-base font-semibold">Create a global code</h2>
      <p className="mb-6 text-sm text-ink/50">Live immediately across the platform once saved.</p>

      <form onSubmit={submit} className="space-y-5">
        <Field label="Code">
          <input
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="MOVEIN200"
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Discount type">
            <div className="flex gap-2">
              <TypeToggle
                active={form.discountType === "PERCENTAGE"}
                icon={<Percent size={14} />}
                label="Percent"
                onClick={() => setForm({ ...form, discountType: "PERCENTAGE" })}
              />
              <TypeToggle
                active={form.discountType === "FLAT"}
                icon={<IndianRupee size={14} />}
                label="Flat"
                onClick={() => setForm({ ...form, discountType: "FLAT" })}
              />
            </div>
          </Field>
          <Field label={form.discountType === "PERCENTAGE" ? "Percent off" : "Amount off (₹)"}>
            <input
              required
              type="number"
              min={1}
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Max discount cap (₹, optional)">
            <input
              type="number"
              value={form.maxDiscountAmount}
              onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Min booking value (₹, optional)">
            <input
              type="number"
              value={form.minBookingAmount}
              onChange={(e) => setForm({ ...form, minBookingAmount: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <Field label="Applicable room categories">
          <div className="flex flex-wrap gap-2">
            {ROOM_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.applicableRoomCategories.includes(cat)
                    ? "border-moss bg-moss/10 text-moss"
                    : "border-ink/15 text-ink/60 hover:border-ink/30"
                }`}
              >
                {cat.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Valid until">
            <input
              required
              type="date"
              value={form.validUntil}
              onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Total redemption cap">
            <input
              type="number"
              placeholder="Unlimited"
              value={form.maxTotalRedemptions}
              onChange={(e) => setForm({ ...form, maxTotalRedemptions: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Per-user limit">
            <input
              type="number"
              min={1}
              value={form.maxRedemptionsPerUser}
              onChange={(e) => setForm({ ...form, maxRedemptionsPerUser: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <div className="rounded-xl border border-clay/20 bg-clay/5 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-clay">
            Commission yield (referral codes only)
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <div className="flex gap-2">
                <TypeToggle
                  active={form.commissionType === "PERCENTAGE"}
                  icon={<Percent size={14} />}
                  label="Percent"
                  onClick={() => setForm({ ...form, commissionType: "PERCENTAGE" })}
                />
                <TypeToggle
                  active={form.commissionType === "FLAT"}
                  icon={<IndianRupee size={14} />}
                  label="Flat"
                  onClick={() => setForm({ ...form, commissionType: "FLAT" })}
                />
              </div>
            </Field>
            <Field label="Value per booking">
              <input
                type="number"
                placeholder="e.g. 300 or 5"
                value={form.commissionValue}
                onChange={(e) => setForm({ ...form, commissionValue: e.target.value })}
                className="input"
              />
            </Field>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-3 text-sm font-medium text-linen transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Create & activate
        </button>
      </form>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Approval queue
// ----------------------------------------------------------------------------

function ApprovalQueue({
  pending,
  loading,
  onDecision,
}: {
  pending: PendingCoupon[];
  loading: boolean;
  onDecision: (couponId: string, decision: "APPROVE" | "REJECT", rejectionReason?: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white/60 p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-2">
        <Clock size={16} className="text-clay" />
        <h2 className="text-base font-semibold">Approval queue</h2>
        {pending.length > 0 && (
          <span className="rounded-full bg-clay/15 px-2 py-0.5 text-xs font-medium text-clay">
            {pending.length}
          </span>
        )}
      </div>

      {loading && <p className="text-sm text-ink/40">Loading requests…</p>}
      {!loading && pending.length === 0 && (
        <p className="rounded-lg border border-dashed border-ink/15 py-8 text-center text-sm text-ink/40">
          Nothing pending — all caught up.
        </p>
      )}

      <ul className="space-y-4">
        {pending.map((c) => (
          <li key={c.id} className="rounded-xl border border-ink/10 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-sm font-semibold">{c.code}</span>
              <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink/50">
                {c.ownerType}
              </span>
            </div>
            <p className="mb-1 text-sm text-ink/70">
              {c.discountType === "PERCENTAGE" ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
            </p>
            <p className="mb-3 text-xs text-ink/45">
              Requested by {c.requestedBy?.name ?? c.requestedBy?.email}
            </p>
            {c.requestNote && (
              <p className="mb-4 rounded-lg bg-linen px-3 py-2 text-xs italic text-ink/60">"{c.requestNote}"</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => onDecision(c.id, "APPROVE")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-moss py-2 text-xs font-medium text-linen hover:opacity-90"
              >
                <Check size={14} /> Approve
              </button>
              <button
                onClick={() => {
                  const reason = window.prompt("Reason for rejection:");
                  if (reason) onDecision(c.id, "REJECT", reason);
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-clay/40 py-2 text-xs font-medium text-clay hover:bg-clay/5"
              >
                <X size={14} /> Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Small shared primitives
// ----------------------------------------------------------------------------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink/60">{label}</span>
      {children}
    </label>
  );
}

function TypeToggle({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors ${
        active ? "border-ink bg-ink text-linen" : "border-ink/15 text-ink/60 hover:border-ink/30"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/*
  Tailwind config additions required (tailwind.config.ts):

  theme: {
    extend: {
      colors: {
        linen: "#F6F1E9",
        ink:   "#1E1B16",
        clay:  "#B5573C",
        moss:  "#5C6B4F",
      },
    },
  },

  Add a `.input` utility in globals.css:
  .input { @apply w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm
            text-ink placeholder:text-ink/30 focus:border-ink/40 focus:outline-none; }
*/

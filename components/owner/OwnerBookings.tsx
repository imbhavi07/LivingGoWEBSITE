"use client";

// components/owner/OwnerBookings.tsx  (NEW FILE)
// Shows on owner dashboard — students who have token-locked their properties

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Clock, CheckCircle, XCircle, Phone, Mail, Users } from "lucide-react";
import { getOwnerTokenPayments, type AdminTokenPayment } from "@/lib/api/token-payment";

const STATUS_CONFIG = {
  pending: { icon: Clock, label: "Pending Admin Review", color: "bg-amber-50 text-amber-700" },
  approved: { icon: CheckCircle, label: "Confirmed", color: "bg-green-50 text-green-700" },
  rejected: { icon: XCircle, label: "Rejected", color: "bg-red-50 text-red-700" },
} as const;

export function OwnerBookings() {
  const { getToken } = useAuth();
  const [payments, setPayments] = useState<AdminTokenPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) { setLoading(false); return; }
        const data = await getOwnerTokenPayments(token);
        setPayments(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken]);

  if (loading) {
    return <div className="h-40 animate-pulse rounded-3xl bg-white shadow-soft" />;
  }

  if (payments.length === 0) {
    return (
      <section className="bg-white rounded-3xl shadow-soft p-6">
        <h2 className="text-2xl font-bold text-ink flex items-center gap-2 mb-2">
          <Users className="h-5 w-5" />
          Student Bookings
        </h2>
        <p className="text-sm text-muted">No bookings yet. When a student locks one of your properties, it'll appear here.</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-3xl shadow-soft p-6">
      <h2 className="text-2xl font-bold text-ink flex items-center gap-2 mb-4">
        <Users className="h-5 w-5" />
        Student Bookings
        <span className="text-sm font-semibold text-muted">({payments.length})</span>
      </h2>

      <div className="space-y-3">
        {payments.map((payment) => {
          const config = STATUS_CONFIG[payment.status];
          const Icon = config.icon;
          const isApproved = payment.status === "approved";

          return (
            <div key={payment.id} className="rounded-2xl border border-black/8 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink">{payment.property.title}</p>
                  <p className="text-sm text-muted mt-0.5">
                    Token: ₹{payment.amount.toLocaleString("en-IN")} • {new Date(payment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${config.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                </span>
              </div>

              {/* Student contact — only revealed once admin approves */}
              {isApproved ? (
                <div className="mt-3 rounded-xl bg-green-50 p-3 space-y-1.5">
                  <p className="text-xs text-green-700 font-bold uppercase">Student Details</p>
                  <p className="text-sm font-black text-ink">{payment.student.name}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-ink">
                    <a href={`mailto:${payment.student.email}`} className="flex items-center gap-1.5 hover:underline">
                      <Mail className="h-3.5 w-3.5" />
                      {payment.student.email}
                    </a>
                    {payment.student.phone && (
                      <a href={`tel:${payment.student.phone}`} className="flex items-center gap-1.5 hover:underline">
                        <Phone className="h-3.5 w-3.5" />
                        {payment.student.phone}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-xl bg-linen p-3 text-xs text-muted">
                  Student contact details will be shared once admin confirms the payment.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
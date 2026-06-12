"use client";

// components/student/MyBookings.tsx  (NEW FILE)
// Drop into student dashboard — shows token payment status + revealed address after approval

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Clock, CheckCircle, XCircle, MapPin, Phone, Building2 } from "lucide-react";
import { getMyTokenPayments, type TokenPayment } from "@/lib/api/token-payment";

const STATUS_CONFIG = {
  pending: { icon: Clock, label: "Under Review", color: "bg-amber-50 text-amber-700" },
  approved: { icon: CheckCircle, label: "Approved", color: "bg-green-50 text-green-700" },
  rejected: { icon: XCircle, label: "Rejected", color: "bg-red-50 text-red-700" },
} as const;

export function MyBookings() {
  const { getToken } = useAuth();
  const [payments, setPayments] = useState<TokenPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) { setLoading(false); return; }
        const data = await getMyTokenPayments(token);
        setPayments(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken]);

  if (loading) {
    return <div className="h-40 animate-pulse rounded-3xl bg-white shadow-soft" />;
  }

  if (payments.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-soft p-6">
      <h2 className="text-2xl font-bold text-ink flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5" />
        My Bookings
      </h2>

      <div className="space-y-4">
        {payments.map((payment) => {
          const config = STATUS_CONFIG[payment.status];
          const Icon = config.icon;

          return (
            <div key={payment.id} className="rounded-2xl border border-black/8 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink">{payment.property.title}</p>
                  {payment.status === "approved" ? (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                      <MapPin className="h-3.5 w-3.5" />
                      {payment.property.location}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted">Address hidden until approved</p>
                  )}
                </div>
                <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${config.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 pt-3 border-t border-black/5 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted">Token Paid</p>
                  <p className="text-sm font-black text-ink">₹{payment.amount.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">UTR Number</p>
                  <p className="text-sm font-mono font-bold text-ink">{payment.utrNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Submitted</p>
                  <p className="text-sm font-bold text-ink">
                    {new Date(payment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>

              {/* Revealed owner contact after approval */}
              {payment.status === "approved" && payment.property.owner && (
                <div className="mt-3 rounded-xl bg-green-50 p-3 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-xs text-green-700 font-bold uppercase">Owner Contact</p>
                    <p className="text-sm font-black text-ink">{payment.property.owner.name}</p>
                  </div>
                  {payment.property.owner.phone && (
                    <a
                      href={`tel:${payment.property.owner.phone}`}
                      className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-ink border border-black/10"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {payment.property.owner.phone}
                    </a>
                  )}
                </div>
              )}

              {payment.status === "rejected" && (
                <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                  Your payment could not be verified. Please contact support or try locking the property again.
                </div>
              )}

              {payment.status === "pending" && (
                <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                  Admin is reviewing your payment. This usually takes up to 24 hours.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
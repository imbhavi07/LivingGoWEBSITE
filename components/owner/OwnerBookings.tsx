"use client";

/**
 * components/owner/OwnerBookings.tsx  (NEW FILE)
 * Shows on owner dashboard — students who have token-locked their properties
 */
import { Button } from "@/components/Button";
import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Users,
  Loader2,
} from "lucide-react";
import {
  getOwnerTokenPayments,
  getOwnerPendingVisits,
  verifyVisitOtp,
  approveMoveIn,
  type AdminTokenPayment,
  type TokenPayment,
} from "@/lib/api/token-payment";

const STATUS_CONFIG = {
  pending: { icon: Clock, label: "Pending Admin Review", color: "bg-amber-50 text-amber-700" },
  approved: { icon: CheckCircle, label: "Confirmed", color: "bg-green-50 text-green-700" },
  rejected: { icon: XCircle, label: "Rejected", color: "bg-red-50 text-red-700" },
} as const;

export function OwnerBookings() {
  const [payments, setPayments] = useState<AdminTokenPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingVisits, setPendingVisits] = useState<TokenPayment[]>([]);
  const [otpValues, setOtpValues] = useState<Record<string, string>>({});
  const [otpLoading, setOtpLoading] = useState<Record<string, boolean>>({});
  const [otpError, setOtpError] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await getOwnerTokenPayments();
        setPayments(data);
        const visits = await getOwnerPendingVisits();
        setPendingVisits(visits);
      } catch {
        // Set state to empty arrays on error to prevent crashes
        setPayments([]);
        setPendingVisits([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
        <p className="text-sm text-muted">No bookings yet. When a student locks one of your properties, it will appear here.</p>
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

      {/* Pending Visit Verification Section */}
      {pendingVisits.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-black">Pending Visit Verification</h3>
          <div className="space-y-4">
            {pendingVisits.map((visit) => {
              // Find matching payment to get student/property details
              const payment = payments.find((p) => p.id === visit.id);
              return (
              <div key={visit.id} className="rounded-2xl border p-4">
                <p className="font-black">{payment?.student?.name || "Unknown"}</p>
                <p className="text-sm text-muted">{payment?.property?.title || "Unknown"}</p>

                <input
                  value={otpValues[visit.id] ?? ""}
                  onChange={(e) => {
                    setOtpValues((prev) => ({
                      ...prev,
                      [visit.id]: e.target.value,
                    }));
                    // Clear error when user types
                    setOtpError((prev) => ({
                      ...prev,
                      [visit.id]: "",
                    }));
                  }}
                  placeholder="Enter OTP"
                  className="mt-3 w-full rounded-xl border px-4 py-2"
                  maxLength={6}
                />

                <Button
                  disabled={otpLoading[visit.id] === true}
                  className="mt-3 rounded-xl bg-amber-600 px-4 py-2 font-bold text-white"
                  onClick={async () => {
                    const id = visit.id;
                    const otp = otpValues[id];
                    if (!otp) return;

                    setOtpLoading((prev) => ({ ...prev, [id]: true }));
                    setOtpError((prev) => ({ ...prev, [id]: "" }));

                    try {
                      const result = await verifyVisitOtp(id, otp);
                      if (result.success) {
                        // Remove from pending visits
                        setPendingVisits((prev) =>
                          prev.filter((p) => p.id !== id)
                        );
                        // Also update the payment status if it exists in payments
                        setPayments((prev) =>
                          prev.map((p) =>
                            p.id === id ? { ...p, visitVerified: true } : p
                          )
                        );
                        alert("Visit Verified");
                      } else {
                        setOtpError((prev) => ({
                          ...prev,
                          [id]: "Invalid OTP",
                        }));
                      }
                    } catch (err) {
                      setOtpError((prev) => ({
                        ...prev,
                        [id]: "Verification failed",
                      }));
                      console.error("OTP verification error:", err);
                    } finally {
                      setOtpLoading((prev) => ({
                        ...prev,
                        [id]: false,
                      }));
                    }
                  }}
                >
                  {otpLoading[visit.id] === true ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>

                {otpError[visit.id] && (
                  <p className="mt-2 text-sm text-red-600">
                    {otpError[visit.id]}
                  </p>
                )}
              </div>
            )
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {payments
          .filter((payment) => !payment.rentSettled)
          .map((payment) => {
            const config = STATUS_CONFIG[payment.status];
            const Icon = config.icon;
            const isApproved = payment.status === "approved";

            return (
              <div key={payment.id} className="rounded-2xl border border-black/8 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink">{payment.property.title}</p>
                    <p className="text-sm text-muted mt-0.5">
                      Token: ₹{payment.amount.toLocaleString("en-IN")} •{" "}
                      {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${config.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </span>
                </div>

                {/* Student contact — only revealed once admin approves */}
                {isApproved ? (
                  <>
                    <div className="mt-3 rounded-xl bg-green-50 p-3 space-y-1.5">
                      <p className="text-xs text-green-700 font-bold uppercase">
                        Student Details
                      </p>
                      <p className="text-sm font-black text-ink">{payment.student.name}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-ink">
                        <a
                          href={`mailto:${payment.student.email}`}
                          className="flex items-center gap-1.5 hover:underline"
                        >
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

                    {/* Visit Verification - OTP Input for approved but unverified visits */}
                    {!payment.visitVerified && (
                      <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
                        <p className="font-bold text-amber-800 mb-2">
                          Visit Verification Required
                        </p>
                        <div className="flex flex-col sm:flex-row items-start gap-3">
                          <input
                            value={otpValues[payment.id] || ""}
                            onChange={(e) => {
                              setOtpValues((prev) => ({
                                ...prev,
                                [payment.id]: e.target.value,
                              }));
                              // Clear error when user types
                              setOtpError((prev) => ({
                                ...prev,
                                [payment.id]: "",
                              }));
                            }}
                            placeholder="Enter 6-digit OTP"
                            className="flex-1 min-w-0 rounded-xl border px-4 py-2 text-sm"
                            maxLength={6}
                          />
                          <Button
                            disabled={otpLoading[payment.id] === true}
                            onClick={async () => {
                              const id = payment.id;
                              const otp = otpValues[id];
                              if (!otp) return;

                              setOtpLoading((prev) => ({
                                ...prev,
                                [id]: true,
                              }));
                              setOtpError((prev) => ({
                                ...prev,
                                [id]: "",
                              }));

                              try {
                                const result = await verifyVisitOtp(id, otp);
                                if (result.success) {
                                  // Update the payment status locally
                                  setPayments((prev) =>
                                    prev.map((p) =>
                                      p.id === id
                                        ? { ...p, visitVerified: true }
                                        : p
                                    )
                                  );
                                  // Clear the OTP input
                                  setOtpValues((prev) => {
                                    const { [id]: _, ...rest } = prev;
                                    return rest;
                                  });
                                } else {
                                  setOtpError((prev) => ({
                                    ...prev,
                                    [id]: "Invalid OTP",
                                  }));
                                }
                              } catch (err) {
                                setOtpError((prev) => ({
                                  ...prev,
                                  [id]: "Verification failed",
                                }));
                                console.error("OTP verification error:", err);
                              } finally {
                                setOtpLoading((prev) => ({
                                  ...prev,
                                  [id]: false,
                                }));
                              }
                            }}
                            className="mt-0 sm:mt-0 rounded-xl bg-amber-600 px-4 py-2 font-bold text-white"
                          >
                            {otpLoading[payment.id] === true ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              "Verify Visit"
                            )}
                          </Button>
                        </div>
                        {otpError[payment.id] && (
                          <p className="mt-2 text-sm text-red-600">
                            {otpError[payment.id]}
                          </p>
                        )}
                        {payment.visitVerified && (
                          <p className="mt-2 flex items-center gap-2 text-sm text-green-800">
                            <CheckCircle className="h-4 w-4" />
                            Visit Verified & Completed
                          </p>
                        )}
                      </div>
                    )}

                    {/* Show verification badge if visit is already verified */}
                    {payment.visitVerified && (
                      <div className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Visit Verified & Completed
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-3 rounded-xl bg-linen p-3 text-xs text-muted">
                    Student contact details will be shared once admin confirms the payment.
                  </div>
                )}

                {payment.visitVerified &&
                  payment.moveInRequested &&
                  !payment.rentSettled && (
                    <div className="mt-4 rounded-xl border border-green-300 bg-green-50 p-4">
                      <p className="font-bold text-green-700">
                        Student requested Move-in Approval
                      </p>
                      <Button
                        onClick={async () => {
                          try {
                            await approveMoveIn(payment.id);
                            setPayments((current) =>
                              current.map((p) =>
                                p.id === payment.id
                                  ? {
                                      ...p,
                                      rentSettled: true,
                                    }
                                  : p
                              )
                            );
                            alert("Move-in Approved");
                            window.location.reload();
                          } catch {
                            alert("Approval Failed");
                          }
                        }}
                        className="mt-3 rounded-xl bg-green-600 px-4 py-2 font-bold text-white"
                      >
                        Approve Move-in
                      </Button>
                    </div>
                  )}
              </div>
            );
          })}
      </div>
    </section>
  );
}
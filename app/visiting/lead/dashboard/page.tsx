"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";

type Assignment = {
  id: string;
  hotspot: string;
  outcome: string | null;
  assignedAt: string;
  booking: {
    studentName: string;
    studentPhone: string;
    visitDate: string;
    slot: string;
    otp: string;
    status: string;
    referralCode: string | null;
    property: {
      propertyCode: string | null;
      title: string;
      location: string;
      price: number;
    };
  };
};

const SLOTS: Record<string, string> = {
  SLOT_9_11: "9:00 AM – 11:00 AM",
  SLOT_11_1: "11:00 AM – 1:00 PM",
  SLOT_1_3: "1:00 PM – 3:00 PM",
  SLOT_3_5: "3:00 PM – 5:00 PM",
  SLOT_5_7: "5:00 PM – 7:00 PM",
};

const OUTCOMES = [
  { value: "SUCCESSFUL", label: "Successful", color: "bg-green-600" },
  { value: "NOT_SUCCESSFUL", label: "Not Successful", color: "bg-red-500" },
  { value: "INTERESTED_OTHER", label: "Interested in Other", color: "bg-blue-500" },
];

export default function LeadDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [outcome, setOutcome] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leadName = typeof window !== "undefined" ? localStorage.getItem("lead_name") : "";
  const token = typeof window !== "undefined" ? localStorage.getItem("lead_token") : "";

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await apiClient.get("/visiting/lead/assignments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(res.data.assignments);
    } catch {
      window.location.href = "/visiting/lead";
    } finally {
      setLoading(false);
    }
  }

  async function submit(assignmentId: string) {
    if (!otp || !outcome) { setError("Enter OTP and select outcome"); return; }
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.patch(
        `/visiting/lead/assignments/${assignmentId}/outcome`,
        { otp, outcome },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActiveId(null);
      setOtp("");
      setOutcome("");
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  function badge(a: Assignment) {
    if (a.outcome === "SUCCESSFUL") return "bg-green-100 text-green-700";
    if (a.outcome === "NOT_SUCCESSFUL") return "bg-red-100 text-red-700";
    if (a.outcome === "INTERESTED_OTHER") return "bg-blue-100 text-blue-700";
    if (a.booking.status === "ASSIGNED") return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-600";
  }

  function label(a: Assignment) {
    const map: Record<string, string> = {
      SUCCESSFUL: "Successful",
      NOT_SUCCESSFUL: "Not Successful",
      INTERESTED_OTHER: "Interested in Other",
    };
    if (!a.outcome || a.outcome === "NOT_MET") return "Pending";
    return map[a.outcome] ?? a.outcome;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f6f6]">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f6f6] p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#5B3416]">My Assignments</h1>
          <p className="mt-1 text-gray-500">Welcome, {leadName}</p>
        </div>

        {assignments.length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center text-gray-400 shadow">
            No assignments yet.
          </div>
        )}

        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a.id} className="rounded-3xl bg-white p-6 shadow">

              <div className="mb-4 flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge(a)}`}>
                  {label(a)}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(a.assignedAt).toLocaleDateString("en-IN")}
                </span>
              </div>

              <div className="mb-4 rounded-2xl bg-[#f6f6f6] p-4">
                <p className="text-xs font-bold uppercase text-gray-400">Student</p>
                <p className="mt-1 text-lg font-black text-[#5B3416]">{a.booking.studentName}</p>
                <a href={`tel:${a.booking.studentPhone}`} className="mt-1 text-sm font-semibold text-blue-600">
                  {a.booking.studentPhone}
                </a>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400">Property</p>
                  <p className="mt-1 font-bold">{a.booking.property.title}</p>
                  <p className="text-sm text-gray-500">{a.booking.property.location}</p>
                  <p className="text-sm font-semibold">
                    {String.fromCharCode(8377)}{a.booking.property.price.toLocaleString("en-IN")}/mo
                  </p>
                  {a.booking.property.propertyCode && (
                    <p className="mt-1 font-mono text-xs text-gray-400">{a.booking.property.propertyCode}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400">Visit</p>
                  <p className="mt-1 font-bold">
                    {new Date(a.booking.visitDate).toLocaleDateString("en-IN", {
                      weekday: "short", day: "numeric", month: "short",
                    })}
                  </p>
                  <p className="text-sm text-gray-500">{SLOTS[a.booking.slot] ?? a.booking.slot}</p>
                  <p className="mt-2 text-xs font-bold uppercase text-gray-400">Meet at</p>
                  <p className="font-semibold text-[#5B3416]">{a.hotspot}</p>
                </div>
              </div>

              {a.booking.referralCode && (
                <p className="mb-4 text-xs text-gray-400">
                  Referral: <span className="font-mono font-bold">{a.booking.referralCode}</span>
                </p>
              )}

              {(!a.outcome || a.outcome === "NOT_MET") && activeId !== a.id && (
                <button
                  onClick={() => setActiveId(a.id)}
                  className="mt-2 w-full rounded-xl bg-[#5B3416] py-3 font-bold text-white"
                >
                  Mark Outcome
                </button>
              )}

              {(!a.outcome || a.outcome === "NOT_MET") && activeId === a.id && (
                <div className="mt-4 space-y-3 rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm font-bold">Enter student OTP to verify meeting</p>
                  <input
                    className="w-full rounded-xl border p-3 text-center font-mono text-2xl tracking-widest"
                    placeholder="_ _ _ _"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {OUTCOMES.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setOutcome(opt.value)}
                        className={`rounded-xl py-2 text-xs font-bold text-white transition ${outcome === opt.value ? opt.color : "bg-gray-300"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {error && (
                    <p className="rounded-xl bg-red-50 p-2 text-xs text-red-600">{error}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setActiveId(null); setOtp(""); setOutcome(""); setError(null); }}
                      className="flex-1 rounded-xl border py-2 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => submit(a.id)}
                      disabled={submitting}
                      className="flex-1 rounded-xl bg-[#5B3416] py-2 text-sm font-bold text-white disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </div>
              )}

              {a.outcome && a.outcome !== "NOT_MET" && (
                <div className="mt-2 rounded-xl bg-gray-50 p-3 text-center text-sm font-semibold text-gray-500">
                  Completed — {label(a)}
                </div>
              )}

            </div>
          ))}
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("lead_token");
            localStorage.removeItem("lead_name");
            window.location.href = "/visiting/lead";
          }}
          className="mt-8 w-full rounded-xl border py-3 text-sm font-semibold text-gray-500 hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { apiClient } from "@/lib/api/client";
import {Button} from "@/components/Button";
type Visit = {
  id: string;
  visitDate: string;
  timeSlot: string;
  meetingPointId: string | null;
  leadStatus: string;
  isLocked: boolean;

  student: {
    id: string;
    name: string;
    phone: string | null;
  };

  property: {
    id: string;
    propertyCode: string | null;
    title: string;
    location: string;
    price: number;
  };
};

export default function LeadDashboard() {
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [status, setStatus] = useState("");
  const [showLockDialog, setShowLockDialog] = useState(false);
  useEffect(() => {
    console.log("Lead Token:", localStorage.getItem("lead_token"));
  }, []);
  const FINAL_STATUSES = [
    "SUCCESSFUL",
    "NOT_SUCCESSFUL",
    "NOT_MET",
    "INTERESTED_OTHER_PROPERTY",
  ];

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("lead_token")
      : "";

  const leadName =
    typeof window !== "undefined"
      ? localStorage.getItem("lead_name")
      : "";

  useEffect(() => {
    loadVisits();
  }, []);
    async function loadVisits() {
    try {
      const res = await apiClient.get(
        "/visiting/lead/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setVisits(res.data.visits);
    } catch (err) {
      console.error(err);
      alert("Failed to load assigned visits.");
    } finally {
      setLoading(false);
    }
  }
  async function verifyOtp() {
    if (!selectedVisit) return;

    setVerifyingOtp(true);

    try {
      const res = await apiClient.post(
        "/visiting/lead/verify-otp",
        {
          visitId: selectedVisit,
          otp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setOtpVerified(true);
        alert("OTP verified successfully.");
      } else {
        setOtpVerified(false);
        alert("Invalid OTP.");
      }
    } catch (err) {
      console.error(err);
      setOtpVerified(false);
      alert("OTP verification failed.");
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function updateStatus() {
    if (!selectedVisit) return false;
    try {
      await apiClient.patch(
        `/visiting/lead/${selectedVisit}`,
        {
          otp,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(
        status === "MET"
          ? "Visit marked as Reached."
          : "Visit finalized successfully."
      );
      setSelectedVisit(null);
      setOtp("");
      setOtpVerified(false);
      setStatus("");
      await loadVisits();
      return true;
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        alert(
          err.response?.data?.message ??
          "Failed to update visit."
        );
      } else {
        alert("Failed to update visit.");
      }
      return false;
    }
  }
    if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-bold">
          Loading...
        </h2>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black">
              Lead Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome {leadName}
            </p>
          </div>
          <Button
            onClick={() => {
              localStorage.removeItem("lead_token");
              localStorage.removeItem("lead_name");
              window.location.href =
                "/visiting/lead";
            }}
            
            className="rounded-xl border bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800"
          >
            Logout
          </Button>
        </div>
        <div className="space-y-6">
                  {visits.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center shadow">
              <h2 className="text-xl font-bold">
                No Assigned Visits
              </h2>
              <p className="mt-2 text-gray-500">
                You dont have any assigned visits yet.
              </p>
            </div>
          )}
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="rounded-3xl bg-white p-6 shadow"
              >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {visit.student.name}
                </h2>
                <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-700">
                  {visit.leadStatus}
                </span>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-bold text-lg">
                    Student
                  </h3>
                  <p>{visit.student.name}</p>
                  <p>{visit.student.phone}</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    Property
                  </h3>
                  <p>{visit.property.title}</p>
                  <p>{visit.property.location}</p>
                  <p>
                    ₹{visit.property.price.toLocaleString()}
                  </p>
                  <p>
                    {visit.property.propertyCode}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    Visit Details
                  </h3>
                  <p>
                    {new Date(
                      visit.visitDate
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    {visit.timeSlot}
                  </p>
                  <p>
                    Pickup Point:
                    {" "}
                    {visit.meetingPointId ?? "-"}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    Quick Actions
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {visit.student.phone && (
                      <a
                        href={`tel:${visit.student.phone}`}
                        className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white"
                      >
                        Call Student
                      </a>
                    )}
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        visit.property.location
                      )}`}
                      className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
                    >
                      Open Maps
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-8 border-t pt-6">
                <h3 className="mb-4 text-xl font-bold">
                  Update Visit Status
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Step 1 • Verify the students OTP before updating the visit status.
                </p>
                <input
                  disabled={visit.isLocked}
                  type="text"
                  maxLength={4}
                  placeholder="Student OTP"
                  value={selectedVisit === visit.id ? otp : ""}
                  onChange={(e) => {
                    setSelectedVisit(visit.id);
                    setOtp(e.target.value);
                    setOtpVerified(false);
                  }}
                  className="mb-4 w-full rounded-xl border p-3"
                />
                <div className="mt-4">
                  {otpVerified ? (
                    <div className="rounded-xl border border-green-200 bg-green-50 py-3 text-center font-semibold text-green-700">
                      ✅ OTP Verified Successfully
                    </div>
                  ) : (
                    <Button
                      className="w-full rounded-xl bg-blue-600 py-3 text-white hover:bg-blue-700"
                      disabled={!otp || verifyingOtp}
                      onClick={verifyOtp}
                    >
                      {verifyingOtp ? "Verifying..." : "Verify Student OTP"}
                    </Button>
                  )}
                </div>
                <div className="mt-8 mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Step 2 • Select Visit Outcome
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  <Button
                    disabled={!otpVerified || visit.isLocked}
                    onClick={() => {
                      setSelectedVisit(visit.id);
                      setStatus("MET");
                    }}
                    className={`rounded-xl py-3 font-semibold ${
                      selectedVisit === visit.id &&
                      status === "MET"
                        ? "bg-blue-700 text-white"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    Reached
                  </Button>
                  <Button
                    disabled={!otpVerified || visit.isLocked}
                    onClick={() => {
                      setSelectedVisit(visit.id);
                      setStatus("SUCCESSFUL");
                    }}
                    className={`rounded-xl py-3 font-semibold ${
                      selectedVisit === visit.id &&
                      status === "SUCCESSFUL"
                        ? "bg-green-700 text-white"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    Successful
                  </Button>
                  <Button
                    disabled={!otpVerified || visit.isLocked}
                    onClick={() => {
                      setSelectedVisit(visit.id);
                      setStatus("NOT_SUCCESSFUL");
                    }}
                    className={`rounded-xl py-3 font-semibold ${
                      selectedVisit === visit.id &&
                      status === "NOT_SUCCESSFUL"
                        ? "bg-red-700 text-white"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    Not Successful
                  </Button>
                  <Button
                    disabled={!otpVerified || visit.isLocked}
                    onClick={() => {
                      setSelectedVisit(visit.id);
                      setStatus("INTERESTED_OTHER_PROPERTY");
                    }}
                    className={`rounded-xl py-3 text-sm font-semibold ${
                      selectedVisit === visit.id &&
                      status === "INTERESTED_OTHER_PROPERTY"
                        ? "bg-purple-700 text-white"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    Other Property
                  </Button>
                  <Button
                  disabled={visit.isLocked}
                    onClick={() => {
                      setSelectedVisit(visit.id);
                      setStatus("NOT_MET");
                    }}
                    className={`rounded-xl py-3 font-semibold ${
                      selectedVisit === visit.id &&
                      status === "NOT_MET"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Not Met
                  </Button>
                </div>
                {visit.isLocked && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                    This visit has been finalized.
                    Only your supervisor can unlock or modify it.
                  </div>
                )}
                <div className="mt-8 mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Step 3 • Save Visit Status
                  </h4>
                </div>
                <Button
                  onClick={() => {
                    if (!FINAL_STATUSES.includes(status)) {
                      updateStatus();
                      return;
                    }
                    setShowLockDialog(true);
                  }}
                  disabled={
                    !status ||
                    selectedVisit !== visit.id ||
                    (status !== "NOT_MET" && !otpVerified)||
                    visit.isLocked
                  }
                  className="mt-5 w-full rounded-xl bg-black py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save Status
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showLockDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[450px] rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="text-xl font-bold">
              ⚠️ Final Confirmation
            </h2>
            <p className="mt-4 text-gray-700">
              Are you sure you want to submit this final status?
            </p>
            <p className="mt-3 text-red-600">
              Once submitted, this visit will be locked and cannot be changed by you.
              Only your supervisor can unlock or modify it later.
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <Button
                onClick={() => {
                  setShowLockDialog(false);
                  setStatus("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white"
                onClick={async () => {
                  const ok = await updateStatus();
                  if (ok) {
                    setShowLockDialog(false);
                  }
                }}
              >
                Confirm & Lock
              </Button>
            </div>
              
          </div>
              
        </div>
      )}
    </main>
  );
}
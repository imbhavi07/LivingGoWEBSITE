"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import axios from "axios";
import { Button } from "@/components/Button";

type Visit = {
  id: string;
  visitDate: string;
  timeSlot: string;
  meetingPointId: string | null;
  leadStatus: string;
  notes: string | null;
  updatedAt: string;

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

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("intern_token")
      : "";

  useEffect(() => {
    if (!id) return;
    loadVisitDetails();
  }, [id]);

  const loadVisitDetails = async () => {
    if (!token) {
      if (typeof window !== "undefined") {
        window.location.href = "/visiting/login";
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(
        `/visiting/lead/visit/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // The API returns the visit directly, not wrapped in visits array
      setVisit(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Failed to load visit details. Please try again."
        );
      } else {
        setError("Failed to load visit details. Please try again.");
      }
      console.error("Failed to load visit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!visit) return;

    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    if (!status) {
      setError("Please select a status");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await apiClient.patch(
        `/visiting/lead/visit/${id}`,
        {
          otp,
          status,
          notes: notes.trim() || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Visit updated successfully!");
      router.push("/visiting/dashboard");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Failed to update visit. Please check your OTP and try again."
        );
      } else {
        setError("Failed to update visit. Please check your OTP and try again.");
      }
      console.error("Failed to update visit:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
          <p className="mt-2 text-gray-600">Loading visit details...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-medium">{error}</p>
        </div>
        <div className="text-center">
          <a
            href="/visiting/dashboard"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </a>
        </div>
      </main>
    );
  }

  if (!visit) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Visit not found.</p>
          <div className="mt-4">
            <a
              href="/visiting/dashboard"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Visit Details
          </h1>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => router.back()}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Back
            </Button>
            <Button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("intern_token");
                  window.location.href = "/visiting/login";
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Visit Details Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Visit Info Header */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">
                    {visit.student.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {visit.student.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {visit.student.phone ?? "Phone not available"}
                </p>
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Visit Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Date
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {new Date(visit.visitDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Time Slot
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {visit.timeSlot}
                    </p>
                  </div>
                  {visit.meetingPointId && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Meeting Point
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {visit.meetingPointId}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Property Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Property Name
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {visit.property.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Location
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {visit.property.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Price
                    </p>
                    <p className="text-base font-semibold text-gray-900 font-mono">
                      ₹{visit.property.price.toLocaleString()}
                    </p>
                  </div>
                  {visit.property.propertyCode && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Property Code
                      </p>
                      <p className="text-base font-semibold text-gray-900">
                        {visit.property.propertyCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="px-6 pb-4 border-t border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  Current Status
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Last updated: {new Date(visit.updatedAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  visit.leadStatus === "SCHEDULED"
                    ? "bg-blue-100 text-blue-800"
                    : visit.leadStatus === "ASSIGNED"
                    ? "bg-yellow-100 text-yellow-800"
                    : visit.leadStatus === "MET"
                    ? "bg-green-100 text-green-800"
                    : visit.leadStatus === "NOT_MET"
                    ? "bg-red-100 text-red-800"
                    : visit.leadStatus === "INTERESTED_OTHER_PROPERTY"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {visit.leadStatus}
              </span>
            </div>
          </div>

          {/* Update Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Update Visit Status
            </h3>

            <div className="space-y-4">
              {/* Status Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                  disabled={submitting}
                >
                  <option value="">Select a status</option>
                  <option value="INTERESTED">Interested</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                  <option value="MET">Met</option>
                  <option value="NOT_MET">Not Met</option>
                  <option value="SUCCESSFUL">Successful</option>
                  <option value="NOT_SUCCESSFUL">Not Successful</option>
                </select>
                {submitting && status && (
                  <p className="mt-1 text-xs text-green-600">
                    Selected: {status}
                  </p>
                )}
              </div>

              {/* Notes Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-y disabled:opacity-50"
                  placeholder="Add any notes about the meeting or student feedback..."
                  disabled={submitting}
                >
                </textarea>
              </div>

              {/* OTP Verification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OTP Verification *
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  className="w-full rounded-lg border-gray-300 px-4 py-3 text-center text-lg font-mono font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                  placeholder="Enter 4-digit OTP"
                  disabled={submitting}
                />
                {submitting && otp && (
                  <p className="mt-1 text-xs text-blue-600">
                    Verifying OTP...
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={submitting || !otp || !status}
                  className="w-full rounded-lg bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Update Visit Status"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
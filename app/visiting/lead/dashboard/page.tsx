"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import {Button} from "@/components/Button";
type Visit = {
  id: string;
  visitDate: string;
  timeSlot: string;
  meetingPointId: string | null;
  leadStatus: string;

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
  const [status, setStatus] = useState("");

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

  async function updateStatus() {

    if (!selectedVisit) return;

    try {

      await apiClient.patch(

        `/visiting/lead/visit/${selectedVisit}`,

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

      alert("Visit updated successfully.");

      setSelectedVisit(null);

      setOtp("");

      setStatus("");

      loadVisits();

    } catch (err) {

      console.error(err);

      alert("Failed to update visit.");

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

          <button
            onClick={() => {

              localStorage.removeItem("lead_token");
              localStorage.removeItem("lead_name");

              window.location.href =
                "/visiting/lead";

            }}
            className="rounded-xl border bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800"
          >
            Logout
          </button>

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
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Student OTP"
                  value={selectedVisit === visit.id ? otp : ""}
                  onChange={(e) => {
                    setSelectedVisit(visit.id);
                    setOtp(e.target.value);
                  }}
                  className="mb-4 w-full rounded-xl border p-3"
                />
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  <button
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
                  </button>
                  <button
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
                  </button>
                  <button
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
                  </button>
                  <button
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
                  </button>
                  <button
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
                  </button>
                </div>
                <button
                  onClick={updateStatus}
                  disabled={!status || selectedVisit !== visit.id}
                  className="mt-5 w-full rounded-xl bg-black py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save Status
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
"use client";
import { Button } from "@/components/Button";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import axios from "axios";

type Visit = {
  id: string;
  visitDate: string;
  timeSlot: string;
  couponCode?: string | null;
  leadStatus: string;
  whatsappNumber?: string | null;

  student: {
    name: string;
    phone?: string | null;
  };

  property: {
    propertyCode?: string | null;
    title: string;
    location: string;
    price: number;

    owner: {
      name: string;
      phone?: string | null;
    };
  };
  intern?: {
    id: string;
    name: string;
    username: string;
    phone: string;
  } | null;
  meetingPointId?: string | null;
};

export default function VisitingDashboard() {
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  type Intern = {
    id: string;
    name: string;
    username: string;
    phone: string | null;
  };
  
  const [interns, setInterns] = useState<Intern[]>([]);
  const [selectedIntern, setSelectedIntern] = useState("");
  const [meetingPointId, setMeetingPointId] = useState("");
  
  useEffect(() => {
    loadVisits();
  }, []);
  
  async function loadVisits() {
    try {
      const response = await apiClient.get("/visiting/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("visiting_token")}`,
        },
      });
      console.log(response.data);
      setVisits(response.data.visits);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function openAssignModal(visit: Visit) {
    setSelectedVisit(visit);
    const response = await apiClient.get(
      `/visiting/${visit.id}/available-interns`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("visiting_token")}`,
        },
      }
    );
    setInterns(response.data.interns);
    setSelectedIntern(visit.intern?.id || "");
    setMeetingPointId(visit.meetingPointId || "");
    setShowAssignModal(true);
  }

  async function assignIntern() {
    if (!selectedVisit || !selectedIntern) return;

    try {
      console.log("Sending assignment:", {
        internId: selectedIntern,
        meetingPointId,
      });
      await apiClient.post(
        `/visiting/${selectedVisit.id}/assign-lead`,
        {
          internId: selectedIntern,
          meetingPointId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("visiting_token")}`,
          },
        }
      );

      setShowAssignModal(false);
      setSelectedIntern("");
      setMeetingPointId("");
      loadVisits();
    } catch (err: unknown) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        console.log(err.response?.data);
        alert(err.response?.data?.message || "Failed to assign intern");
      } else {
        alert("Failed to assign intern");
      }
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Visit Assignments
          </h1>
          <p className="text-gray-500 mt-1">
            Assign and manage student visits.
          </p>
        </div>
        <span className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
          {visits.length} Visits
        </span>
      </div>
      {loading && <div>Loading...</div>}
      <div className="space-y-6">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold">
                    {visit.property.title}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      visit.leadStatus === "ASSIGNED"
                        ? "bg-yellow-100 text-yellow-700"
                        : visit.leadStatus === "SCHEDULED"
                        ? "bg-red-100 text-red-700"
                        : visit.leadStatus === "SUCCESSFUL"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {visit.leadStatus.replaceAll("_", " ")}
                  </span>
                </div>

                <p className="mt-1 text-gray-600">
                  {visit.property.location}
                </p>

                <p className="mt-2 text-2xl font-bold">
                  ₹{visit.property.price}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {new Date(visit.visitDate).toLocaleDateString()} • {visit.timeSlot}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => openAssignModal(visit)}
                >
                  {visit.intern ? "Reassign" : "Assign"}
                </Button>

                {visit.intern && (
                  <Button
                    onClick={() => {
                      /* your WhatsApp code */
                    }}
                  >
                    WhatsApp
                  </Button>
                )}
              </div>
            </div>
              
            <div className="mt-5 grid grid-cols-3 gap-6 border-t pt-4">
              
              <div>
                <p className="text-xs uppercase text-gray-500">
                  Student
                </p>
              
                <p className="font-semibold">
                  {visit.student.name}
                </p>
              
                <p className="text-sm text-gray-600">
                  {visit.student.phone}
                </p>
              </div>
              
              <div>
                <p className="text-xs uppercase text-gray-500">
                  Assigned Intern
                </p>
              
                {visit.intern ? (
                  <>
                    <p className="font-semibold">
                      {visit.intern.name}
                    </p>
                
                    <p className="text-sm text-gray-600">
                      {visit.intern.username}
                    </p>
                
                    <p className="text-sm text-gray-600">
                      {visit.meetingPointId || "-"}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">
                    Not Assigned
                  </p>
                )}
              </div>
              
              <div>
                <p className="text-xs uppercase text-gray-500">
                  Coupon
                </p>
              
                <p className="font-semibold">
                  {visit.couponCode || "-"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showAssignModal && selectedVisit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 w-[500px]">
            <h2 className="text-2xl font-bold mb-6">Assign Intern</h2>

            <select
              className="border rounded p-3 w-full mb-4"
              value={selectedIntern}
              onChange={(e) => setSelectedIntern(e.target.value)}
            >
              <option value="">Select Intern</option>

              {interns.map((intern: Intern) => (
                <option key={intern.id} value={intern.id}>
                  {intern.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Meeting Point"
              className="border rounded p-3 w-full mb-4"
              value={meetingPointId}
              onChange={(e) => setMeetingPointId(e.target.value)}
            />

            <div className="flex gap-4">
              <button
                onClick={() => setShowAssignModal(false)}
                className="border rounded px-5 py-3"
              >
                Cancel
              </button>

              <button
                onClick={assignIntern}
                className="bg-black text-white rounded px-5 py-3"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
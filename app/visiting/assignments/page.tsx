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
      const response = await apiClient.get(
        "/visiting/dashboard",
        {
          headers: {
          Authorization: `Bearer ${localStorage.getItem(
          "visiting_token"
        )}`,},});
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
          Authorization: `Bearer ${localStorage.getItem(
            "visiting_token"
          )}`,
        },
      }
    );
    setInterns(response.data.interns);
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
          Authorization: `Bearer ${localStorage.getItem(
            "visiting_token"
          )}`,
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

    alert(
      err.response?.data?.message || "Failed to assign intern"
    );
  } else {
    alert("Failed to assign intern");
  }
}
}

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-8 text-4xl font-black">
        LivingGo Visiting Dashboard
      </h1>
      {loading && (
        <div>
          Loading...
        </div>
      )}
      <div className="space-y-6">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="rounded-2xl bg-white p-6 shadow"
          >
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="font-bold">
                  Student
                </h2>
                <p>
                  {visit.student.name}
                </p>
                <p>
                  {visit.student.phone}
                </p>
              </div>
              <div>
                <h2 className="font-bold">
                  Property
                </h2>
                <p>
                  {visit.property.propertyCode}
                </p>
                <p>
                  {visit.property.title}
                </p>
                <p>
                  ₹{visit.property.price}
                </p>
              </div>
              <div>
                <h2 className="font-bold">
                  Visit
                </h2>
                <p>
                  {new Date(
                    visit.visitDate
                  ).toLocaleDateString()}
                </p>
                <p>
                  {visit.timeSlot}
                </p>
              </div>
              <div>
                <h2 className="font-bold">
                  Coupon
                </h2>
                <p>
                  {visit.couponCode ?? "-"}
                </p>
              </div>
            </div>
            {visit.intern ? (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
                <h3 className="mb-3 text-lg font-bold text-green-800">
                  Assigned Lead
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Name:</span>{" "}
                    {visit.intern.name}
                  </p>
                  <p>
                    <span className="font-semibold">Username:</span>{" "}
                    {visit.intern.username}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span>{" "}
                    {visit.intern.phone}
                  </p>
                  <p>
                    <span className="font-semibold">Meeting Point:</span>{" "}
                    {visit.meetingPointId || "-"}
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={() => {
                        if (!visit.student.phone) {
                          alert("Student phone number is not available.");
                          return;
                        }
                      
                        const message = encodeURIComponent(
                          `Hi ${visit.student.name},

                          Your LivingGo property visit has been scheduled.

                          👤 Assigned Lead:
                          ${visit.intern?.name}

                          📞 Contact:
                          ${visit.intern?.phone}

                          📍 Meeting Point:
                          ${visit.meetingPointId}

                          📅 Date:
                          ${new Date(visit.visitDate).toLocaleDateString()}

                          ⏰ Time:
                          ${visit.timeSlot}

                          🏠 Property:
                          ${visit.property.title}

                          Please be available on time.

                          Thank you,
                          LivingGo`
                        );
                        window.open(
                          `https://wa.me/91${visit.student.phone}?text=${message}`,
                          "_blank"
                        );
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Send WhatsApp to Student
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => openAssignModal(visit)}
                className="mt-6 rounded-xl bg-black px-5 py-3 text-white"
              >
                Assign Lead
              </Button>
            )}
          </div>
        ))}
      </div>
      {showAssignModal && selectedVisit && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center">

<div className="bg-white rounded-2xl p-8 w-[500px]">

<h2 className="text-2xl font-bold mb-6">

Assign Intern

</h2>

<select
className="border rounded p-3 w-full mb-4"
value={selectedIntern}
onChange={(e)=>setSelectedIntern(e.target.value)}
>

<option value="">
Select Intern
</option>

{interns.map((intern: Intern) => (

<option
key={intern.id}
value={intern.id}
>

{intern.name}

</option>

))}

</select>

<input
placeholder="Meeting Point"
className="border rounded p-3 w-full mb-4"
value={meetingPointId}
onChange={(e)=>setMeetingPointId(e.target.value)}
/>

<div className="flex gap-4">

<Button
onClick={()=>setShowAssignModal(false)}
className="border rounded px-5 py-3"
>

Cancel

</Button>

<Button
  onClick={assignIntern}
  className="bg-black text-white rounded px-5 py-3"
>
  Assign
</Button>

</div>

</div>

</div>

)}
    </main>
  );

  }
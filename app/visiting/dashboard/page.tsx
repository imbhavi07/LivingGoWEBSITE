"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { apiClient } from "@/lib/api/client";

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
};

export default function VisitingDashboard() {
  type Intern = {
    id: string;
    name: string;
    username: string;
    phone?: string | null;
};

const [interns, setInterns] = useState<Intern[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const [selectedIntern, setSelectedIntern] = useState("");
  const [pickupPoint, setPickupPoint] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<Visit[]>([]);
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
        const internRes = await apiClient.get("/visiting/interns", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("visiting_token")}`,
          },
        });
        setInterns(internRes.data.interns);
        console.log(response.data);
      setVisits(response.data.visits);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const assignLead = (visitId: string) => {
    setSelectedVisit(visitId);
    setShowAssignModal(true);
  };
const confirmAssignment = async () => {
  if (!selectedIntern || !pickupPoint) {
    alert("Select intern and pickup point");
    return;
  }

  try {
    await apiClient.post(
      `/visiting/${selectedVisit}/assign-lead`,
      {
        internId: selectedIntern,
        pickupPoint,
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
    setPickupPoint("");
    loadVisits();
  } catch (err: unknown) {
    const error = err as {
      response?: {
          data?: {
              message?: string;
          };
      };
  };
  alert(error.response?.data?.message ?? "Assignment failed");
  }
};
  return (
  <main className="min-h-screen bg-[#f6f6f6] p-10">

    <div className="mb-10">
      <h1 className="text-5xl font-black text-[#5B3416]">
        LivingGo Visiting Dashboard
      </h1>

      <p className="mt-2 text-gray-500">
        Manage interns and scheduled student visits.
      </p>
    </div>

    <Button
      onClick={() => {
        localStorage.removeItem("visiting_token");
        window.location.href = "/visiting/login";
      }}
      className="rounded-xl border bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
    >
      Logout
    </Button>

    <div className="grid gap-8 lg:grid-cols-2">

      <Link href="/visiting/interns">
        <div className="rounded-3xl border bg-white p-8 shadow-sm transition hover:shadow-xl cursor-pointer">

          <h2 className="text-3xl font-bold mb-3">
            Intern Management
          </h2>

          <p className="text-gray-500">
            Create intern accounts, generate login IDs and passwords,
            and manage existing interns.
          </p>

        </div>
      </Link>

      <Link href="/visiting/assignments">
        <div className="rounded-3xl border bg-white p-8 shadow-sm transition hover:shadow-xl cursor-pointer">

          <h2 className="text-3xl font-bold mb-3">
            Scheduled Visits
          </h2>

          <p className="text-gray-500">
            View scheduled visits, assign interns and select pickup points.
          </p>

        </div>
      </Link>

    </div>

  </main>
);
}
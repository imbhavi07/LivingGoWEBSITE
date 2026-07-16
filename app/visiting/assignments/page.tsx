"use client";

import { useEffect, useState } from "react";
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
        console.log(response.data);

      setVisits(response.data.visits);

    } catch (e) {

      console.error(e);

    } finally {

      setLoading(false);

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

            <button
              className="mt-6 rounded-xl bg-black px-5 py-3 text-white"
            >
              Assign Lead
            </button>

          </div>

        ))}

      </div>

    </main>

  );

}
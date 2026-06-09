"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminUserProperties } from "@/lib/api/admin";

type UserData = {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
  };
  properties: {
    id: string;
    title: string;
    location: string;
  }[];
};

export default function AdminUserPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<UserData | null>(null);

  useEffect(() => {
    getAdminUserProperties(params.id).then(setData);
  }, [params.id]);

  if (!data) {
    return (
      <AdminShell>
        <div className="h-96 animate-pulse rounded-3xl bg-white" />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h1 className="text-3xl font-black text-ink">
            {data.user.name}
          </h1>

          <p className="mt-2 text-muted">
            {data.user.email}
          </p>

          {data.user.phone && (
            <p className="text-muted">
              {data.user.phone}
            </p>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-xl font-black text-ink">
            Properties
          </h2>

          <div className="space-y-3">
            {data.properties.map((property) => (
              <div
                key={property.id}
                className="flex items-center justify-between rounded-2xl border p-4"
              >
                <div>
                  <p className="font-black text-ink">
                    {property.title}
                  </p>

                  <p className="text-sm text-muted">
                    {property.location}
                  </p>
                </div>

                <Link
                  href={`/admin/listings/${property.id}`}
                  className="rounded-xl bg-ink px-4 py-2 text-white"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
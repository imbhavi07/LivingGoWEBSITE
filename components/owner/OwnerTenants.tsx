"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { getOwnerTenants } from "@/lib/api/token-payment";

export function OwnerTenants() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getOwnerTenants();
        setTenants(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="h-40 animate-pulse rounded-3xl bg-white shadow-soft" />
    );
  }

  return (
    <section className="rounded-3xl bg-white shadow-soft p-6">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-black">
        <Users className="h-5 w-5" />
        Current Tenants
      </h2>

      {tenants.length === 0 ? (
        <p className="text-muted">
          No active tenants.
        </p>
      ) : (
        <div className="space-y-4">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="rounded-2xl border p-4"
            >
              <p className="font-black">
                {tenant.student.name}
              </p>

              <p className="text-sm text-muted">
                {tenant.property.title}
              </p>

              <p className="text-sm">
                {tenant.student.phone}
              </p>

              <p className="text-xs text-muted mt-2">
                Joined{" "}
                {new Date(
                  tenant.createdAt
                ).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
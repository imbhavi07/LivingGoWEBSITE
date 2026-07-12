"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { getAdminProperties } from "@/lib/api/admin-properties";

export default function AdminPropertiesPage() {
  const [search, setSearch] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  useEffect(() => {
    getAdminProperties(search).then(setProperties);
  }, [search]);
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-4xl font-black">
          Property Management
        </h1>
        <p className="text-muted">
          Manage every LivingGo property.
        </p>
      </div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"/>
        <input
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="Search by Property Code, Name, Owner..."
          className="input pl-12"
        />
      </div>
      <div className="space-y-4">
        {properties.map((property)=>(
          <Link
            key={property.id}
            href={`/admin/properties/${property.id}`}
          >
            <div className="rounded-3xl border bg-white p-6 hover:shadow-lg">
              <div className="flex justify-between">
                <div>
                  <div className="font-mono text-sm text-clay">
                    {property.propertyCode}
                  </div>
                  <h2 className="text-2xl font-bold">
                    {property.title}
                  </h2>
                  <p>
                    {property.owner.name}
                  </p>
                  <p>
                    {property.location}
                  </p>
                </div>
                <div className="text-right">
                  <div>
                    Students
                  </div>
                  <div className="text-3xl font-black">
                    {property._count.tenants}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
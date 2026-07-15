"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { AdminPropertyForm } from "@/components/admin/AdminPropertyForm";
import { getAdminProperties } from "@/lib/api/admin-properties";

export default function AdminPropertiesPage() {
  const [search, setSearch] = useState("");

  type Property = {
    id: string | number;
    propertyCode: string;
    title: string;
    owner: { name: string };
    manualOwnerName?: string;
    location?: string;
    _count: { tenants: number };
  };

  const [properties, setProperties] = useState<Property[]>([]);
  const { user } = useAuthContext();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    getAdminProperties(search).then(setProperties);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black">
            Property Management
          </h1>
          <p className="text-muted">
            Manage every LivingGo property.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-3 mt-4 sm:mt-0">
          {isSuperAdmin && (
            <Link 
              href="/admin/properties/create" 
              className="btn-primary px-6 py-3 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Create Property
            </Link>
          )}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"/>
            <input
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="Search by Property Code, Name, Owner..."
              className="input pl-8"
            />
          </div>
        </div>
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
                <p className="font-medium text-ink/80">
                  {/* Safely check for owner, fallback to manual name, then fallback to generic text */}
                  {property.owner?.name || property.manualOwnerName || "Admin Listed"}
                </p>
                <p className="text-muted">
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
    </div>
  );
}
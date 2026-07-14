"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCreateProperty } from "@/hooks/useAdmin";
import { useToast } from "@/contexts/ToastContext";
import { CreatePropertyModal } from "./CreatePropertyModal";
import { getAdminProperties } from "@/lib/api/admin-properties";

export default function AdminPropertiesPage() {
  const [search, setSearch] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuthContext();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const { create: createProperty } = useCreateProperty();
  const { showToast } = useToast();

  useEffect(() => {
    getAdminProperties(search).then(setProperties);
  }, [search]);

  const handleCreateProperty = async (formData: FormData) => {
    setIsCreating(true);
    try {
      await createProperty(formData);
      setIsCreating(false);
      // Refresh the properties list
      getAdminProperties(search).then(setProperties);
      showToast("Property created successfully!", "success");
    } catch (error) {
      setIsCreating(false);
      showToast("Failed to create property. Please try again.", "error");
    }
  };

  return (
    <main className="space-y-6">
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
            <button
              onClick={() => setIsCreating(true)}
              className="btn-primary px-6 py-3 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Create Property
            </button>
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

      {isCreating && (
        <CreatePropertyModal
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
          onCreate={handleCreateProperty}
        />
      )}
    </main>
  );
}
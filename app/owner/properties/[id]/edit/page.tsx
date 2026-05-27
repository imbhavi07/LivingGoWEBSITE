"use client";

import { useParams } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { OwnerPropertyForm } from "@/components/owner/OwnerPropertyForm";
import { useOwnerProperty } from "@/hooks/useOwnerProperties";

export default function EditOwnerPropertyPage() {
  const params = useParams<{ id: string }>();
  const { property, isLoading } = useOwnerProperty(params.id);

  return (
    <OwnerShell>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase text-clay">Update listing</p>
        <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Edit property</h1>
      </div>
      {isLoading ? <div className="h-[520px] animate-pulse rounded-3xl bg-white shadow-soft" /> : null}
      {!isLoading && !property ? <EmptyState title="Property not found" message="This listing may no longer exist." /> : null}
      {property ? <OwnerPropertyForm property={property} /> : null}
    </OwnerShell>
  );
}

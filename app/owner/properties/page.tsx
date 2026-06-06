"use client";

import Image from "next/image";
import Link from "next/link";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { buttonClasses } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { OwnerTableSkeleton } from "@/components/owner/OwnerTableSkeleton";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { formatPrice } from "@/lib/utils";

export default function OwnerPropertiesPage() {
  const { properties, isLoading, error, remove, toggleStatus } = useOwnerProperties();

  return (
    <OwnerShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-clay">Portfolio</p>
          <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Your Properties</h1>
        </div>
        <Link href="/owner/properties/new" className={buttonClasses("primary")}>
          <Plus className="h-4 w-4" aria-hidden />
          Add Property
        </Link>
      </div>
      {error ? <p className="mb-4 rounded-2xl bg-white p-4 text-sm font-semibold text-clay shadow-soft">{error}</p> : null}
      {isLoading ? <OwnerTableSkeleton /> : null}
      {!isLoading && properties.length === 0 ? (
        <EmptyState title="No properties yet" message="Create your first PG or flat listing to start receiving student enquiries." />
      ) : null}
      {!isLoading && properties.length ? (
        <section className="overflow-hidden rounded-3xl bg-white shadow-soft">
          {properties.map((property) => (
            <article key={property.id} className="grid gap-4 border-b border-black/5 p-4 last:border-0 md:grid-cols-[112px_1fr_auto] md:items-center">
              
              {/* 1. Clickable Image Panel */}
              <Link href={`/owner/properties/${property.id}`} className="relative h-28 overflow-hidden rounded-2xl bg-oat md:h-24 hover:opacity-80 transition-opacity block">
                <Image src={property.images[0]} alt={property.title} fill className="object-cover" sizes="120px" />
              </Link>
              
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* 2. Clickable Title */}
                  <Link href={`/owner/properties/${property.id}`} className="hover:underline cursor-pointer">
                    <h2 className="text-lg font-black text-ink">{property.title}</h2>
                  </Link>
                  <span className="rounded-full bg-linen px-3 py-1 text-xs font-bold capitalize text-muted">
                    {property.status === "active" ? "approved" : property.status}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-muted">{property.location}</p>
                <p className="mt-2 text-lg font-black text-ink">{formatPrice(property.price)}/mo</p>
              </div>

              {/* 3. Actions (Untouched) */}
              <div className="flex flex-wrap gap-2 md:justify-end">
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-linen px-4 text-sm font-bold text-ink">
                  <input
                    type="checkbox"
                    checked={property.status !== "inactive"}
                    onChange={(event) => void toggleStatus(property.id, event.target.checked)}
                    className="h-4 w-4 accent-ink"
                  />
                  Visible
                </label>
                
                <Link href={`/owner/properties/${property.id}/edit`} className={buttonClasses("secondary", undefined, "px-4")}>
                  <Edit3 className="h-4 w-4" aria-hidden />
                  Edit
                </Link>
                
                <button
                  className={buttonClasses("ghost", undefined, "px-4 text-clay")}
                  onClick={() => {
                    if (confirm("Delete this property?")) void remove(property.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </OwnerShell>
  );
}

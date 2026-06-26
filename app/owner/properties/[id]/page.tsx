"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { EmptyState } from "@/components/EmptyState";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { PropertyEditForm, type PropertyEditPayload } from "@/components/PropertyEditForm";
import { useOwnerProperty } from "@/hooks/useOwnerProperties";
import { updateOwnerProperty } from "@/lib/api/owner-properties";

export default function PropertyDashboardPage() {
  const params = useParams<{ id: string }>();
  const { property, isLoading, mutate } = useOwnerProperty(params.id);
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { getToken } = useAuth();

  async function handleSave(payload: PropertyEditPayload) {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const token = await getToken();
      await updateOwnerProperty(params.id, {
        ...payload,
        imageFiles: [],
      }as never , token ?? "");
      await mutate();
      setSaveSuccess(true);
      setActiveTab("Overview");
    } catch {
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const tabs = ["Overview", "Edit", "Tenants", "Complaints", "Expenses"];

  if (isLoading) {
    return (
      <OwnerShell>
        <div className="h-[520px] animate-pulse rounded-3xl bg-white shadow-soft" />
      </OwnerShell>
    );
  }

  if (!property) {
    return (
      <OwnerShell>
        <EmptyState title="Property not found" message="This listing may no longer exist." />
      </OwnerShell>
    );
  }

  return (
    <OwnerShell>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-clay">Property Dashboard</p>
            <h1 className="mt-2 text-3xl font-black text-ink">{property.title}</h1>
          </div>
          <button className="rounded-md bg-ink px-4 py-2 text-white transition hover:bg-clay">
            Quick Actions
          </button>
        </div>

        {/* Rent Progress Bar */}
        <div className="mt-6">
          <div className="mb-2 flex items-center">
            <span className="font-medium text-ink">Rent Collected</span>
            <span className="ml-auto text-sm text-ink">6/10 students</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted">
            <div className="h-2.5 w-3/5 rounded-full bg-[#4CBB17]"/>
          </div>
        </div>

        {/* Tabbed Navigation */}
        <div className="mt-6">
          <div className="flex border-b border-clay/20">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "border-b-2 border-ink text-ink"
                    : "text-clay/90 hover:text-ink"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === "Overview" && (
              <div className="space-y-4">
                {saveSuccess && (
                  <div className="rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
                    ✓ Changes saved successfully. Your listing is under review.
                  </div>
                )}
                <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-black/5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-muted">Location</p>
                      <p className="mt-1 font-black text-ink">{property.location}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-muted">Room Type</p>
                      <p className="mt-1 font-black text-ink">{property.roomType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-muted">Preference</p>
                      <p className="mt-1 font-black text-ink">{property.preference}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-muted">Status</p>
                      <p className="mt-1 font-black text-ink capitalize">{property.status}</p>
                    </div>
                    {property.mealPlan && (
                      <div>
                        <p className="text-xs font-bold uppercase text-muted">Meals</p>
                        <p className="mt-1 font-black text-ink">{property.mealPlan}</p>
                      </div>
                    )}
                  </div>
                  {property.facilities.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-bold uppercase text-muted">Facilities</p>
                      <div className="flex flex-wrap gap-2">
                        {property.facilities.map((f) => (
                          <span key={f} className="rounded-full bg-linen px-3 py-1 text-xs font-bold text-ink">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "Edit" && (
              <div>
                {saveError && (
                  <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
                    {saveError}
                  </div>
                )}
                <PropertyEditForm
                  initialData={{
                    title: property.title,
                    description: property.description,
                    price: property.price,
                    priceSingle: property.priceSingle,
                    bedsSingle: property.bedsSingle ?? undefined,
                    priceDouble: property.priceDouble,
                    bedsDouble: property.bedsDouble ?? undefined,
                    priceTriple: property.priceTriple,
                    bedsTriple: property.bedsTriple ?? undefined,
                    location: property.location,
                    roomType: property.roomType ?? "PG",
                    preference: property.preference ?? "Any",
                    mealPlan: property.mealPlan ?? undefined,
                    mealTimes: property.mealTimes,
                    curfewTime: property.curfewTime ?? undefined,
                    noticePeriod: property.noticePeriod ?? undefined,
                    rulesStrictness: property.rulesStrictness ?? undefined,
                    facilities: property.facilities,
                  }}
                  onSave={handleSave}
                  onCancel={() => setActiveTab("Overview")}
                  isSaving={isSaving}
                />
              </div>
            )}

            {activeTab === "Tenants" && (
              <p className="text-clay">Tenants tab — coming soon.</p>
            )}
            {activeTab === "Complaints" && (
              <p className="text-clay">Complaints tab — coming soon.</p>
            )}
            {activeTab === "Expenses" && (
              <p className="text-clay">Expenses tab — coming soon.</p>
            )}
          </div>
        </div>
      </div>
    </OwnerShell>
  );
}

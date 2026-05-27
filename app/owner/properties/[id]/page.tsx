"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { useOwnerProperty } from "@/hooks/useOwnerProperties";

export default function PropertyDashboardPage() {
  const params = useParams<{ id: string }>();
  const { property, isLoading } = useOwnerProperty(params.id);
  const [activeTab, setActiveTab] = useState<string>("Overview");

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
          <button className="px-4 py-2 bg-ink text-white rounded-md hover:bg-clay transition">
            Quick Actions
          </button>
        </div>
        {/* Rent Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center mb-2">
            <span className="font-medium text-ink">Rent Collected</span>
            <span className="ml-auto text-sm text-ink">6/10 students</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="bg-[#4CBB17] h-2.5 rounded-full" style={{ width: "60%" }}></div>
          </div>
        </div>

        {/* Tabbed Navigation */}
        <div className="mt-6">
          <div className="flex border-b border-clay/20">
            <button
              onClick={() => setActiveTab("Overview")}
              className={`px-4 py-3 text-sm font-medium transition-all
                ${activeTab === "Overview"
                  ? "text-ink border-b-2 border-ink"
                  : "text-clay/90 hover:text-ink"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("Tenants")}
              className={`px-4 py-3 text-sm font-medium transition-all
                ${activeTab === "Tenants"
                  ? "text-ink border-b-2 border-ink"
                  : "text-clay/90 hover:text-ink"}`}
            >
              Tenants
            </button>
            <button
              onClick={() => setActiveTab("Complaints")}
              className={`px-4 py-3 text-sm font-medium transition-all
                ${activeTab === "Complaints"
                  ? "text-ink border-b-2 border-ink"
                  : "text-clay/90 hover:text-ink"}`}
            >
              Complaints
            </button>
            <button
              onClick={() => setActiveTab("Expenses")}
              className={`px-4 py-3 text-sm font-medium transition-all
                ${activeTab === "Expenses"
                  ? "text-ink border-b-2 border-ink"
                  : "text-clay/90 hover:text-ink"}`}
            >
              Expenses
            </button>
          </div>
          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "Overview" && (
              <div className="space-y-4">
                <p className="text-clay">Overview tab content placeholder. Here you would show property summary, key metrics, etc.</p>
              </div>
            )}
            {activeTab === "Tenants" && (
              <div className="space-y-4">
                <p className="text-clay">Tenants tab content placeholder. Here you would list tenants, lease details, etc.</p>
              </div>
            )}
            {activeTab === "Complaints" && (
              <div className="space-y-4">
                <p className="text-clay">Complaints tab content placeholder. Here you would show maintenance requests, complaints, etc.</p>
              </div>
            )}
            {activeTab === "Expenses" && (
              <div className="space-y-4">
                <p className="text-clay">Expenses tab content placeholder. Here you would show expense tracking, income vs expenses, etc.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </OwnerShell>
  );
}
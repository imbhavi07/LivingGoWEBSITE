"use client";

import { Building2, CheckCircle2, Clock3, Shield, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { useAdminStats } from "@/hooks/useAdmin";
import { useAdminVisits } from "@/hooks/useAdminVisits";
import { VisitStatusDropdown } from "@/components/admin/VisitStatusDropdown";
import { Button } from "@/components/Button";
export default function AdminDashboardPage() {
  const { stats, isLoading } = useAdminStats();
  const { visits, isLoading: visitsLoading } = useAdminVisits();

  return (
    <AdminShell>
      <div className="mb-6">
        <p className="text-sm font-black uppercase text-clay">Internal overview</p>
        <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Admin dashboard</h1>
      </div>
      {isLoading || !stats ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-3xl bg-white shadow-soft" />
          ))}
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <AdminStatCard label="Total users" value={stats.totalUsers} icon={Users} />
          <AdminStatCard label="Total properties" value={stats.totalProperties} icon={Building2} />
          <AdminStatCard label="Pending listings" value={stats.pendingApprovals} icon={Clock3} />
          <AdminStatCard label="Approved listings" value={stats.approvedListings} icon={CheckCircle2} />
          <AdminStatCard label="Owner approvals" value={stats.pendingOwnerApprovals ?? 0} icon={Shield} />
        </section>
      )}
      <section className="mt-6 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
        <h2 className="text-2xl font-black text-ink">Moderation queue</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Review pending listings, validate owner submissions, remove fake properties, and suspend spam accounts from the dedicated moderation screens.
        </p>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5">
        <h2 className="text-2xl font-black text-ink">Visit Management</h2>
        <p className="mt-2 text-sm text-muted">
          Monitor and manage scheduled property visits. Update visit statuses or transfer visits between properties as needed.
        </p>
        {visitsLoading ? (
          <div className="h-96 animate-pulse rounded-3xl bg-white shadow-soft" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-8 w-8">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={visit.student?.imageUrl ?? "/placeholder-profile.jpg"}
                            alt=""
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-">{visit.student?.name ?? "Unknown"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-">{visit.property?.title ?? "Unknown Property"}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-mono text-">{visit.tokenId}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {visit.couponCode ? (
                        <span className="px-2 px-3 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {visit.couponCode}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <VisitStatusDropdown
                        visitId={visit.id}
                        // visit.leadStatus may be a string from the API - assert to the expected enum/type
                        currentStatus={visit.leadStatus as any}
                        onStatusChange={(newStatus) => {
                          // This would call an API to update the visit status
                          console.log(`Updating visit ${visit.id} status to ${newStatus}`);
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => {
                          // This would open a transfer property dialog
                          console.log(`Transferring visit ${visit.id} to different property`);
                        }}
                      >
                        Transfer Property
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
        </section>
      </AdminShell>
    );
  }
 

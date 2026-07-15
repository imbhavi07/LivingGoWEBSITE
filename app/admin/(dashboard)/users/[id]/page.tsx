"use client";

// app/admin/users/[id]/page.tsx  (FULL REPLACEMENT)
// Shows owner info + all properties with rating, room occupancy, review count

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { StarRating } from "@/components/StarRating";
import { getAdminUserProperties } from "@/lib/api/admin";

type RatingData = {
  overall: number | null;
  count: number;
};

type Property = {
  id: string;
  title: string;
  location: string;
  status: string;
  price: number;
  occupiedBeds: number;
  totalBeds: number;
  availableBeds: number;
  rating: RatingData;
  _count: { reviews: number; tenants: number };
  createdAt: string;
};

type UserData = {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    status: string;
    verificationStatus: string;
  };
  properties: Property[];
};

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-green-50 text-green-700",
  pending:  "bg-amber-50  text-amber-700",
  rejected: "bg-red-50    text-red-700",
  inactive: "bg-gray-100  text-gray-500",
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
        <div className="space-y-4">
          <div className="h-36 animate-pulse rounded-3xl bg-white" />
          <div className="h-96 animate-pulse rounded-3xl bg-white" />
        </div>
      </AdminShell>
    );
  }

  const { user, properties } = data;

  return (
    <AdminShell>
      <div className="space-y-6">

        {/* Owner info card */}
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-ink">{user.name}</h1>
              <p className="mt-1 text-muted">{user.email}</p>
              {user.phone && <p className="text-muted">{user.phone}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${user.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {user.status}
              </span>
              <span className="rounded-full bg-linen px-3 py-1 text-xs font-bold text-ink capitalize">
                {user.role}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${user.verificationStatus === "approved" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                KYC: {user.verificationStatus.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Properties */}
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="mb-5 text-xl font-black text-ink">
            Listed Properties
            <span className="ml-2 text-base font-semibold text-muted">({properties.length})</span>
          </h2>

          {properties.length === 0 && (
            <p className="text-sm text-muted">No properties listed yet.</p>
          )}

          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="rounded-2xl border border-black/8 p-5 hover:border-black/20 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-black text-ink text-lg">{property.title}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${STATUS_COLORS[property.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {property.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted mb-2">{property.location}</p>

                    {/* Rating row */}
                    <StarRating
                      value={property.rating.overall}
                      count={property.rating.count}
                      size="sm"
                    />
                  </div>

                  <Link
                    href={`/admin/listings/${property.id}`}
                    className="rounded-xl bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-ink/80 transition-colors shrink-0"
                  >
                    View Listing
                  </Link>
                </div>

                {/* Stats row */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-4 border-t border-black/5">
                  <div>
                    <p className="text-xs text-muted">Monthly Rent</p>
                    <p className="text-sm font-black text-ink">
                      ₹{property.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Rooms</p>
                    <p className="text-sm font-black text-ink">
                      {property.occupiedBeds}/{property.totalBeds} occupied
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Available</p>
                    <p className={`text-sm font-black ${property.availableBeds === 0 ? "text-red-600" : "text-green-700"}`}>
                      {property.availableBeds} beds left
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Reviews</p>
                    <p className="text-sm font-black text-ink">{property._count.reviews}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminShell>
  );
}
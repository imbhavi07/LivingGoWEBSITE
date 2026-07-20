"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Eye, Trash2, X } from "lucide-react";
import { useState } from "react";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { buttonClasses } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { useAdminListings } from "@/hooks/useAdmin";
import { formatPrice, formatIST } from "@/lib/utils";
import { Button } from "@/components/Button";

// yahan pe image optimization daala hai
const optimizeImageUrl = (url: string | undefined): string => {
  if (!url) return "/placeholder-property.jpg";

  if (url.includes("res.cloudinary.com")) {
    let optimizedUrl = url;
    if (!optimizedUrl.includes("f_auto")) {
      optimizedUrl = optimizedUrl.replace("/upload/", "/upload/f_auto,q_auto/");
    }
    return optimizedUrl.replace(/\.heic$/i, ".webp");
  }

  return url;
};

export default function AdminListingsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    | "NEWEST"
    | "OLDEST"
    | "PRICE_LOW"
    | "PRICE_HIGH"
    | "NAME_ASC"
    | "NAME_DESC"
  >("NEWEST");
  const { listings, isLoading, approve, reject, remove } = useAdminListings(search);
  const sortedListings = [...listings].sort((a, b) => {
    switch (sortBy) {
      case "PRICE_LOW":
        return a.price - b.price;
      case "PRICE_HIGH":
        return b.price - a.price;
      case "NAME_ASC":
        return a.title.localeCompare(b.title);
      case "NAME_DESC":
        return b.title.localeCompare(a.title);
      case "OLDEST":
        return (
          new Date(a.submittedAt).getTime() -
          new Date(b.submittedAt).getTime()
        );
      default:
        return (
          new Date(b.submittedAt).getTime() -
          new Date(a.submittedAt).getTime()
        );
    }
  }); 

  return (
    <AdminShell>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

        <AdminSearch
          value={search}
          onChange={setSearch}
          placeholder="Search listings, owners, status"
        />

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as typeof sortBy)
          }
          className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium shadow-sm outline-none focus:border-clay"
        >
          <option value="NEWEST">Newest First</option>
          <option value="OLDEST">Oldest First</option>
          <option value="PRICE_LOW">
            Price: Low → High
          </option>
          <option value="PRICE_HIGH">
            Price: High → Low
          </option>
          <option value="NAME_ASC">
            Name: A → Z
          </option>
          <option value="NAME_DESC">
            Name: Z → A
          </option>
        </select>
        <div>
          <p className="text-sm font-black uppercase text-clay">Listing moderation</p>
          <h1 className="mt-2 text-3xl font-black text-ink sm:text-5xl">Submitted properties</h1>
        </div>
        <AdminSearch value={search} onChange={setSearch} placeholder="Search listings, owners, status" />
      </div>
      {isLoading ? <div className="h-96 animate-pulse rounded-3xl bg-white shadow-soft" /> : null}
      {!isLoading && listings.length === 0 ? (
        <EmptyState title="No listings found" message="Try a different search query or check again after new owner submissions." />
      ) : null}
      {!isLoading && listings.length ? (
        <section className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-black/5">
          {sortedListings.map((listing) => (
            <article key={listing.id} className="grid gap-4 border-b border-black/5 p-4 last:border-0 xl:grid-cols-[112px_1fr_auto] xl:items-center">
              <div className="relative h-28 overflow-hidden rounded-2xl bg-oat xl:h-24">
                <Image src={optimizeImageUrl(listing.images[0]?.url)} alt={listing.title} fill className="object-cover" sizes="128px" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black text-ink">{listing.title}</h2>
                  <AdminStatusBadge status={listing.status} />
                </div>
                <p className="mt-1 text-sm font-semibold text-muted">{listing.ownerName} • {listing.location}</p>
                <p className="mt-2 text-lg font-black text-ink">{formatPrice(listing.price)}/mo</p>
                <p className="mt-1 text-xs font-semibold text-muted">Listed: {formatIST(listing.submittedAt)}</p>
              </div>
              <div className="flex flex-wrap gap-2 xl:justify-end">
                {/* View button (kept as a Link, but with visible styling) */}
                <Link
                  href={`/admin/listings/${listing.id}`}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Eye className="h-4 w-4" aria-hidden />
                  View
                </Link>

                {/* Approve button */}
                <button
                  onClick={() => void approve(listing.id)}
                  className="px-4 py-2 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 transition-colors"
                >
                  <Check className="h-4 w-4" aria-hidden />
                  Approve
                </button>

                {/* Reject button */}
                <button
                  onClick={() => void reject(listing.id)}
                  className="px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors"
                >
                  <X className="h-4 w-4" aria-hidden />
                  Reject
                </button>

                {/* Delete button */}
                <button
                  onClick={() => {
                    if (confirm("Delete this fake or spam listing?")) void remove(listing.id);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </AdminShell>
  );
}
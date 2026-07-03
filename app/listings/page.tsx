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

// Helper to force Cloudinary to convert HEIC uploads to ultra-light WebP inline strings
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
  const { listings, isLoading, approve, reject, remove } = useAdminListings(search);

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
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
          {listings.map((listing) => (
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
                <Link href={`/admin/listings/${listing.id}`} className={buttonClasses("secondary", undefined, "px-4")}>
                  <Eye className="h-4 w-4" aria-hidden />
                  View
                </Link>
                <button className={buttonClasses("secondary", undefined, "px-4 text-moss")} onClick={() => void approve(listing.id)}>
                  <Check className="h-4 w-4" aria-hidden />
                  Approve
                </button>
                <button className={buttonClasses("secondary", undefined, "px-4 text-amber-700")} onClick={() => void reject(listing.id)}>
                  <X className="h-4 w-4" aria-hidden />
                  Reject
                </button>
                <button
                  className={buttonClasses("ghost", undefined, "px-4 text-red-700")}
                  onClick={() => {
                    if (confirm("Delete this fake or spam listing?")) void remove(listing.id);
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
    </AdminShell>
  );
}
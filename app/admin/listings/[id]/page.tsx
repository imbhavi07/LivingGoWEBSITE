"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { Check, Trash2, X } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { approveListing, deleteListing, rejectListing } from "@/lib/api/admin";
import { useAdminListing } from "@/hooks/useAdmin";
import { formatPrice } from "@/lib/utils";

export default function AdminListingDetailsPage() {
  const params = useParams<{ id: string }>();
  const { listing, isLoading } = useAdminListing(params.id);

  return (
    <AdminShell>
      {isLoading ? <div className="h-[620px] animate-pulse rounded-3xl bg-white shadow-soft" /> : null}
      {!isLoading && !listing ? <EmptyState title="Listing not found" message="This submission may have been deleted." /> : null}
      {listing ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-black/5">
            <div className="grid gap-3 md:grid-cols-3">
              {listing.images.slice(0, 3).map((image) => (
                <div key={image} className="relative h-56 overflow-hidden rounded-2xl bg-oat">
                  <Image src={image} alt={listing.title} fill className="object-cover" sizes="33vw" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <AdminStatusBadge status={listing.status} />
              <p className="text-sm font-bold text-muted">Submitted by {listing.ownerName}</p>
            </div>
            <h1 className="mt-3 text-3xl font-black text-ink">{listing.title}</h1>
            <p className="mt-3 text-base leading-8 text-muted">{listing.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {listing.facilities.map((facility) => (
                <span key={facility} className="rounded-full bg-linen px-3 py-1 text-xs font-bold text-ink">{facility}</span>
              ))}
            </div>
          </section>
          <aside className="h-fit rounded-3xl bg-white p-5 shadow-soft ring-1 ring-black/5">
            <p className="text-sm font-bold uppercase text-muted">Moderation details</p>
            <p className="mt-2 text-4xl font-black text-ink">{formatPrice(listing.price)}</p>
            <div className="mt-5 space-y-3 rounded-3xl bg-linen p-4 text-sm font-bold text-ink">
              <p>Location: {listing.location}</p>
              <p>Room: {listing.roomType}</p>
              <p>Preference: {listing.preference}</p>
            </div>
            <div className="mt-5 grid gap-3">
              <Button onClick={() => void approveListing(listing.id)}><Check className="h-4 w-4" aria-hidden />Approve listing</Button>
              <Button variant="secondary" onClick={() => void rejectListing(listing.id)}><X className="h-4 w-4" aria-hidden />Reject listing</Button>
              <Button variant="ghost" className="text-red-700" onClick={() => void deleteListing(listing.id)}><Trash2 className="h-4 w-4" aria-hidden />Delete fake listing</Button>
            </div>
          </aside>
        </div>
      ) : null}
    </AdminShell>
  );
}

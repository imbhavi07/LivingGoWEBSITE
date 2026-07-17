"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { isAxiosError } from "axios"; 
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { AdminPropertyForm } from "@/components/admin/AdminPropertyForm";
import { approveListing, rejectListing, updateListingWithFormData } from "@/lib/api/admin";
import { OwnerListingStatus } from "@/types/owner";
import { useAdminListing } from "@/hooks/useAdmin";
import { useToast } from "@/contexts/ToastContext";
import { formatPrice } from "@/lib/utils";
import { PanoramaUploadModal } from "@/components/admin/PanoramaUploadModal";
import { updatePanorama, deletePanorama, replacePanoramaImage} from "@/lib/api/panoramas";
import {
  addPropertyImages,
  deletePropertyImage,
  replacePropertyImage
} from "@/lib/api/admin";

export default function AdminListingDetailsPage() {
  const params = useParams<{ id: string }>();
  const { listing, isLoading, mutate } = useAdminListing(params.id);
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPanoramaModal, setShowPanoramaModal] = useState(false);
  const [editingPanoramaId, setEditingPanoramaId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingSortOrder, setEditingSortOrder] = useState(0);
  const [deleteListingId, setDeleteListingId] = useState<string | null>(null);
  
  async function handleSave(data: FormData) {
    setIsSaving(true);
    try {
      await updateListingWithFormData(params.id, data);
      await mutate();
      setEditing(false);
      showToast("Listing updated successfully!", "success");
    } catch (err) {
      let message = "Failed to update listing.";
      if (isAxiosError(err)) {
        const serverMsg = err.response?.data?.message;
        if (typeof serverMsg === "string" && serverMsg.trim()) {
          message = serverMsg;
        }
      }
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminShell>
      {isLoading ? <div className="h-[620px] animate-pulse rounded-3xl bg-white shadow-soft" /> : null}
      {!isLoading && !listing ? <EmptyState title="Listing not found" message="This submission may have been deleted." /> : null}
      {listing ? (
        editing ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-muted">Editing listing</p>
                <h1 className="mt-1 text-2xl font-black text-ink">{listing.title}</h1>
              </div>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                <X className="h-4 w-4" aria-hidden /> Cancel
              </Button>
            </div>
            <AdminPropertyForm
              // ✅ FIXED: Passed all necessary properties so the form binds correctly
              initialData={{
                id: listing.id,
                title: listing.title,
                description: listing.description || "",
                price: listing.price,
                location: listing.location,
                exactAddress: (listing as any).exactAddress || listing.location || "",
                roomType: listing.roomType,
                preference: listing.preference,
                facilities: listing.facilities,
                images: listing.images.map((img) => img.url),
                status: (listing.status as unknown) as OwnerListingStatus,
                createdAt: listing.submittedAt || new Date().toISOString(),
                priceSingle: (listing as any).priceSingle,
                bedsSingle: (listing as any).bedsSingle,
                priceDouble: (listing as any).priceDouble,
                bedsDouble: (listing as any).bedsDouble,
                priceTriple: (listing as any).priceTriple,
                bedsTriple: (listing as any).bedsTriple,
                lat: (listing as any).lat,
                lng: (listing as any).lng,
                mealPlan: (listing as any).mealPlan,
                mealTimes: (listing as any).mealTimes,
                curfewTime: (listing as any).curfewTime,
                noticePeriod: (listing as any).noticePeriod,
                rulesStrictness: (listing as any).rulesStrictness,
                securityDepositMonths: (listing as any).securityDepositMonths,
                managerContact: (listing as any).managerContact,
                securityContact: (listing as any).securityContact,
              } as any}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-black/5">
              <div className="mb-4">              
                <label className="mb-2 block text-sm font-bold">
                  Upload Property Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={async (e) => {
                    const files = Array.from(
                      e.target.files || []
                    );
                  
                    if (!files.length) return;
                  
                    try {
                      await addPropertyImages(
                        listing.id,
                        files
                      );
                    
                      await mutate();
                    
                      alert("Images added");
                    } catch {
                      alert("Upload failed");
                    }
                  }}
                />
              </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {listing.images.map((image) => (
                <div
                  key={image.id}
                  className="relative overflow-hidden rounded-2xl"
                >
                  <div className="relative h-56">
                    <Image
                      src={image.url.replace(
                        "/upload/",
                        "/upload/f_auto,q_auto,w_800/"
                      )}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                              
                  <div className="flex flex-col gap-2 p-2">
                    <label>Replace Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          await replacePropertyImage(
                            listing.id,
                            image.id,
                            file
                          );
                          await mutate();
                          alert("Image replaced");
                        } catch {
                          alert("Replace failed");
                        }
                      }}
                    />

                    <Button
                      variant="ghost"
                      className="text-red-600"
                      onClick={async () => {
                        if (!confirm("Delete this image?")) return;
                        try {
                          await deletePropertyImage(listing.id, image.id);
                          await mutate();
                          showToast("Image deleted successfully", "success");
                        } catch (err) {
                          let message = "Failed to delete image.";
                        
                          if (isAxiosError(err)) {
                            const serverMsg = err.response?.data?.message;
                            if (typeof serverMsg === "string" && serverMsg.trim()) {
                              message = serverMsg;
                            }
                          }
                          showToast(message, "error");
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
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
              <div className="mt-8 border-t pt-6">
                <h2 className="text-xl font-black text-ink">
                  🌐 360° Virtual Tours
                </h2>

                <p className="mt-2 text-sm text-muted">
                  Upload Insta360 panoramas for this property.
                </p>

                <Button
                  className="mt-4"
                  onClick={() => setShowPanoramaModal(true)}
                >
                  Add Panorama
                </Button>
                <div className="mt-4 space-y-3">
  {listing.panoramas?.map((panorama) => (
    <div
      key={panorama.id}
      className="flex items-center justify-between rounded-2xl border p-3"
    >
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-32 overflow-hidden rounded-lg">
          <Image
            src={panorama.imageUrl}
            alt={panorama.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {editingPanoramaId === panorama.id ? (
          <div className="space-y-2">
            <input
              value={editingTitle}
              placeholder="Panorama title"
              onChange={(e) =>
                setEditingTitle(e.target.value)
              }
              className="w-full rounded border p-2"
            />

            <input
              type="number"
              placeholder="Sort order"
              value={editingSortOrder}
              onChange={(e) =>
                setEditingSortOrder(
                  Number(e.target.value)
                )
              }
              className="w-full rounded border p-2"
            />
            <input
            placeholder= "Edit panaroma"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="w-full rounded border p-2"
            onChange={async (e) => {
              const file = e.target.files?.[0];
            
              if (!file) return;
            
              try {
                await replacePanoramaImage(
                  panorama.id,
                  file
                );
              
                alert(
                  "Panorama image updated successfully"
                );
              
                await mutate();
              } catch (error) {
                console.error(error);
              
                alert(
                  "Failed to replace panorama image"
                );
              }
            }}
          />
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  await updatePanorama(
                    panorama.id,
                    {
                      title: editingTitle,
                      sortOrder:
                        editingSortOrder,
                    }
                  );

                  setEditingPanoramaId(
                    null
                  );

                  await mutate();
                }}
              >
                Save
              </Button>

              <Button
                variant="ghost"
                onClick={() =>
                  setEditingPanoramaId(
                    null
                  )
                }
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-bold">
              {panorama.title}
            </p>

            <p className="text-sm text-muted">
              Sort Order:
              {panorama.sortOrder}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            setEditingPanoramaId(
              panorama.id
            );

            setEditingTitle(
              panorama.title
            );

            setEditingSortOrder(
              panorama.sortOrder
            );
          }}
        >
          Edit
        </Button>

        <Button
          variant="ghost"
          className="text-red-600"
          onClick={async () => {
            if (
              !confirm(
                "Delete this panorama?"
              )
            ) {
              return;
            }

            await deletePanorama(
              panorama.id
            );

            await mutate();
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  ))}
</div>
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
                <Button onClick={() => setEditing(true)} variant="secondary">
                  <Pencil className="h-4 w-4" aria-hidden /> Edit listing
                </Button>
                <Button onClick={() => void approveListing(listing.id)} variant="secondary">
                  <Check className="h-4 w-4" aria-hidden />Approve listing
                </Button>
                <Button variant="secondary" onClick={() => void rejectListing(listing.id)}>
                  <X className="h-4 w-4" aria-hidden />Reject listing
                </Button>
                <Button variant="ghost" className="text-red-700" onClick={() => { setDeleteListingId(listing.id); }}>
                  <Trash2 className="h-4 w-4" aria-hidden />Delete fake listing
                </Button>
              </div>
            </aside>
          </div>
        )
      ) : null}
      {showPanoramaModal && listing && (
        <PanoramaUploadModal
          propertyId={listing.id}
          onClose={() => setShowPanoramaModal(false)}
          onSuccess={async () => {
            await mutate();
          }}
        />
      )}
    </AdminShell>
  );
}
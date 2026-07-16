"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { uploadPanorama } from "@/lib/api/panoramas";

type Props = {
  propertyId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function PanoramaUploadModal({
  propertyId,
  onClose,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault();

  if (!image) {
    alert("Please select a panorama image");
    return;
  }

  try {
    setIsUploading(true);

    console.log("Uploading panorama...");
    console.log("Property ID:", propertyId);
    console.log("Title:", title);
    console.log("Sort Order:", sortOrder);
    console.log("File:", image);

    const result = await uploadPanorama(propertyId, {
      title,
      image,
      sortOrder,
    });

    console.log("UPLOAD SUCCESS:", result);

    alert("Panorama uploaded successfully");

    onSuccess();
    onClose();
  } catch (error) {
    console.error("UPLOAD FAILED:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Failed to upload panorama"
    );
  } finally {
    setIsUploading(false);
  }
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-ink">
            Upload 360° Panorama
          </h2>

          <button
            onClick={onClose}
            className="text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-bold">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Single Room"
              className="w-full rounded-xl border p-3"
              required
            />
          </div>

          <div>
            <label
              htmlFor="sortOrder"
              className="mb-1 block text-sm font-bold"
            >
              Sort Order
            </label>

            <input
              id="sortOrder"
              type="number"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(Number(e.target.value))
              }
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label
            htmlFor="panoramaImage"
              className="mb-1 block text-sm font-bold"
            >
              Panorama Image
            </label>
            
            <input
            id="panoramaImage"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) =>
                setImage(e.target.files?.[0] ?? null)
            }
              className="w-full rounded-xl border p-3"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading}
            >
              {isUploading
                ? "Uploading..."
                : "Upload Panorama"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
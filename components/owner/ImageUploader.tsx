"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/Button";
type ImageUploaderProps = {
  images: string[];
  onChange: (images: string[]) => void;
  onFilesChange?: (files: File[]) => void;
};

export function ImageUploader({ images, onChange, onFilesChange }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleUpload(nextFiles: FileList | null) {
    if (!nextFiles?.length) return;

    setIsUploading(true);
    setError(null);

    try {
      const accepted = Array.from(nextFiles);
      const invalid = accepted.find((file) => !["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif", "image/bmp", "image/heif", "image/heic"].includes(file.type));
      if (invalid) {
        setError("Only JPEG, PNG, WebP, JPG, GIF, BMP, HEIF, and HEIC images are allowed.");
        return;
      }

      const mergedFiles = [...files, ...accepted];
      setFiles(mergedFiles);
      onFilesChange?.(mergedFiles);
      onChange([...images, ...accepted.map((file) => URL.createObjectURL(file))]);
    } catch {
      setError("Image preview failed. Please try another image.");
    } finally {
      setIsUploading(false);
    }
  }

  function removeImage(image: string) {
    const index = images.indexOf(image);
    const nextImages = images.filter((current) => current !== image);
    const nextFiles = index >= 0 ? files.filter((_, fileIndex) => fileIndex !== index) : files;
    setFiles(nextFiles);
    onFilesChange?.(nextFiles);
    onChange(nextImages);
  }

  return (
    <div className="space-y-4">
      <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-black/15 bg-linen p-6 text-center transition hover:bg-oat">
        <ImagePlus className="h-8 w-8 text-clay" aria-hidden />
        <span className="mt-3 text-sm font-bold text-ink">{isUploading ? "Uploading..." : "Upload property images"}</span>
        <span className="mt-1 text-xs text-muted">Select multiple photos for gallery preview</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={isUploading}
          onChange={(event) => handleUpload(event.target.files)}
        />
      </label>
      {error ? <p className="rounded-2xl bg-white p-3 text-sm font-semibold text-clay shadow-soft">{error}</p> : null}
      {images.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <div key={image} className="relative aspect-square overflow-hidden rounded-2xl bg-oat">
              <Image src={image} alt="Uploaded property" fill className="object-cover" sizes="160px" unoptimized />
              <Button
                type="button"
                onClick={() => removeImage(image)}
                className="absolute right-2 top-2 rounded-full bg-white p-2 text-ink shadow-soft"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

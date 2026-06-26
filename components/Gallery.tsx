"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryImage = {
  url: string;
  roomCategory?: string;
};

type GalleryProps = {
  images: GalleryImage[];
  title: string;
};

export function Gallery({
  images,
  title,
}: GalleryProps) {
  const [showAll, setShowAll] = useState(false);

  if (images.length === 0) return null;

  const visibleImages = images.slice(0, 5);

  return (
    <>
      <section className="relative">
        <div className="grid gap-2 md:grid-cols-[2fr_1fr] overflow-hidden rounded-3xl">
          <div className="relative min-h-[420px]">
            <Image
              src={images[0].url}
              alt={title}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {visibleImages.slice(1, 5).map((image) => (
              <div
                key={image.url}
                className="relative min-h-[205px]"
              >
                <Image
                  src={image.url}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {images.length > 5 && (
          <button
            onClick={() => setShowAll(true)}
            className="absolute bottom-4 right-4 rounded-xl bg-white px-4 py-2 text-sm font-bold shadow-lg"
          >
            View all {images.length} photos
          </button>
        )}
      </section>

      {showAll && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex justify-between">
              <h2 className="text-2xl font-black text-white">
                {title}
              </h2>

              <button
                onClick={() => setShowAll(false)}
                className="rounded-xl bg-white px-4 py-2 font-bold"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {images.map((image, index) => (
                <div
                  key={image.url}
                  className="relative h-[400px] overflow-hidden rounded-2xl"
                >
                  <Image
                    src={image.url}
                    alt={`${title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
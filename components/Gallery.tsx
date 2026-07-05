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
          
          {/* Main Hero Image - Largest LCP Element */}
          <div className="relative min-h-[420px]">
            <Image
              src={images[0].url}
              alt={title}
              fill
              priority // Forces instant loading for the hero image
              // THE FIX: Tells Next.js exactly what size to generate
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px" 
              className="object-cover"
            />
          </div>

          {/* 4 Grid Images (Sidebar) */}
          <div className="grid grid-cols-2 gap-2">
            {visibleImages.slice(1, 5).map((image, index) => (
              <div
                key={image.url}
                className="relative min-h-[205px]"
              >
                <Image
                  src={image.url}
                  alt={`${title} view ${index + 2}`}
                  fill
                  // Give priority to the first 2 small images as they are likely above the fold on desktop
                  priority={index < 2} 
                  // THE FIX: Tells Next.js these are small grid images, don't download 4K!
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 16vw, 250px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {images.length > 5 && (
          <button
            onClick={() => setShowAll(true)}
            className="absolute bottom-4 right-4 rounded-xl bg-white px-4 py-2 text-sm font-bold shadow-lg transition-transform hover:scale-105"
          >
            View all {images.length} photos
          </button>
        )}
      </section>

      {/* Lightbox / Modal */}
      {showAll && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 p-6">
          <div className="mx-auto max-w-7xl">
            
            {/* Added sticky header so the close button doesn't scroll away */}
            <div className="mb-6 flex justify-between items-center sticky top-0 z-10 bg-black/95 py-4">
              <h2 className="text-2xl font-black text-white truncate pr-4">
                {title}
              </h2>

              <button
                onClick={() => setShowAll(false)}
                className="rounded-xl bg-white px-6 py-2 font-bold text-black transition-transform hover:scale-105"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {images.map((image, index) => (
                <div
                  key={image.url}
                  className="relative h-[400px] md:h-[600px] overflow-hidden rounded-2xl"
                >
                  <Image
                    src={image.url}
                    alt={`${title} ${index + 1}`}
                    fill
                    loading="lazy" // Strictly forces the browser NOT to download these until the modal opens
                    // THE FIX: Sizes for the expanded modal view
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
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
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
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) return null;

  const visibleImages = images.slice(0, 5);

  return (
    <>
      <section className="relative">
        <div className="grid gap-2 md:grid-cols-[2fr_1fr] overflow-hidden rounded-3xl">
          
          {/* Main Hero Image - Largest LCP Element */}
          <div
            className="relative min-h-[420px] cursor-pointer"
            onClick={() => {
              setSelectedIndex(0);
              setShowAll(true);
            }}
          >
            <Image
              src={images[0].url}
              alt={title}
              fill
              priority // Forces instant loading for the hero image
              // THE FIX: Tells Next.js exactly what size to generate
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
              className="object-cover"
              unoptimized
            />
          </div>

          {/* 4 Grid Images (Sidebar) */}
          <div className="grid grid-cols-2 gap-2">
            {visibleImages.slice(1, 5).map((image, index) => (
              <div
                key={image.url}
                className="relative min-h-[205px] cursor-pointer"
                onClick={() => {
                  setSelectedIndex(index + 1);
                  setShowAll(true);
                }}
              >
                <Image
                  src={image.url}
                  alt={`${title} view ${index + 2}`}
                  fill
                  // Give priority to the first 2 small images as they are likely above the fold on desktop
                  priority={index < 2} 
                  // THE FIX: Tells Next.js these are small grid images, don't download 4K!
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 16vw, 250px"
                  className="object-cover" unoptimized
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

            <div className="flex justify-center">
              <button
                onClick={() =>
                  setSelectedIndex((selectedIndex - 1 + images.length) % images.length)
                }
                className="absolute left-6 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-4 shadow-xl hover:scale-110"
              >
                ←
              </button>
              
              <button
                onClick={() =>
                  setSelectedIndex((selectedIndex + 1) % images.length)
                }
                className="absolute right-6 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-4 shadow-xl hover:scale-110"
              >
                →
              </button>
              <div className="relative h-[75vh] w-full max-w-6xl overflow-hidden rounded-3xl">
                <Image
                  src={images[selectedIndex].url}
                  alt={`${title} ${selectedIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  unoptimized
                />
              </div>
              <div className="mt-6 text-center text-white font-bold">
                {selectedIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
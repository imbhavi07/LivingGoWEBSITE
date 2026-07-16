"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, X } from "lucide-react";
import { Button } from "@/components/Button";

type PickedLocation = {
  lat: number;
  lng: number;
  address: string;
};

type MapPickerProps = {
  onConfirm: (location: PickedLocation) => void;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  mode?: "default" | "preview";
};

export function MapPicker({ onConfirm, onClose, initialLat, initialLng, mode = "default" }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState<string>("Loading address...");
  const [pickedLat, setPickedLat] = useState<number>(initialLat ?? 28.6139);
  const [pickedLng, setPickedLng] = useState<number>(initialLng ?? 77.209);
  const [isLoading, setIsLoading] = useState(false);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json() as { display_name?: string };
      return data.display_name ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      // Retry once
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json() as { display_name?: string };
        return data.display_name ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      } catch {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    }
  }

  useEffect(() => {
    if (!mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapInstanceRef.current) return;

      const map = L.map(mapRef.current!).setView([pickedLat, pickedLng], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker([pickedLat, pickedLng], { draggable: true }).addTo(map);

      // Get initial address
      setAddress("Loading address...");
      setIsLoading(true);
      void reverseGeocode(pickedLat, pickedLng).then((addr) => {
        setAddress(addr);
        setIsLoading(false);
      });

      // Only add interaction listeners if not in preview mode
      if (mode !== "preview") {
        // Click on map to move marker
        map.on("click", async (e: { latlng: { lat: number; lng: number } }) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setPickedLat(lat);
          setPickedLng(lng);
          setAddress("Loading address...");
          setIsLoading(true);
          const addr = await reverseGeocode(lat, lng);
          setAddress(addr);
          setIsLoading(false);
        });

        // Drag marker
        marker.on("dragend", async () => {
          const pos = marker.getLatLng();
          setPickedLat(pos.lat);
          setPickedLng(pos.lng);
          setAddress("Loading address...");
          setIsLoading(true);
          const addr = await reverseGeocode(pos.lat, pos.lng);
          setAddress(addr);
          setIsLoading(false);
        });
      }

      mapInstanceRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [pickedLat, pickedLng, mode]);

  function handleConfirm() {
    onConfirm({ lat: pickedLat, lng: pickedLng, address });
  }

  // If in preview mode, we don't render the backdrop and modal; we just return the map container
  if (mode === "preview") {
    return (
      <div>
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <div ref={mapRef} className="h-[300px] w-full rounded-lg border border-gray-200" />
      </div>
    );
  }

  return (
    <div>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-3xl bg-white shadow-lift sm:inset-8 lg:inset-16">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-ink">Pick property location</h2>
            <p className="text-xs text-muted">Click on the map or drag the pin to your PG location</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            title="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-linen text-ink hover:bg-oat"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Map */}
        <div className="relative flex-1">
          {/* Leaflet CSS */}
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          />
          <div ref={mapRef} className="h-full w-full" />
        </div>

        {/* Footer */}
        <div className="border-t border-black/5 p-4">
          <div className="mb-3 flex items-start gap-2 rounded-2xl bg-linen p-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-clay" aria-hidden />
            <p className="text-xs leading-5 text-muted line-clamp-2">{address}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-full border border-black/10 py-3 text-sm font-bold text-ink hover:bg-linen"
            >
              Cancel
            </button>
            <button className="flex-1" onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              Confirm location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
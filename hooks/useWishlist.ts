"use client";

import { useEffect, useState } from "react";
import { mockProperties } from "@/lib/mock-data";
import { addWishlistProperty, getWishlistIds, getWishlistProperties, removeWishlistProperty } from "@/lib/api/wishlist";
import { getProperty } from "@/lib/api/properties";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import type { Property } from "@/types/property";

const WISHLIST_KEY = "LivingGo_wishlist";

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const auth = useAuthContext();
  const { showToast } = useToast();

  useEffect(() => {
    if (auth.user?.role === "student") {
      getWishlistProperties()
        .then((nextProperties) => {
          setProperties(nextProperties);
          setIds(getWishlistIds(nextProperties));
        })
        .catch(() => showToast("Could not load wishlist.", "error"));
      return;
    }

    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      if (saved) setIds(JSON.parse(saved) as string[]);
    } catch {
      localStorage.removeItem(WISHLIST_KEY);
    }
  }, [auth.user?.role, showToast]);

  function persist(nextIds: string[]) {
    setIds(nextIds);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(nextIds));
  }

  async function toggle(id: string) {
    if (auth.user?.role === "student") {
      try {
        const alreadySaved = ids.includes(id);
        if (alreadySaved) {
          await removeWishlistProperty(id);
          setIds((current) => current.filter((savedId) => savedId !== id));
          setProperties((current) => current.filter((property) => property.id !== id));
          showToast("Removed from wishlist.", "info");
        } else {
          await addWishlistProperty(id);
          const property = await getProperty(id);
          setIds((current) => [...current, id]);
          if (property) setProperties((current) => [...current, property]);
          showToast("Saved to wishlist.", "success");
        }
      } catch {
        showToast("Wishlist update failed.", "error");
      }
      return;
    }

    persist(ids.includes(id) ? ids.filter((savedId) => savedId !== id) : [...ids, id]);
    showToast("Wishlist saved locally. Sign in as student to sync.", "info");
  }

  function isSaved(id: string) {
    return ids.includes(id);
  }

  const localProperties: Property[] = mockProperties.filter((property) => ids.includes(property.id));

  return { ids, properties: auth.user?.role === "student" ? properties : localProperties, toggle, isSaved };
}

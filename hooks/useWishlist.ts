"use client";

import { useEffect, useState } from "react";
import { addWishlistProperty, getWishlistIds, getWishlistProperties, removeWishlistProperty } from "@/lib/api/wishlist";
import { getProperty } from "@/lib/api/properties";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useUser } from "@clerk/nextjs";
import type { Property } from "@/types/property";

const WISHLIST_KEY = "LivingGo_wishlist";

export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const auth = useAuthContext();
  const { showToast } = useToast();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    // If Clerk hasn't loaded yet, we don't know the sign-in status.
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      // Not signed in: load from localStorage and return.
      try {
        const saved = localStorage.getItem(WISHLIST_KEY);
        if (saved) setIds(JSON.parse(saved) as string[]);
      } catch {
        localStorage.removeItem(WISHLIST_KEY);
      }
      return;
    }

    // Signed in: now check the role from our AuthContext.
    if (auth.user?.role === "student") {
      getWishlistProperties()
        .then((nextProperties) => {
          setProperties(nextProperties);
          setIds(getWishlistIds(nextProperties));
        })
        .catch(() => showToast("Could not load wishlist.", "error"));
    } else {
      // Signed in but not a student: use localStorage.
      try {
        const saved = localStorage.getItem(WISHLIST_KEY);
        if (saved) setIds(JSON.parse(saved) as string[]);
      } catch {
        localStorage.removeItem(WISHLIST_KEY);
      }
    }
  }, [auth.user?.role, isLoaded, isSignedIn, showToast]);

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

  // For non-logged-in users, properties aren't available locally without the API
  return { ids, properties: auth.user?.role === "student" ? properties : [], toggle, isSaved };
}
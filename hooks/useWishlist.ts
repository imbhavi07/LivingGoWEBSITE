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

  // Helper function to retry API calls with exponential backoff
  const retryApiCall = async <T>(fn: () => Promise<T>, retries: number = 2, delayMs: number = 500): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;
      // Wait for delayMs * (3 - retries) to avoid hammering the server
      await new Promise((resolve) => setTimeout(resolve, delayMs * (3 - retries)));
      return retryApiCall(fn, retries - 1, delayMs);
    }
  };

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

      if (!auth.user) {
       return;
      } 
    // Signed in: now check the role from our AuthContext.
    if (auth.isAuthenticated && auth.user?.role === "student") {
      retryApiCall(getWishlistProperties, 2)
        .then((nextProperties) => {
          setProperties(nextProperties);
          setIds(getWishlistIds(nextProperties));
        })
        .catch((error) => {
            if (error?.response?.status === 401) {
              return;
            }

            console.error("Failed to load wishlist:", error);
            showToast("Could not load wishlist.", "error");
          });
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
          // Try to remove with retries
          await retryApiCall(() => removeWishlistProperty(id), 2);
          setIds((current) => current.filter((savedId) => savedId !== id));
          setProperties((current) => current.filter((property) => property.id !== id));
          showToast("Removed from wishlist.", "info");
        } else {
          // Try to add with retries
          await retryApiCall(() => addWishlistProperty(id), 2);
          const property = await getProperty(id);
          setIds((current) => [...current, id]);
          if (property) setProperties((current) => [...current, property]);
          showToast("Saved to wishlist.", "success");
        }
      } catch (error) {
        console.error("Wishlist toggle error:", error);
        showToast("Wishlist update failed. Please try again.", "error");
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
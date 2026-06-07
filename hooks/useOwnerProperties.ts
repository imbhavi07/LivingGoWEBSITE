"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  deleteOwnerProperty,
  getOwnerProperties,
  getOwnerProperty,
  getOwnerStats,
  toggleOwnerPropertyStatus
} from "@/lib/api/owner-properties";
import { useToast } from "@/contexts/ToastContext";
import type { OwnerProperty, OwnerStats } from "@/types/owner";

export function useOwnerDashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    getOwnerStats()
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, [isLoaded, isSignedIn]);

  return { stats, isLoading };
}

export function useOwnerProperties() {
  const { isLoaded, isSignedIn } = useAuth();
  const { showToast } = useToast();
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setIsLoading(true);
    getOwnerProperties()
      .then((data) => {
        setProperties(data);
        setError(null);
      })
      .catch(() => {
        setError("Could not load your properties.");
        showToast("Could not load owner properties.", "error");
      })
      .finally(() => setIsLoading(false));
  }, [showToast]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    refresh();
  }, [isLoaded, isSignedIn, refresh]);

  async function remove(id: string) {
    await deleteOwnerProperty(id);
    setProperties((current) => current.filter((property) => property.id !== id));
    showToast("Property deleted.", "success");
  }

  async function toggleStatus(id: string, isActive: boolean) {
    const updated = await toggleOwnerPropertyStatus(id, isActive);
    setProperties((current) =>
      current.map((property) => (property.id === id ? updated : property))
    );
    showToast(isActive ? "Listing submitted back for review." : "Listing hidden.", "success");
  }

  return { properties, isLoading, error, refresh, remove, toggleStatus };
}

export function useOwnerProperty(id: string) {
  const { isLoaded, isSignedIn } = useAuth();
  const [property, setProperty] = useState<OwnerProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    getOwnerProperty(id)
      .then(setProperty)
      .finally(() => setIsLoading(false));
  }, [id, isLoaded, isSignedIn]);

  return { property, isLoading };
}
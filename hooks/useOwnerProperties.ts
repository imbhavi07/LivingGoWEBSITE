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
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const fetchStats = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const data = await getOwnerStats(token);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [isLoaded, isSignedIn, getToken]);

  return { stats, isLoading };
}

export function useOwnerProperties() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { showToast } = useToast();
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setIsLoading(false);
      return;
    }
    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      setError("No auth token available");
      showToast("Authentication required.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const data = await getOwnerProperties(token);
      setProperties(data);
      setError(null);
    } catch (err) {
      setError("Could not load your properties.");
      showToast("Could not load owner properties.", "error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, getToken, showToast]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    refresh();
  }, [isLoaded, isSignedIn, refresh]);

  async function remove(id: string) {
    if (!isLoaded || !isSignedIn) return;
    const token = await getToken();
    if (!token) {
      showToast("Authentication required.", "error");
      return;
    }
    await deleteOwnerProperty(id, token);
    setProperties((current) => current.filter((property) => property.id !== id));
    showToast("Property deleted.", "success");
  }

  async function toggleStatus(id: string, isActive: boolean) {
    if (!isLoaded || !isSignedIn) return;
    const token = await getToken();
    if (!token) {
      showToast("Authentication required.", "error");
      return;
    }
    const updated = await toggleOwnerPropertyStatus(id, isActive, token);
    setProperties((current) =>
      current.map((property) => (property.id === id ? updated : property))
    );
    showToast(isActive ? "Listing submitted back for review." : "Listing hidden.", "success");
  }

  return { properties, isLoading, error, refresh, remove, toggleStatus };
}

export function useOwnerProperty(id: string) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [property, setProperty] = useState<OwnerProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mutate = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;
    const token = await getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getOwnerProperty(id, token);
      setProperty(data);
    } catch (err) {
      console.error("Failed to fetch property", err);
    } finally {
      setIsLoading(false);
    }
  }, [id, isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    mutate();
  }, [mutate]);

  return { property, isLoading, mutate };
}
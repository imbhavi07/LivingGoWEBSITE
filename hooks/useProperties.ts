"use client";

import { useEffect, useState } from "react";
import { getProperties, getProperty } from "@/lib/api/properties";
import type { Property, PropertyFilters } from "@/types/property";

export function useProperties(filters?: PropertyFilters) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Helper function to retry API calls
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

    retryApiCall(() => getProperties(filters), 2)
      .then((data) => {
        if (isMounted) {
          setProperties(data.properties);
          setError(null);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setError("We could not load listings right now. Please try again.");
          console.error("Failed to load properties:", error);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filters]);

  return { properties, isLoading, error };
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Helper function to retry API calls
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

    retryApiCall(() => getProperty(id), 2)
      .then((data) => {
        if (isMounted) {
          setProperty(data);
          setError(data ? null : "Property not found.");
        }
      })
      .catch((error) => {
        if (isMounted) {
          setError("We could not load this property. Please try again.");
          console.error("Failed to load property:", error);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { property, isLoading, error };
}

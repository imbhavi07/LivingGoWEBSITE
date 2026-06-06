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

    getProperties(filters)
      .then((data) => {
        if (isMounted) {
          setProperties(data);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) setError("We could not load listings right now.");
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

    getProperty(id)
      .then((data) => {
        if (isMounted) {
          setProperty(data);
          setError(data ? null : "Property not found.");
        }
      })
      .catch(() => {
        if (isMounted) setError("We could not load this property.");
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

"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { toVisit, type ApiVisit } from "@/lib/api/types";

export const useAdminVisits = () => {
  const [visits, setVisits] = useState<Array<ReturnType<typeof toVisit>>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setIsLoading(true);
        const { data } = await apiClient.get<ApiVisit[]>("/admin/visits");
        const visitList = data.map(toVisit);
        setVisits(visitList);
      } catch (error) {
        console.error("Failed to fetch visits:", error);
        setVisits([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisits();
  }, []);

  return { visits, isLoading };
};
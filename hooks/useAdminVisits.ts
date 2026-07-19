"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { toVisit, type ApiVisit } from "@/lib/api/types";

type AdminVisitsResponse = {
  success: boolean;
  visits: ApiVisit[];
  total: number;
};

export const useAdminVisits = () => {
  const [visits, setVisits] = useState<Array<ReturnType<typeof toVisit>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setIsLoading(true);

        const { data } =
          await apiClient.get<AdminVisitsResponse>("/admin/visits");

        setVisits(data.visits.map(toVisit));
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
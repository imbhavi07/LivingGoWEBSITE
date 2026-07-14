"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { toAdminCoupon } from "@/lib/api/types";

export const useAdminCoupons = () => {
  const [coupons, setCoupons] = useState<Array<ReturnType<typeof toAdminCoupon>>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setIsLoading(true);
        const { data } = await apiClient.get<any[]>("/admin/coupons");
        const couponList = data.map(toAdminCoupon);
        setCoupons(couponList);
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
        setCoupons([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  return { coupons, isLoading };
};
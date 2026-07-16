"use client";

import { useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { Button } from "@/components/Button";

// Temporary mock data until you build the actual API hooks
const MOCK_COUPONS = [
  {
    id: "1",
    partnerName: "Bhavishya Semwal",
    partnerEmail: "bhavishya@example.com",
    couponCode: "BHAV2026",
    isActive: true,
    currentUsed: 12,
    maxUses: null,
    totalVisits: 45,
    totalConvertedBookings: 12,
  },
];

export default function SuperAdminCouponsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-ink">Super Admin Coupon Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor partner performance and coupon effectiveness
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search partners or coupon codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <ArrowUpRight className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse rounded-3xl bg-white shadow-soft w-full h-4/5" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-900">
              <tr>
                <th className="p-4 font-semibold">Partner</th>
                <th className="p-4 font-semibold">Code</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Visits</th>
                <th className="p-4 font-semibold">Conversions</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_COUPONS.map((coupon) => (
                <tr key={coupon.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-ink">{coupon.partnerName}</td>
                  <td className="p-4 font-mono">{coupon.couponCode}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="p-4">{coupon.totalVisits}</td>
                  <td className="p-4">{coupon.totalConvertedBookings}</td>
                  <td className="p-4">
                    <Button
                      onClick={() => {
                        setSelectedCoupon(coupon);
                        setShowModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal logic remains the same as your code */}
      {showModal && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white rounded-lg px-6 pt-6 pb-4 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-black text-ink">Coupon Details</h2>
              <Button onClick={() => setShowModal(false)} className="text-gray-500">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* Modal Body */}
            <div className="space-y-6">
              <p>Conversion Rate: {((selectedCoupon.totalConvertedBookings / selectedCoupon.totalVisits) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

interface CouponData {
  id: string;
  partnerName: string;
  partnerEmail?: string;
  couponCode: string | null;
  totalVisits: number;
  totalConvertedBookings: number;
}

interface SuperAdminCouponsTableProps {
  coupons: CouponData[];
  isLoading: boolean;
}

export const SuperAdminCouponsTable = ({ coupons, isLoading }: SuperAdminCouponsTableProps) => {
  if (isLoading) {
    return (
      <div className="h-96 animate-pulse rounded-3xl bg-white shadow-soft" />
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-soft">
        <p className="text-gray-500 font-medium">No partner coupons found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-soft">
        <table className="w-full text-sm text-left rtl:text-right border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider">
              <th scope="col" className="px-6 py-4 text-left">
                Partner Name
              </th>
              <th scope="col" className="px-6 py-4 text-left">
                Coupon Code
              </th>
              <th scope="col" className="px-6 py-4 text-center">
                Total Visits
              </th>
              <th scope="col" className="px-6 py-4 text-center">
                Converted Bookings
              </th>
              <th scope="col" className="px-6 py-4 text-center">
                Conversion Rate
              </th>
              <th scope="col" className="px-6 py-4 scope text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-8 w-8">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="h-8 w-8 rounded-full border border-linen object-cover"
                        src="/placeholder-partner.jpg"
                        alt={coupon.partnerName || "Partner"}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{coupon.partnerName}</p>
                      {coupon.partnerEmail && (
                        <p className="text-xs text-muted font-normal">{coupon.partnerEmail}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono">
                  {coupon.couponCode ? (
                    <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                      {coupon.couponCode}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 font-medium">None</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center font-semibold text-ink">
                  {coupon.totalVisits}
                </td>
                <td className="px-6 py-4 text-center font-semibold text-ink">
                  {coupon.totalConvertedBookings}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-sm font-black ${coupon.totalConvertedBookings > 0 ? "text-moss" : "text-gray-500"}`}>
                    {coupon.totalVisits > 0 ? (
                      `${((coupon.totalConvertedBookings / coupon.totalVisits) * 100).toFixed(1)}%`
                    ) : (
                      "0.0%"
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => {
                        console.log("Edit coupon:", coupon.id);
                      }}
                      className="text-sm font-bold text-indigo-600 hover:text-indigo-900 transition-colors"
                    >
                      Edit
                    </button>
                    <div className="h-3 w-[1px] bg-gray-200" />
                    <button
                      onClick={() => {
                        console.log("Deactivate coupon:", coupon.id);
                      }}
                      className="text-sm font-bold text-clay hover:text-red-700 transition-colors"
                    >
                      Deactivate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
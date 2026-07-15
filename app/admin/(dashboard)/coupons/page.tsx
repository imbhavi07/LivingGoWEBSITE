// app/admin/coupons/page.tsx
import { AdminShell } from "@/components/admin/AdminShell";
import CouponManagement from "@/components/admin/CouponsManagement";

export const metadata = {
  title: "Coupon Management | LivingGo Admin",
};

export default function CouponsPage() {
  return (
    <AdminShell>
      <CouponManagement />
    </AdminShell>
  );
}
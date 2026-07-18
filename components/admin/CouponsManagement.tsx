"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/Button";

// Types
interface Coupon {
  id: string;
  code: string;
  type?: "ADMIN" | "PARTNER";
  discountType: "FIXED" | "PERCENTAGE";
  value: number;
  validFrom: string;
  validTo: string;
  targetPlans: string[];
  isActive: boolean;
  maxUses?: number;
  currentUses: number;
  affiliateId?: string;
  createdAt: string;
  updatedAt: string;
  uses?: number;
  successful?: number;
}

interface CouponFormData {
  code: string;
  discountType: "FIXED" | "PERCENTAGE";
  value: string;
  validFrom: string;
  validTo: string;
  targetPlans: string;
  isActive: boolean;
  maxUses: string;
  affiliateId: string;
}

export default function CouponManagement() {
  // State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form states (Fixed duplicate declarations)
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    discountType: "PERCENTAGE",
    value: "",
    validFrom: "",
    validTo: "",
    targetPlans: "",
    isActive: true,
    maxUses: "",
    affiliateId: "",
  });

  // Loading states for operations
  const [creating, setCreating] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [toggling, setToggling] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  // UI states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null);

  // Fetch coupons on mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get("/admin/coupons");
      
      // Defensively dig out the array whether the backend sent:
      // [...] OR { data: [...] } OR { coupons: [...] }
      const couponsArray = Array.isArray(data) ? data : (data?.data || data?.coupons || []);
      
      // Final safety check to guarantee it's an array before setting state
      setCoupons(Array.isArray(couponsArray) ? couponsArray : []);
      
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (err as { message?: string }).message || "Failed to fetch coupons");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code.trim()) return setError("Coupon code is required");
    
    const valueNum = Number(formData.value);
    if (isNaN(valueNum) || valueNum <= 0) return setError("Coupon value must be a positive number");

    const from = new Date(formData.validFrom);
    const to = new Date(formData.validTo);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return setError("Valid dates are required");
    if (from >= to) return setError("Valid from must be before valid to");

    const targetPlansArray = formData.targetPlans
      .split(",")
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const maxUsesNum = formData.maxUses ? Number(formData.maxUses) : undefined;
    if (formData.maxUses && (isNaN(maxUsesNum!) || maxUsesNum! < 0)) {
      return setError("Max uses must be a non-negative integer");
    }

    try {
      if (editingId) {
        setUpdating(true);
      } else {
        setCreating(true);
      }

      const payload = {
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        value: valueNum,
        validFrom: from.toISOString(),
        validTo: to.toISOString(),
        targetPlans: targetPlansArray,
        isActive: formData.isActive,
        maxUses: maxUsesNum,
        affiliateId: formData.affiliateId.trim() || undefined,
      };

      if (editingId) {
        await apiClient.put(`/admin/coupons/${editingId}`, payload);
      } else {
        await apiClient.post("/admin/coupons", payload);
      }

      await fetchCoupons();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        code: "", discountType: "PERCENTAGE", value: "", validFrom: "", validTo: "", targetPlans: "", isActive: true, maxUses: "", affiliateId: ""
      });
      setError(null);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || `Failed to ${editingId ? "update" : "create"} coupon`);
    } finally {
      if (editingId) {
        setUpdating(false);
      } else {
        setCreating(false);
      }
    }
  };

  const handleToggleStatus = async (id: string, newStatus: boolean) => {
    try {
      setToggling(prev => new Set([...prev, id]));
      
      // Send the exact new status from the checkbox
      await apiClient.put(`/admin/coupons/${id}`, {
        isActive: newStatus,
      });

      // Update the local state to match
      setCoupons(prev => prev.map(coupon => 
        coupon.id === id ? { ...coupon, isActive: newStatus } : coupon
      ));
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || "Failed to update status");
    } finally {
      setToggling(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      setDeleting(prev => new Set([...prev, id]));
      await apiClient.delete(`/admin/coupons/${id}`);
      setCoupons(prev => prev.filter(coupon => coupon.id !== id));
      setShowDeleteConfirm(false);
      setDeleteCouponId(null);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || "Failed to delete coupon");
    } finally {
      setDeleting(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setShowForm(true);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value.toString(),
      validFrom: new Date(coupon.validFrom).toISOString().split("T")[0],
      validTo: new Date(coupon.validTo).toISOString().split("T")[0],
      targetPlans: coupon.targetPlans.join(","),
      isActive: coupon.isActive,
      maxUses: coupon.maxUses?.toString() || "",
      affiliateId: coupon.affiliateId || "",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div>
        <p className="mt-2 text-sm text-ink/60">Loading coupons...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-ink">Coupon Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-ink text-linen rounded hover:bg-ink/80 transition-colors"
        >
          Add Coupon
        </button>
      </div>

      {error && (
        <div className="p-4 bg-clay/10 text-clay rounded-lg flex justify-between items-center">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="text-clay hover:text-ink">×</button>
        </div>
      )}

      {coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-ink/10 rounded-2xl">
          <p className="text-sm text-ink/50 mb-4">No coupons found.</p>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-ink text-linen rounded hover:bg-ink/80">
            Create First Coupon
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-sm">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="border-b border-ink/20 bg-linen/50">
                <th className="text-left px-6 py-4 text-xs font-bold text-ink/60 uppercase tracking-wider">Code</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-ink/60 uppercase tracking-wider">Discount</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-ink/60 uppercase tracking-wider">Uses</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-ink/60 uppercase tracking-wider">Successful</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-ink/60 uppercase tracking-wider">Target Plans</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-ink/60 uppercase tracking-wider">Validity</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-ink/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} className="border-b border-ink/10 hover:bg-linen/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-bold">{coupon.code}</td>
                  <td className="px-6 py-4 text-sm">
                    {coupon.discountType
                    ? coupon.discountType === "PERCENTAGE"
                      ? `${coupon.value}% off`
                      : `₹${coupon.value} off`
                    : (
                      <span className="text-ink/40">Referral Code</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-semibold">
                    {coupon.uses ?? 0}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                    {coupon.successful ?? 0}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {coupon.type === "PARTNER" ? (
                      <span className="text-ink/40">Referral Code</span>
                    ) : coupon.targetPlans?.length ? (
                      coupon.targetPlans.join(", ")
                    ) : (
                      <span className="text-ink/40">Coupon Code</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink/80">
                    {coupon.type === "PARTNER" ? (
                      <span className="text-ink/40">No Expiry</span>
                    ) : coupon.validFrom && coupon.validTo ? (
                      <>
                        {new Date(coupon.validFrom).toLocaleDateString()} to{" "}
                        {new Date(coupon.validTo).toLocaleDateString()}
                      </>
                    ) : (
                      <span className="text-ink/40">No Expiry</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => handleEditCoupon(coupon)}
                      disabled={!coupon.discountType || updating || creating}
                      className="px-3 py-1.5 text-xs font-bold bg-ink/5 text-ink rounded hover:bg-ink/10 transition-colors disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteCouponId(coupon.id);
                        setShowDeleteConfirm(true);
                      }}
                      className={`px-3 py-1.5 text-xs font-bold border border-clay/50 text-clay hover:border-clay/200 hover:bg-clay/50 rounded hover:text-ink transition-colors ${deleting.has(coupon.id) ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lift">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-ink">{editingId ? "Edit Coupon" : "Add Coupon"}</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="text-ink/50 hover:text-ink transition-colors p-2 bg-ink/5 rounded-full"
              >
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-ink mb-1.5">Coupon Code</label>
                <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleFormChange}
              required
              disabled={!!editingId}
              className={`w-full px-4 py-2.5 rounded-xl border border-ink/20
              ${
                editingId
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "bg-linen/50 focus:bg-white"
              }
              focus:outline-none focus:ring-2 focus:ring-ink`}
              placeholder="SUMMER20"
            />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">Discount Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="discountType" value="PERCENTAGE" checked={formData.discountType === "PERCENTAGE"} onChange={handleFormChange} className="accent-ink w-4 h-4" />
                      <span className="text-sm font-medium">Percent (%)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="discountType" value="FIXED" checked={formData.discountType === "FIXED"} onChange={handleFormChange} className="accent-ink w-4 h-4" />
                      <span className="text-sm font-medium">Fixed Amount (₹)</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">
                    {formData.discountType === "PERCENTAGE" ? "Percent Off" : "Amount Off (₹)"}
                  </label>
                  <input type="number" name="value" value={formData.value} onChange={handleFormChange} required min={1} className="w-full px-4 py-2.5 rounded-xl border border-ink/20 bg-linen/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink" placeholder={formData.discountType === "PERCENTAGE" ? "15" : "1000"} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">Valid From</label>
                  <input type="date" name="validFrom" value={formData.validFrom} onChange={handleFormChange} required className="w-full px-4 py-2.5 rounded-xl border border-ink/20 bg-linen/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">Valid To</label>
                  <input type="date" name="validTo" value={formData.validTo} onChange={handleFormChange} required className="w-full px-4 py-2.5 rounded-xl border border-ink/20 bg-linen/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-1.5">Target Plans <span className="text-ink/40 font-normal">(Optional)</span></label>
                <input type="text" name="targetPlans" value={formData.targetPlans} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-ink/20 bg-linen/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink" placeholder="plan_1, plan_2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="pt-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleFormChange} className="accent-ink w-5 h-5" />
                    <span className="font-bold text-ink">Coupon is active</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">Max Uses <span className="text-ink/40 font-normal">(Optional)</span></label>
                  <input type="number" name="maxUses" value={formData.maxUses} onChange={handleFormChange} min={0} className="w-full px-4 py-2.5 rounded-xl border border-ink/20 bg-linen/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink" placeholder="Unlimited" />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-ink/10">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 font-bold bg-ink/5 text-ink rounded-xl hover:bg-ink/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={creating || updating} className="px-6 py-2.5 font-bold bg-ink text-linen rounded-xl hover:bg-ink/90 transition-colors disabled:opacity-50">
                  {creating || updating ? "Saving..." : (editingId ? "Update Coupon" : "Create Coupon")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lift text-center">
            <div className="w-16 h-16 bg-clay/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-clay">!</span>
            </div>
            <h2 className="text-2xl font-black text-ink mb-2">Delete Coupon?</h2>
            <p className="mb-8 text-ink/60">Are you sure you want to delete this coupon? This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="px-6 py-2.5 font-bold bg-ink/5 text-ink rounded-xl hover:bg-ink/10 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => deleteCouponId && handleDeleteCoupon(deleteCouponId)} className="px-6 py-2.5 font-bold bg-clay text-linen rounded-xl hover:bg-clay/90 transition-colors">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
# Coupon Management Implementation Plan

## Date
2026-07-02

## Overview
This plan outlines the implementation of the CouponManagement component at `components/admin/CouponsManagement.tsx` based on the approved design.

## Files to Create/Modify
1. `components/admin/CouponsManagement.tsx` - Main component file
2. `docs/superpowers/plans/2026-07-02-coupon-management-plan.md` - This plan

## Implementation Approach
Using Approach 3: Custom Hook + Component
- Custom hook for data logic and API interactions
- Main component for UI rendering and state management
- Inline sub-components for simplicity (CouponTable, CouponForm)

## Implementation Steps

### Step 1: Create the CouponManagement component file with basic structure
- [ ] **Create basic component structure**

```typescript
"use client";

import { useState, useEffect } from "react";

// Types
interface Coupon {
  id: string;
  code: string;
  discountType: "FIXED" | "PERCENTAGE";
  value: number;
  validFrom: Date;
  validTo: Date;
  targetPlans: string[];
  isActive: boolean;
  maxUses?: number;
  currentUses: number;
  affiliateId?: string;
  createdAt: Date;
  updatedAt: Date;
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

// Main Component
export default function CouponManagement() {
  // State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
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
  
  // UI states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null);

  // Effect for fetching coupons
  useEffect(() => {
    fetchCoupons();
  }, []);

  // Fetch coupons from API
  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/coupons", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }
      
      const data = await response.json();
      // Assuming API returns { success: true, data: [...] }
      setCoupons(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form validation and submission logic will go here
  };

  // Handle toggle coupon status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    // Toggle logic will go here
  };

  // Handle delete coupon
  const handleDeleteCoupon = async (id: string) => {
    // Delete logic will go here
  };

  // Render loading state
  if (loading) {
    return <div className="text-center py-10">Loading coupons...</div>;
  }

  // Render error state
  if (error) {
    return <div className="text-center text-red-500 py-10">Error: {error}</div>;
  }

  // Render empty state
  if (coupons.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No coupons found.</p>
        <button 
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          Create First Coupon
        </button>
      </div>
    );
  }

  // Main UI will go here
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Coupon Management</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          Add Coupon
        </button>
      </div>
      
      {/* Coupon Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="border-b">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Code</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Discount</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Target Plans</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Validity</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon.id} className="border-b hover:bg-muted">
                <td className="px-4 py-3 font-mono">{coupon.code}</td>
                <td className="px-4 py-3">
                  {coupon.discountType === "PERCENTAGE" ? 
                    `${coupon.value}% off` : 
                    `₹${coupon.value} off`}
                </td>
                <td className="px-4 py-3">
                  {coupon.targetPlans.length > 0 ? 
                    coupon.targetPlans.join(", ") : 
                    <span className="text-muted-foreground">All plans</span>}
                </td>
                <td className="px-4 py-3">
                  {new Date(coupon.validFrom).toLocaleDateString()} to 
                  {new Date(coupon.validTo).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {/* Toggle switch will go here */}
                </td>
                <td className="px-4 py-3 text-center space-x-2">
                  {/* Action buttons will go here */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Form Modal will go here */}
      
      {/* Delete Confirmation Modal will go here */}
    </div>
  );
}
```

- [ ] **Verify file creation**

### Step 2: Implement form submission logic (create coupon)
- [ ] **Add create coupon functionality**

```typescript
// Inside the component, replace the handleFormSubmit function with:
const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Form validation
  if (!formData.code.trim()) {
    setError("Coupon code is required");
    return;
  }
  
  const valueNum = Number(formData.value);
  if (isNaN(valueNum) || valueNum <= 0) {
    setError("Coupon value must be a positive number");
    return;
  }
  
  const from = new Date(formData.validFrom);
  const to = new Date(formData.validTo);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    setError("Valid from and valid to dates are required");
    return;
  }
  
  if (from >= to) {
    setError("Valid from must be before valid to");
    return;
  }
  
  const targetPlansArray = formData.targetPlans
    .split(",")
    .map(p => p.trim())
    .filter(p => p.length > 0);
    
  const maxUsesNum = formData.maxUses ? Number(formData.maxUses) : undefined;
  if (formData.maxUses && (isNaN(maxUsesNum) || maxUsesNum < 0)) {
    setError("Max uses must be a non-negative integer");
    return;
  }

  try {
    const response = await fetch("/api/admin/coupons", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        value: valueNum,
        validFrom: from.toISOString(),
        validTo: to.toISOString(),
        targetPlans: targetPlansArray,
        isActive: formData.isActive,
        maxUses: maxUsesNum,
        affiliateId: formData.affiliateId.trim() || undefined,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Could not create coupon");
    }
    
    // Success
    await fetchCoupons(); // Refresh coupon list
    setShowForm(false); // Close form
    setFormData({
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
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to create coupon");
  }
};
```

- [ ] **Verify form submission works**

### Step 3: Implement toggle coupon status functionality
- [ ] **Add toggle status functionality**

```typescript
// Inside the component, replace the handleToggleStatus function with:
const handleToggleStatus = async (id: string, currentStatus: boolean) => {
  try {
    const response = await fetch(`/api/admin/coupons/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isActive: !currentStatus,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update coupon status");
    }
    
    // Optimistic update - update the coupon in state immediately
    setCoupons(prev => 
      prev.map(coupon => 
        coupon.id === id 
          ? { ...coupon, isActive: !currentStatus } 
          : coupon
      )
    );
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to update coupon status");
  }
};
```

- [ ] **Verify toggle functionality works**

### Step 4: Implement delete coupon functionality
- [ ] **Add delete coupon functionality**

```typescript
// Inside the component, replace the handleDeleteCoupon function with:
const handleDeleteCoupon = async (id: string) => {
  try {
    const response = await fetch(`/api/admin/coupons/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete coupon");
    }
    
    // Remove coupon from state
    setCoupons(prev => prev.filter(coupon => coupon.id !== id));
    
    // Close confirmation modal
    setShowDeleteConfirm(false);
    setDeleteCouponId(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to delete coupon");
  }
};

// Add handlers for delete confirmation modal
const handleConfirmDelete = () => {
  if (deleteCouponId) {
    handleDeleteCoupon(deleteCouponId);
  }
};

const handleCancelDelete = () => {
  setShowDeleteConfirm(false);
  setDeleteCouponId(null);
};
```

- [ ] **Verify delete functionality works**

### Step 5: Implement edit coupon functionality
- [ ] **Add edit coupon functionality**

```typescript
// Add function to handle editing a coupon
const handleEditCoupon = (coupon: Coupon) => {
  setEditingId(coupon.id);
  setShowForm(true);
  setFormData({
    code: coupon.code,
    discountType: coupon.discountType,
    value: coupon.value.toString(),
    validFrom: coupon.validTo.toISOString().split("T")[0], // Format for date input
    validTo: coupon.validTo.toISOString().split("T")[0],
    targetPlans: coupon.targetPlans.join(","),
    isActive: coupon.isActive,
    maxUses: coupon.maxUses?.toString() || "",
    affiliateId: coupon.affiliateId || "",
  });
};

// Update form submission to handle both create and edit
const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Form validation (same as before)
  if (!formData.code.trim()) {
    setError("Coupon code is required");
    return;
  }
  
  const valueNum = Number(formData.value);
  if (isNaN(valueNum) || valueNum <= 0) {
    setError("Coupon value must be a positive number");
    return;
  }
  
  const from = new Date(formData.validFrom);
  const to = new Date(formData.validTo);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    setError("Valid from and valid to dates are required");
    return;
  }
  
  if (from >= to) {
    setError("Valid from must be before valid to");
    return;
  }
  
  const targetPlansArray = formData.targetPlans
    .split(",")
    .map(p => p.trim())
    .filter(p => p.length > 0);
    
  const maxUsesNum = formData.maxUses ? Number(formData.maxUses) : undefined;
  if (formData.maxUses && (isNaN(maxUsesNum) || maxUsesNum < 0)) {
    setError("Max uses must be a non-negative integer");
    return;
  }

  try {
    const method = editingId ? "PUT" : "POST";
    const endpoint = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
    
    const response = await fetch(endpoint, {
      method: method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        value: valueNum,
        validFrom: from.toISOString(),
        validTo: to.toISOString(),
        targetPlans: targetPlansArray,
        isActive: formData.isActive,
        maxUses: maxUsesNum,
        affiliateId: formData.affiliateId.trim() || undefined,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Could not ${editingId ? "update" : "create"} coupon`);
    }
    
    // Success
    await fetchCoupons(); // Refresh coupon list
    setShowForm(false); // Close form
    if (editingId) {
      setEditingId(null);
    }
    setFormData({
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
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : `Failed to ${editingId ? "update" : "create"} coupon`);
  }
};
```

- [ ] **Verify edit functionality works**

### Step 6: Complete the UI with interactive elements
- [ ] **Add toggle switch and action buttons to table rows**

```typescript
// Replace the empty td for status with:
// In the table body, replace the status td with:
<td className="px-4 py-3">
  <div className="flex items-center space-x-2">
    <span className="text-xs font-medium">{coupon.isActive ? "Active" : "Inactive"}</span>
    <label className="relative inline-flex h-6 w-11">
      <input
        type="checkbox"
        checked={coupon.isActive}
        onChange={(e) => handleToggleStatus(coupon.id, e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-dark">
        <div className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform 
          {coupon.isActive ? 'translate-x-6' : 'translate-x-0'}"></div>
      </div>
    </label>
  </div>
</td>

// Replace the empty td for actions with:
// In the table body, replace the actions td with:
<td className="px-4 py-3 text-center space-x-2">
  {/* Edit button */}
  <button
    onClick={() => handleEditCoupon(coupon)}
    className="btn-secondary hover:btn-secondary-hover"
  >
    Edit
  </button>
  
  {/* Delete button */}
  <button
    onClick={() => {
      setDeleteCouponId(coupon.id);
      setShowDeleteConfirm(true);
    }}
    className="btn-danger hover:btn-danger-hover"
  >
    Delete
  </button>
</td>
```

- [ ] **Add form modal/just-in-time UI**

```typescript
// Add form modal JSX after the main div but before the closing tag:
{showForm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold">{editingId ? "Edit Coupon" : "Add Coupon"}</h2>
        <button
          onClick={() => {
            setShowForm(false);
            if (editingId) setEditingId(null);
            setFormData({
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
            setError(null);
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Coupon Code</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleFormChange}
            required
            className="input w-full"
            placeholder="MOVEIN200"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Discount Type</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="discountType"
                  value="PERCENTAGE"
                  checked={formData.discountType === "PERCENTAGE"}
                  onChange={handleFormChange}
                  className="radio"
                />
                <span>Percent (%)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="discountType"
                  value="FIXED"
                  checked={formData.discountType === "FIXED"}
                  onChange={handleFormChange}
                  className="radio"
                />
                <span>Fixed Amount (₹)</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {formData.discountType === "PERCENTAGE" ? "Percent Off" : "Amount Off (₹)"}
            </label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleFormChange}
              required
              min={1}
              className="input w-full"
              placeholder={formData.discountType === "PERCENTAGE" ? "20" : "500"}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Valid From</label>
            <input
              type="date"
              name="validFrom"
              value={formData.validFrom}
              onChange={handleFormChange}
              required
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valid To</label>
            <input
              type="date"
              name="validTo"
              value={formData.validTo}
              onChange={handleFormChange}
              required
              className="input w-full"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Target Plans (comma-separated plan IDs, optional)</label>
          <input
            type="text"
            name="targetPlans"
            value={formData.targetPlans}
            onChange={handleFormChange}
            className="input w-full"
            placeholder="plan_1,plan_2"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Active</label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleFormChange}
                className="checkbox"
              />
              <span>Coupon is active</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Uses (optional, null for unlimited)</label>
            <input
              type="number"
              name="maxUses"
              value={formData.maxUses}
              onChange={handleFormChange}
              min={0}
              className="input w-full"
              placeholder="Leave empty for unlimited"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Affiliate ID (optional)</label>
          <input
            type="text"
            name="affiliateId"
            value={formData.affiliateId}
            onChange={handleFormChange}
            className="input w-full"
            placeholder="Affiliate identifier"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              if (editingId) setEditingId(null);
              setFormData({
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
              setError(null);
            }}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            {editingId ? "Update Coupon" : "Create Coupon"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

// Add delete confirmation modal
{showDeleteConfirm && deleteCouponId && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
      <p className="mb-6">Are you sure you want to delete this coupon? This action cannot be undone.</p>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleCancelDelete}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirmDelete}
          className="btn-danger"
        >
          Delete Coupon
        </button>
      </div>
    </div>
  </div>
)}
```

- [ ] **Verify UI renders correctly and all interactions work**

### Step 7: Add loading states for asynchronous operations
- [ ] **Add loading states for form submission, toggle, and delete**

```typescript
// Add loading states to the component state:
const [creating, setCreating] = useState<boolean>(false);
const [updating, setUpdating] = useState<boolean>(false);
const [toggling, setToggling] = useState<Set<string>>(new Set());
const [deleting, setDeleting] = useState<Set<string>>(new Set());

// Update form submission to set creating/updating state:
const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ... validation code ...
  
  try {
    // Set loading state
    if (editingId) {
      setUpdating(true);
    } else {
      setCreating(true);
    }
    
    // ... API call ...
    
  } catch (err) {
    // ... error handling ...
  } finally {
    // Reset loading states
    if (editingId) {
      setUpdating(false);
    } else {
      setCreating(false);
    }
  }
};

// Update toggle status to set toggling state:
const handleToggleStatus = async (id: string, currentStatus: boolean) => {
  try {
    setToggling(prev => new Set([...prev, id]));
    
    // ... API call ...
    
  } catch (err) {
    // ... error handling ...
  } finally {
    setToggling(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }
};

// Update delete coupon to set deleting state:
const handleDeleteCoupon = async (id: string) => {
  try {
    setDeleting(prev => new Set([...prev, id]));
    
    // ... API call ...
    
  } catch (err) {
    // ... error handling ...
  } finally {
    setDeleting(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }
};

// Update UI to show loading states:
// In form submit button:
<button
  type="submit"
  className="btn-primary"
  disabled={creating || updating}
>
  {creating || updating ? "Saving..." : (editingId ? "Update Coupon" : "Create Coupon")}
</button>

// In toggle switch:
<input
  type="checkbox"
  checked={coupon.isActive}
  onChange={(e) => handleToggleStatus(coupon.id, e.target.checked)}
  className="sr-only peer"
  disabled={toggling.has(coupon.id)}
/>

// In delete button:
<button
  onClick={() => {
    setDeleteCouponId(coupon.id);
    setShowDeleteConfirm(true);
  }}
  className={`btn-danger hover:btn-danger-hover ${deleting.has(coupon.id) ? "opacity-50 pointer-events-none" : ""}`}
>
  Delete
</button>
```

- [ ] **Verify loading states work correctly**

### Step 8: Refine styling and add missing CSS classes
- [ ] **Add missing CSS class definitions or use existing ones**

```typescript
// Since we're using custom button classes, let's either:
// 1. Use existing button classes from the codebase, or
// 2. Define inline styles, or
// 3. Add the CSS classes globally

// For now, let's use standard Tailwind classes that should exist:
<button
  onClick={() => setShowForm(true)}
  className="px-4 py-2 bg-ink text-linen rounded hover:bg-ink/80 transition-colors"
>
  Add Coupon
</button>

// And similar for other buttons
```

- [ ] **Verify styling looks consistent with rest of application**

### Step 9: Final testing and cleanup
- [ ] **Test all functionality:**
  - Coupon list loads correctly
  - Create coupon works
  - Edit coupon works
  - Toggle status works
  - Delete coupon works
  - Loading states show correctly
  - Error handling works
  - Form validation works
  - Modals open/close correctly
  - Responsive design works

- [ ] **Clean up any temporary code or comments**

- [ ] **Verify file is saved correctly**

## API Endpoints Used
- GET `/api/admin/coupons` - Fetch all coupons
- POST `/api/admin/coupons` - Create new coupon
- PUT `/api/admin/coupons/:id` - Update coupon
- DELETE `/api/admin/coupons/:id` - Delete coupon

## Dependencies
- React hooks (useState, useEffect)
- Fetch API for HTTP requests
- Tailwind CSS for styling (assuming it's configured)

## Files Modified
- `components/admin/CouponsManagement.tsx` - New file created

## Testing Notes
This implementation assumes the backend API endpoints are already implemented and working as specified in the coupon.controller.ts and coupon.service.ts files.

## Deployment Instructions
1. Create the file `components/admin/CouponsManagement.tsx` with the code from this plan
2. Import and use the component in the appropriate admin page (e.g., app/admin/coupons/page.tsx or a new route)
3. Ensure the backend is running and accessible
4. Test the functionality in the browser
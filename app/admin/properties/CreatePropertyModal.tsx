"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
// Make sure this Button import path is correct for your project
import { Button } from "@/components/Button"; 

interface CreatePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: FormData) => Promise<void>;
}

export function CreatePropertyModal({
  isOpen,
  onClose,
  onCreate
}: CreatePropertyModalProps) {
  const [formData] = useState(new FormData());
  const [loading, setLoading] = useState(false);
  const [formFields, setFormFields] = useState({
    title: "",
    description: "",
    price: "",
    priceSingle: "",
    bedsSingle: "",
    priceDouble: "",
    bedsDouble: "",
    priceTriple: "",
    bedsTriple: "",
    securityDepositMonths: "",
    location: "",
    lat: "",
    lng: "",
    roomType: "Single" as "Single" | "Shared",
    sharedType: "",
    preference: "Any" as "Boys" | "Girls" | "Any",
    mealPlan: "",
    mealTimes: "",
    curfewTime: "",
    noticePeriod: "",
    rulesStrictness: "",
    facilities: "",
    managerContact: "",
    securityContact: "",
    manualOwnerName: ""
  });

  const handleInputChange = (name: string, value: string) => {
    setFormFields(prev => ({
      ...prev,
      [name]: value
    }));

    if (value !== "") {
      formData.append(name, value);
    } else {
      formData.delete(name);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormFields(prev => ({
      ...prev,
      [name]: value
    }));

    if (value !== "") {
      formData.append(name, value);
    } else {
      formData.delete(name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.title.trim() || !formFields.location.trim()) {
      alert("Please fill in required fields: Title and Location");
      return;
    }

    setLoading(true);
    try {
      Object.keys(formFields).forEach(key => {
        const value = formFields[key as keyof typeof formFields];
        if (value !== "") {
          formData.append(key, value);
        }
      });

      await onCreate(formData);
    } catch (error) {
      console.error("Error creating property:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-black text-ink">
            Create New Property
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            
            <div>
              <label className="text-sm font-medium text-muted mb-2">Property Title*</label>
              <input
                type="text"
                value={formFields.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter property name"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted mb-2">Description*</label>
              <textarea
                value={formFields.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                placeholder="Describe the property, amenities, etc."
                className="textarea textarea-bordered w-full"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted mb-2">Location*</label>
                <input
                  type="text"
                  value={formFields.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Area, city, landmark"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted mb-2">Owner Name (for manual listing)*</label>
                <input
                  type="text"
                  value={formFields.manualOwnerName}
                  onChange={(e) => handleInputChange("manualOwnerName", e.target.value)}
                  placeholder="Enter owner name for this listing"
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted mb-2">Monthly Rent (₹)*</label>
                <input
                  type="number"
                  value={formFields.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  min="0"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted mb-2">Property Type*</label>
                <select
                  value={formFields.roomType}
                  onChange={(e) => handleSelectChange("roomType", e.target.value as "Single" | "Shared")}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="Single">Single Room</option>
                  <option value="Shared">Shared Room</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted mb-2">Preferred Tenant*</label>
                <select
                  value={formFields.preference}
                  onChange={(e) => handleSelectChange("preference", e.target.value as "Boys" | "Girls" | "Any")}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="Boys">Boys Only</option>
                  <option value="Girls">Girls Only</option>
                  <option value="Any">Any Gender</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted mb-2">Available Beds*</label>
                <input
                  type="number"
                  value={formFields.bedsSingle}
                  onChange={(e) => handleInputChange("bedsSingle", e.target.value)}
                  min="0"
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted mb-2">Beds for Double Sharing</label>
                <input
                  type="number"
                  value={formFields.bedsDouble}
                  onChange={(e) => handleInputChange("bedsDouble", e.target.value)}
                  min="0"
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted mb-2">Beds for Triple Sharing</label>
                <input
                  type="number"
                  value={formFields.bedsTriple}
                  onChange={(e) => handleInputChange("bedsTriple", e.target.value)}
                  min="0"
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-ink mb-3">Contact Information (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted mb-2">Manager Contact</label>
                  <input
                    type="tel"
                    value={formFields.managerContact}
                    onChange={(e) => handleInputChange("managerContact", e.target.value)}
                    placeholder="Phone number"
                    className="input input-bordered w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted mb-2">Security Contact</label>
                  <input
                    type="tel"
                    value={formFields.securityContact}
                    onChange={(e) => handleInputChange("securityContact", e.target.value)}
                    placeholder="Phone number"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn-primary w-full ${loading ? "opacity-50" : ""}`}
                >
                  {loading ? "Creating..." : "Create Property"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
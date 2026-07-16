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
      await onCreate(formData);
      // Reset form after successful submission
      setFormFields({
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
        roomType: "Single",
        sharedType: "",
        preference: "Any",
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
      // Clear formData
      Object.keys(formFields).forEach(key => {
        formData.delete(key);
      });
    } catch (error) {
      // Error is handled by the onCreate hook via toast
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 backdrop-blur-sm p-4">
      <div className="flex h-full w-[600px] max-w-[90vw] bg-white rounded-lg shadow-xl overflow-hidden transform transition-transform duration-300 ease-out translate-x-0">
        {/* Sidebar Panel */}
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-ink">
              Create New Property
            </h2>
            <Button onClick={onClose} className="text-muted hover:text-ink hover:bg-muted/20 rounded-full p-2">
              <Plus className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Basic Information Section */}
              <section>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Property Title *</label>
                    <input
                      value={formFields.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter property title"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Property Type</label>
                    <select
                      value={formFields.roomType}
                      onChange={(e) => handleSelectChange('roomType', e.target.value as "Single" | "Shared")}
                      className="select select-bordered w-full"
                    >
                      <option value="Single">Single Room</option>
                      <option value="Shared">Shared Accommodation</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formFields.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the property, amenities, nearby attractions..."
                    className="textarea textarea-bordered w-full"
                    rows={4}
                  ></textarea>
                </div>
              </section>

              {/* Location Section */}
              <section>
                <h3 className="text-lg font-semibold mb-4">Location</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Address *</label>
                    <input
                      value={formFields.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter full address"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City/Area</label>
                    <input
                      value={formFields.managerContact} // Reusing field for demo - in reality you'd have a separate field
                      onChange={(e) => handleInputChange('managerContact', e.target.value)}
                      placeholder="Enter city or area"
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Latitude</label>
                    <input
                      value={formFields.lat}
                      onChange={(e) => handleInputChange('lat', e.target.value)}
                      placeholder="e.g., 28.6139"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Longitude</label>
                    <input
                      value={formFields.lng}
                      onChange={(e) => handleInputChange('lng', e.target.value)}
                      placeholder="e.g., 77.2090"
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
              </section>

              {/* Pricing Section */}
              <section>
                <h3 className="text-lg font-semibold mb-4">Pricing & Configuration</h3>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Monthly Rent (₹)</label>
                      <input
                        value={formFields.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="Enter monthly rent"
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Security Deposit (months)</label>
                      <input
                        value={formFields.securityDepositMonths}
                        onChange={(e) => handleInputChange('securityDepositMonths', e.target.value)}
                        placeholder="e.g., 2"
                        className="input input-bordered w-full"
                        type="number"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Single Rooms</label>
                      <div className="flex gap-2">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Price</label>
                          <input
                            value={formFields.priceSingle}
                            onChange={(e) => handleInputChange('priceSingle', e.target.value)}
                            placeholder="Per room"
                            className="input input-bordered w-full"
                            type="number"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Count</label>
                          <input
                            value={formFields.bedsSingle}
                            onChange={(e) => handleInputChange('bedsSingle', e.target.value)}
                            placeholder="Number of rooms"
                            className="input input-bordered w-full"
                            type="number"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Double Rooms</label>
                      <div className="flex gap-2">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Price</label>
                          <input
                            value={formFields.priceDouble}
                            onChange={(e) => handleInputChange('priceDouble', e.target.value)}
                            placeholder="Per room"
                            className="input input-bordered w-full"
                            type="number"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Count</label>
                          <input
                            value={formFields.bedsDouble}
                            onChange={(e) => handleInputChange('bedsDouble', e.target.value)}
                            placeholder="Number of rooms"
                            className="input input-bordered w-full"
                            type="number"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Triple Rooms</label>
                      <div className="flex gap-2">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Price</label>
                          <input
                            value={formFields.priceTriple}
                            onChange={(e) => handleInputChange('priceTriple', e.target.value)}
                            placeholder="Per room"
                            className="input input-bordered w-full"
                            type="number"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Count</label>
                          <input
                            value={formFields.bedsTriple}
                            onChange={(e) => handleInputChange('bedsTriple', e.target.value)}
                            placeholder="Number of rooms"
                            className="input input-bordered w-full"
                            type="number"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Preferences & Rules Section */}
              <section>
                <h3 className="text-lg font-semibold mb-4">Preferences & Rules</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Preferred Gender</label>
                    <select
                      value={formFields.preference}
                      onChange={(e) => handleSelectChange('preference', e.target.value as "Boys" | "Girls" | "Any")}
                      className="select select-bordered w-full"
                    >
                      <option value="Boys">Boys Only</option>
                      <option value="Girls">Girls Only</option>
                      <option value="Any">Any Gender</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Shared Room Type</label>
                    <select
                      value={formFields.sharedType}
                      onChange={(e) => handleSelectChange('sharedType', e.target.value)}
                      className="select select-bordered w-full"
                    >
                      <option value="">Not Applicable</option>
                      <option value="Double">Double Sharing</option>
                      <option value="Triple">Triple Sharing</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Meal Plan</label>
                    <input
                      value={formFields.mealPlan}
                      onChange={(e) => handleInputChange('mealPlan', e.target.value)}
                      placeholder="e.g., Includes breakfast and dinner"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meal Times</label>
                    <input
                      value={formFields.mealTimes}
                      onChange={(e) => handleInputChange('mealTimes', e.target.value)}
                      placeholder="e.g., 7:00 AM, 7:00 PM"
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Curfew Time</label>
                    <input
                      value={formFields.curfewTime}
                      onChange={(e) => handleInputChange('curfewTime', e.target.value)}
                      placeholder="e.g., 10:00 PM"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Lock-in Period</label>
                    <select name="noticePeriod" defaultValue={formFields?.noticePeriod ?? "11 Month"} className="input">
                  <option value="15 Days">6 Months</option>
                  <option value="1 Month">9 Months</option>
                  <option value="2 Months">11 Months</option>
                </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">House Rules (Strictness Level)</label>
                  <input
                    value={formFields.rulesStrictness}
                    onChange={(e) => handleInputChange('rulesStrictness', e.target.value)}
                    placeholder="Describe rules and enforcement level"
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Facilities & Amenities</label>
                  <input
                    value={formFields.facilities}
                    onChange={(e) => handleInputChange('facilities', e.target.value)}
                    placeholder="e.g., WiFi, Laundry, Parking, Security"
                    className="input input-bordered w-full"
                  />
                </div>
              </section>

              {/* Contact Information Section */}
              <section>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Manager Contact</label>
                    <input
                      value={formFields.managerContact}
                      onChange={(e) => handleInputChange('managerContact', e.target.value)}
                      placeholder="Phone number or email"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Security Contact</label>
                    <input
                      value={formFields.securityContact}
                      onChange={(e) => handleInputChange('securityContact', e.target.value)}
                      placeholder="Emergency contact"
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
              </section>

              {/* Admin Controls Section (for Super Admins) */}
              <section>
                <h3 className="text-lg font-semibold mb-4">Admin Controls</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Manual Owner Name (For SUPER_ADMIN use)</label>
                    <input
                      value={formFields.manualOwnerName}
                      onChange={(e) => handleInputChange('manualOwnerName', e.target.value)}
                      placeholder="Enter owner name if creating on behalf of owner"
                      className="input input-bordered w-full"
                    />
                    <p className="text-xs text-muted mt-1">
                      Only required when SUPER_ADMIN creates property without specifying ownerId
                    </p>
                  </div>
                </div>
              </section>
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t flex justify-end space-x-3">
            <Button
              onClick={onClose}
              className="px-6 py-2 bg-muted hover:bg-muted/20 rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="property-form"
              disabled={loading}
              className={`px-6 py-2 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 rounded-md transition-colors`}
            >
              {loading ? "Creating..." : "Create Property"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
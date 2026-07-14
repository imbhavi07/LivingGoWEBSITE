"use client";

import { useState } from "react";
import { X, CheckCircle, Loader2, AlertCircle, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

type ScheduleVisitModalProps = {
  propertyId: string;
  propertyCode: string;
  onClose: () => void;
};

type Step = "input" | "confirm" | "success" | "error" | "loading";

export function ScheduleVisitModal({ propertyId, propertyCode, onClose }: ScheduleVisitModalProps) {
  const [step, setStep] = useState<Step>("input");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [visitDate, setVisitDate] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [couponCode, setCouponCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tokenId, setTokenId] = useState<string>("");

  // Generate a mock token ID for display (in real app, this comes from server)
  const generateMockTokenId = () => {
    const randomBytes = crypto.getRandomValues(new Uint8Array(3));
    let hexString = "";
    for (let i = 0; i < randomBytes.length; i++) {
      hexString += randomBytes[i].toString(16).padStart(2, "0");
    }
    return `VISIT-${hexString.toUpperCase().substring(0, 6)}`;
  };

  // Validate date is not in the past
  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const selectedDate = new Date(dateString);
    const today = new Date();
    // Set both to midnight for date-only comparison
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  // Validate time slot format (HH:MM AM/PM - HH:MM AM/PM)
  const isValidTimeSlot = (timeSlotStr: string): boolean => {
    // Expected format: "HH:MM AM/PM - HH:MM AM/PM" (e.g., "09:20 AM - 09:40 AM")
    const timeSlotRegex = /^(\d{2}):(\d{2}) (AM|PM) - (\d{2}):(\d{2}) (AM|PM)$/;
    const match = timeSlotStr.match(timeSlotRegex);

    if (!match) return false;

    const [, startHourStr, startMinStr, startPeriod, endHourStr, endMinStr, endPeriod] = match;

    const startHour = parseInt(startHourStr, 10);
    const startMin = parseInt(startMinStr, 10);
    const endHour = parseInt(endHourStr, 10);
    const endMin = parseInt(endMinStr, 10);

    // Convert to 24-hour format for easier comparison
    let startHour24 = startHour;
    let endHour24 = endHour;

    if (startPeriod === "PM" && startHour !== 12) startHour24 = startHour + 12;
    if (startPeriod === "AM" && startHour === 12) startHour24 = 0;

    if (endPeriod === "PM" && endHour !== 12) endHour24 = endHour + 12;
    if (endPeriod === "AM" && endHour === 12) endHour24 = 0;

    // Validate time range: 8:00 AM to 8:00 PM (08:00 to 20:00 in 24-hour format)
    const startTimeInMinutes = startHour24 * 60 + startMin;
    const endTimeInMinutes = endHour24 * 60 + endMin;

    const minTime = 8 * 60; // 8:00 AM = 480 minutes
    const maxTime = 20 * 60; // 8:00 PM = 1200 minutes

    // Check if within valid hours
    if (startTimeInMinutes < minTime || endTimeInMinutes > maxTime) {
      return false;
    }

    // Check if it's exactly 20 minutes duration
    const duration = endTimeInMinutes - startTimeInMinutes;
    if (duration !== 20) {
      return false;
    }

    // Check if start time is on a 20-minute boundary (0, 20, 40 minutes past the hour)
    if (startMin % 20 !== 0) {
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!visitDate || !timeSlot) {
      setErrorMessage("Please select a date and time slot");
      return;
    }

    if (!isValidDate(visitDate)) {
      setErrorMessage("Please select a date that is today or in the future");
      return;
    }

    if (!isValidTimeSlot(timeSlot)) {
      setErrorMessage("Please select a valid time slot between 8:00 AM and 8:00 PM in 20-minute intervals");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // In a real implementation, this would make an API call to the backend
      // For now, we'll simulate the API call and generate a mock token ID
      // The actual implementation would use the apiClient from lib/api/client

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate token ID (would come from backend response in real implementation)
      const generatedTokenId = generateMockTokenId();
      setTokenId(generatedTokenId);

      // In a real app, we would make an actual API call here:
      // const response = await apiClient.post(`/visits/schedule`, {
      //   visitDate,
      //   timeSlot,
      //   propertyId,
      //   couponCode: couponCode || undefined
      // });
      // setTokenId(response.data.tokenId);

      setStep("success");
    } catch (err) {
      console.error("Failed to schedule visit:", err);
      setErrorMessage("Failed to schedule visit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && step !== "loading") onClose(); }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-black text-ink">Schedule Visit</h2>
          {step !== "loading" && (
            <button onClick={onClose} className="rounded-full p-2 hover:bg-linen transition-colors" aria-label="Close">
              <X className="h-5 w-5 text-muted" />
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          {/* --- STEP 1: Input Form --- */}
          {step === "input" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-ink" />
                  <div>
                    <p className="font-semibold text-ink">Visit Date</p>
                    <p className="text-sm text-muted">Select your preferred date</p>
                  </div>
                </div>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]} // Today's date as minimum
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink transition-all duration-200 text-lg"
                />
                {errorMessage && (
                  <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-ink" />
                  <div>
                    <p className="font-semibold text-ink">Time Slot</p>
                    <p className="text-sm text-muted">Select 20-minute window between 8:00 AM and 8:00 PM</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {/* Time slot options would typically be generated dynamically */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Morning slots */}
                    <button
                      onClick={() => setTimeSlot("08:00 AM - 08:20 AM")}
                      className={`px-4 py-3 rounded-xl text-sm font-medium ${timeSlot === "08:00 AM - 08:20 AM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      08:00 AM - 08:20 AM
                    </button>
                    <button
                      onClick={() => setTimeSlot("08:20 AM - 08:40 AM")}
                      className={`px-4 py-3 text-sm font-medium ${timeSlot === "08:20 AM - 08:40 AM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      08:20 AM - 08:40 AM
                    </button>
                    <button
                      onClick={() => setTimeSlot("08:40 AM - 09:00 AM")}
                      className={`px-4 py-3 text-sm font-medium ${timeSlot === "08:40 AM - 09:00 AM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      08:40 AM - 09:00 AM
                    </button>
                    <button
                      onClick={() => setTimeSlot("09:00 AM - 09:20 AM")}
                      className={`px-4 py-3 text-sm font-medium ${timeSlot === "09:00 AM - 09:20 AM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      09:00 AM - 09:20 AM
                    </button>
                    <button
                      onClick={() => setTimeSlot("09:20 AM - 09:40 AM")}
                      className={`px-4 py-3 text-sm font-medium ${timeSlot === "09:20 AM - 09:40 AM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      09:20 AM - 09:40 AM
                    </button>
                    <button
                      onClick={() => setTimeSlot("09:40 AM - 10:00 AM")}
                      className={`px-4 py-3 text-sm font-medium ${timeSlot === "09:40 AM - 10:00 AM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      09:40 AM - 10:00 AM
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {/* More time slots */}
                    <button
                      onClick={() => setTimeSlot("10:00 AM - 10:20 AM")}
                      className={`px-4 py-3 text-sm font-medium ${timeSlot === "10:00 AM - 10:20 AM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      10:00 AM - 10:20 AM
                    </button>
                    <button
                      onClick={() => setTimeSlot("10:20 AM - 10:40 AM")}
                      className={`px-4 py-3 text-sm font-medium ${timeSlot === "10:20 AM - 10:40 AM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      10:20 AM - 10:40 AM
                    </button>
                    <button
                      onClick={() => setTimeSlot("10:40 AM - 11:00 AM")}
                      className={`px-4 py-3 text-sm font-medium ${timeSlot === "10:40 AM - 11:00 AM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      10:40 AM - 11:00 AM
                    </button>
                    <button
                      onClick={() => setTimeSlot("11:00 AM - 11:20 AM")}
                      className={`px-4 py-3 text-sm font-medium ${timeSlot === "11:00 AM - 11:20 AM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      11:00 AM - 11:20 AM
                    </button>
                    <button
                      onClick={() => setTimeSlot("11:20 AM - 11:40 AM")}
                      className={`px-4 py-3 text-sm font-medium ${timeSlot === "11:20 AM - 11:40 AM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      11:20 AM - 11:40 AM
                    </button>
                    <button
                      onClick={() => setTimeSlot("11:40 AM - 12:00 PM")}
                      className={`px-4 py-3 text-sm font-medium ${timeSlot === "11:40 AM - 12:00 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      11:40 AM - 12:00 PM
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {/* Afternoon slots */}
                    <button
                      onClick={() => setTimeSlot("12:00 PM - 12:20 PM")}
                      className={`px-4 py-3 text-sm font-medium ${timeSlot === "12:00 PM - 12:20 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      12:00 PM - 12:20 PM
                    </button>
                    <button
                      onClick={() => setTimeSlot("12:20 PM - 12:40 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "12:20 PM - 12:40 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      12:20 PM - 12:40 PM
                    </button>
                    <button
                      onClick={() => setTimeSlot("12:40 PM - 01:00 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "12:40 PM - 01:00 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      12:40 PM - 01:00 PM
                    </button>
                    <button
                      onClick={() => setTimeSlot("01:00 PM - 01:20 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "01:00 PM - 01:20 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      01:00 PM - 01:20 PM
                    </button>
                    <button
                      onClick={() => setTimeSlot("01:20 PM - 01:40 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "01:20 PM - 01:40 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      01:20 PM - 01:40 PM
                    </button>
                    <button
                      onClick={() => setTimeSlot("01:40 PM - 02:00 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "01:40 PM - 02:00 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      01:40 PM - 02:00 PM
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {/* Evening slots */}
                    <button
                      onClick={() => setTimeSlot("02:00 PM - 02:20 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "02:00 PM - 02:20 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      02:00 PM - 02:20 PM
                    </button>
                    <button
                      onClick={() => setTimeSlot("02:20 PM - 02:40 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "02:20 PM - 02:40 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      02:20 PM - 02:40 PM
                    </button>
                    <button
                      onClick={() => setTimeSlot("02:40 PM - 03:00 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "02:40 PM - 03:00 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      02:40 PM - 03:00 PM
                    </button>
                    <button
                      onClick={() => setTimeSlot("03:00 PM - 03:20 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "03:00 PM - 03:20 PM" ? "bg-ink text-white" : "bg-white border discount: 300 hover:bg-gray-50"}`}
                    >
                      03:00 PM - 03:20 PM
                    </button>
                    <button
                      onClick={() => setTimeSlot("03:20 PM - 03:40 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "03:20 PM - 03:40 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      03:20 PM - 03:40 PM
                    </button>
                    <button
                      onClick={() => setTimeSlot("03:40 PM - 04:00 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "03:40 PM - 04:00 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      03:40 PM - 04:00 PM
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {/* More evening slots */}
                    <button
                      onClick={() => setTimeSlot("04:00 PM - 04:20 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "04:00 PM - 04:20 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      04:00 PM - 04:20 PM
                    </button>
                    <button
                      onClick={() => setTimeSlot("04:20 PM - 04:40 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "04:20 PM - 04:40 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      04:20 PM - 04:40 PM
                    </button>
                    <button
                      onClick={() => setTimeSlot("04:40 PM - 05:00 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "04:40 PM - 05:00 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      04:40 PM - 05:00 PM
                    </button>
                    <button
                      onClick={() => setTimeSlot("05:00 PM - 05:20 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "05:00 PM - 05:20 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      05:00 PM - 05:20 PM
                    </button>
                    <button
                      onClick={() => setTimeSlot("05:20 PM - 05:40 PM")}
                      className={`px-4 p{y-3 text-sm font-medium {timeSlot === "05:20 PM - 05:40 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      05:20 PM - 05:40 PM
                    </button>
                    <button
                      onClick={() => setTimeSlot("05:40 PM - 06:00 PM")}
                      className={`px-4 py-3 text-sm font-medium {timeSlot === "05:40 PM - 06:00 PM" ? "bg-ink text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
                    >
                      05:40 PM - 06:00 PM
                    </button>
                  </div>
                </div>
                {errorMessage && (
                  <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-moss" />
                  <div>
                    <p className="font-semibold text-ink">Referral Code (Optional)</p>
                    <p className="text-sm text-muted">Enter a referral code if you have one</p>
                  </div>
                </div>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="Enter referral code (e.g., ABC123)"
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink transition-all duration-200"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-ink hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-4 py-3 bg-ink text-white rounded-xl font-medium text-sm hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isSubmitting ? "opacity-70" : ""}`}
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Visit"}
                </button>
              </div>
            </div>
          )}

          {/* --- STEP 2: Success --- */}
          {step === "success" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center space-x-4">
                <CheckCircle className="h-10 w-10 text-moss" />
                <div className="text-2xl font-black text-ink">Visit Scheduled!</div>
              </div>
              <p className="text-sm text-muted">
                Your visit has been successfully scheduled. Use the token ID below for reference.
              </p>
              <div className="mt-4 bg-linen p-4 rounded-xl space-y-3">
                <p className="font-semibold text-ink">Visit Details</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Property ID:</span>
                    <span>{propertyCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(visitDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{timeSlot}</span>
                  </div>
                  {couponCode && (
                    <div className="flex justify-between">
                      <span>Referral Code:</span>
                      <span>{couponCode}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-black/10">
                    <span className="font-bold text-ink">Token ID:</span>
                    <span className="font-mono text-lg text-ink">{tokenId}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => {
                    onClose();
                    // Optionally redirect to dashboard or show success message
                  }}
                  className="w-full rounded-2xl bg-ink py-3 text-sm font-bold text-white hover:bg-ink/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* --- STEP 3: Error --- */}
          {step === "error" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <p className="text-sm text-red-600">
                {errorMessage || "Something went wrong. Please try again."}
              </p>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setStep("input")}
                  className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-ink hover:bg-gray-50"
                >
                  Go Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-3 bg-ink text-white rounded-xl font-medium text-sm hover:bg-ink/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
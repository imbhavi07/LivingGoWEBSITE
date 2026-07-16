"use client";

import { useState } from "react";
import { X, CheckCircle, Loader2, AlertCircle, Calendar, Clock } from "lucide-react";
import { apiClient, getApiErrorMessage } from "@/lib/api/client";
import { Button } from "@/components/Button";
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
  const generateTimeSlots = () => {
  const slots: string[] = [];

  let hour = 9;
  let minute = 0;

  while (hour < 19) {
    const start = new Date();
    start.setHours(hour, minute, 0, 0);

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 20);

    const format = (date: Date) =>
      date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

    slots.push(`${format(start)} - ${format(end)}`);

    minute += 20;

    if (minute >= 60) {
      minute = 0;
      hour++;
    }
  }

  return slots;
};

const TIME_SLOTS = generateTimeSlots();
  const [couponCode, setCouponCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [visitDetails, setVisitDetails] = useState<{
    tokenId: string;
    visitOtp: string;
    visitDate: string;
    timeSlot: string;
    property?: {
      propertyCode?: string | null;
      title?: string;
      location?: string;
    };
  } | null>(null);

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
    const timeSlotRegex = /^(\d{2}):(\d{2}) (AM|PM|am|pm) - (\d{2}):(\d{2}) (AM|PM|am|pm)$/;
    const match = timeSlotStr.match(timeSlotRegex);

    if (!match) return false;

    const [, startHourStr, startMinStr, startPeriod, endHourStr, endMinStr, endPeriod] = match;

    const startHour = parseInt(startHourStr, 10);
    const startMin = parseInt(startMinStr, 10);
    const endHour = parseInt(endHourStr, 10);
    const endMin = parseInt(endMinStr, 10);

    let startHour24 = startHour;
    let endHour24 = endHour;

    if (startPeriod === "PM" && startHour !== 12) startHour24 = startHour + 12;
    if (startPeriod === "AM" && startHour === 12) startHour24 = 0;

    if (endPeriod === "PM" && endHour !== 12) endHour24 = endHour + 12;
    if (endPeriod === "AM" && endHour === 12) endHour24 = 0;

    const startTimeInMinutes = startHour24 * 60 + startMin;
    const endTimeInMinutes = endHour24 * 60 + endMin;

    const minTime = 8 * 60; // 8:00 AM
    const maxTime = 20 * 60; // 8:00 PM

    if (startTimeInMinutes < minTime || endTimeInMinutes > maxTime) return false;
    if (endTimeInMinutes - startTimeInMinutes !== 20) return false;
    if (startMin % 20 !== 0) return false;

    return true;
  };

  const handleSubmit = async () => {
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
      const response = await apiClient.post("/visits/schedule", {
        propertyId,
        visitDate: new Date(visitDate).toISOString(),
        timeSlot,
        couponCode: couponCode || null,
      });

      setVisitDetails(response.data.data);
      setStep("success");
    } catch (err) {
      console.error(err);
      setErrorMessage(getApiErrorMessage(err, "Failed to schedule visit. Please try again."));
      setStep("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== "loading") onClose();
      }}
    >
      {/* Outer wrapper converted to flex-col to manage the sticky header and footer */}
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Fixed Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-black/5 px-6 py-4 bg-white z-20">
          <h2 className="text-lg font-black text-ink">Schedule Visit</h2>
          {step !== "loading" && (
            <button onClick={onClose} className="rounded-full p-2 hover:bg-linen transition-colors" aria-label="Close">
              <X className="h-5 w-5 text-muted" />
            </button>
          )}
        </div>

        {/* --- STEP 1: Input Form --- */}
        {step === "input" && (
          <>
            {/* Scrollable Body (Date & Time Slots) */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
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
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink transition-all duration-200 text-lg"
                  />
                  {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}
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
                      {/* Morning slots */}
                      <div className="grid grid-cols-2 gap-3">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTimeSlot(slot)}
                          className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                            timeSlot === slot
                              ? "bg-ink text-white border-ink"
                              : "border-gray-300 bg-white hover:bg-gray-50"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                  </div>
                  </div>
                  {errorMessage && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}
                </div>
              </div>
            </div>

            {/* Sticky Footer (Referral & Buttons) */}
            <div className="shrink-0 border-t border-black/5 bg-white px-6 py-5 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-moss" />
                    <div>
                      <p className="font-semibold text-ink">Referral Code (Optional)</p>
                      <p className="text-xs text-muted">Enter a referral code if you have one</p>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                    placeholder="e.g., ABC123"
                    className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink transition-all duration-200"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-ink hover:bg-gray-50 w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !visitDate || !timeSlot}
                    className={`px-4 py-3 rounded-xl text-sm font-medium text-white transition-all w-full sm:w-auto ${
                      isSubmitting || !visitDate || !timeSlot
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-ink hover:bg-ink/90"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Scheduling...
                      </div>
                    ) : (
                      "Schedule Visit"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* --- STEP 2: Success --- */}
        {step === "success" && (
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="space-y-6 text-center">
              <div className="flex justify-center space-x-4">
                <CheckCircle className="h-10 w-10 text-moss" />
                <div className="text-2xl font-black text-ink">Visit Scheduled!</div>
              </div>
              <p className="text-sm text-muted">
                Your visit has been scheduled successfully. Please keep your Visit OTP safe. You must share this OTP with the
                LivingGo Lead when you meet them. A confirmation WhatsApp message will also be sent to your registered mobile
                number.
              </p>
              <div className="mt-4 bg-linen p-4 rounded-xl space-y-3 text-left">
                <p className="font-semibold text-ink">Visit Details</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Property ID:</span>
                    <span className="font-medium">{visitDetails?.property?.propertyCode ?? propertyCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Date:</span>
                    <span className="font-medium">{visitDetails ? new Date(visitDetails.visitDate).toLocaleDateString() : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Time:</span>
                    <span className="font-medium">{visitDetails?.timeSlot}</span>
                  </div>
                  {couponCode && (
                    <div className="flex justify-between">
                      <span className="text-muted">Referral Code:</span>
                      <span className="font-medium">{couponCode}</span>
                    </div>
                  )}
                  <div className="space-y-2 border-t border-black/10 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-ink">Token ID</span>
                      <span className="font-mono text-sm bg-white px-2 py-1 rounded-md border">{visitDetails?.tokenId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-ink">Visit OTP</span>
                      <span className="font-mono text-lg font-black tracking-widest text-ink">{visitDetails?.visitOtp}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-2">
                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="w-full rounded-2xl bg-ink py-4 text-sm font-bold text-white hover:bg-ink/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 3: Error --- */}
        {step === "error" && (
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <p className="text-sm font-medium text-red-600">{errorMessage || "Something went wrong. Please try again."}</p>
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={() => setStep("input")}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-ink hover:bg-gray-50"
                >
                  Go Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-ink text-white rounded-xl font-medium text-sm hover:bg-ink/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
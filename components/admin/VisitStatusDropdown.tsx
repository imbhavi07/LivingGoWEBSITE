"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/Button";
type VisitStatus = "SCHEDULED" | "VISIT_COMPLETED" | "PRE_BOOKED" | "FULLY_BOOKED" | "CONVERTED_OTHER_PROPERTY" | "LOST";

interface VisitStatusDropdownProps {
  visitId: string;
  currentStatus: VisitStatus;
  onStatusChange: (newStatus: VisitStatus) => void;
}

export const VisitStatusDropdown = ({ visitId, currentStatus, onStatusChange }: VisitStatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions: VisitStatus[] = [
    "SCHEDULED",
    "VISIT_COMPLETED",
    "PRE_BOOKED",
    "FULLY_BOOKED",
    "CONVERTED_OTHER_PROPERTY",
    "LOST"
  ];

  const statusLabels: Record<VisitStatus, string> = {
    SCHEDULED: "Scheduled",
    VISIT_COMPLETED: "Visit Completed",
    PRE_BOOKED: "Pre-booked",
    FULLY_BOOKED: "Fully Booked",
    CONVERTED_OTHER_PROPERTY: "Converted to Other Property",
    LOST: "Lost"
  };

  const handleSelect = (status: VisitStatus) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <span className="truncate">{statusLabels[currentStatus]}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "-rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg py-1">
          {statusOptions.map((status) => (
            <div
              key={status}
              className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(status)}
            >
              {statusLabels[status]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
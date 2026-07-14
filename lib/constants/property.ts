// Centralized constants for property form dropdowns and options
// This ensures consistency between owner and admin forms

export const FACILITIES_OPTIONS = [
  "WiFi",
  "Laundry",
  "Washing Machine",
  "Housekeeping",
  "Power Backup",
  "CCTV",
  "Parking",
  "Security",
  "Study Room",
  "Gym",
  "Water Purifier",
  "Geyser",
  "AC",
  "Lift",
  "Balcony",
  "Common TV"
] as const;

export const MEAL_TIMES_OPTIONS = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks"
] as const;

export const ROOM_TYPE_OPTIONS = [
  "Single",
  "Shared"
] as const;

export const PREFERENCE_OPTIONS = [
  "Boys",
  "Girls",
  "Any"
] as const;

export const MEAL_PLAN_OPTIONS = [
  "Not Included",
  "Veg Only",
  "Veg + Non-Veg",
  "Snacks Only"
] as const;

export const CURFEW_TIME_OPTIONS = [
  "No Curfew",
  "9 PM",
  "10 PM",
  "11 PM",
  "12 AM"
] as const;

export const NOTICE_PERIOD_OPTIONS = [
  "",
  "15 days",
  "1 month",
  "2 months"
] as const;

export const RULES_STRICTNESS_OPTIONS = [
  "",
  "Flexible",
  "Moderate",
  "Strict"
] as const;

export const SECURITY_DEPOSIT_MONTHS_OPTIONS = [
  "0.5",
  "1",
  "2"
] as const;

// Type helpers
export type Facility = typeof FACILITIES_OPTIONS[number];
export type MealTime = typeof MEAL_TIMES_OPTIONS[number];
export type RoomType = typeof ROOM_TYPE_OPTIONS[number];
export type Preference = typeof PREFERENCE_OPTIONS[number];
export type MealPlan = typeof MEAL_PLAN_OPTIONS[number];
export type CurfewTime = typeof CURFEW_TIME_OPTIONS[number];
export type NoticePeriod = typeof NOTICE_PERIOD_OPTIONS[number];
export type RulesStrictness = typeof RULES_STRICTNESS_OPTIONS[number];
export type SecurityDepositMonths = typeof SECURITY_DEPOSIT_MONTHS_OPTIONS[number];
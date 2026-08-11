// Single source of truth for booking status values, labels and tones.
// The API speaks SCREAMING_SNAKE (IN_PROGRESS); humans read the labels.
export const BOOKING_STATUSES = [
  { value: "PENDING",     label: "Pending",     tone: "gray" },
  { value: "ACCEPTED",    label: "Accepted",    tone: "teal" },
  { value: "IN_PROGRESS", label: "In Progress", tone: "yellow" },
  { value: "COMPLETED",   label: "Completed",   tone: "green" },
  { value: "CANCELLED",   label: "Cancelled",   tone: "red" },
];

// Saturated fills matching the analytics donut. Text colour is per-tone
// rather than uniformly white: white on yellow-500 is ~1.8:1 contrast and
// effectively unreadable, so that one carries dark text.
//
// Lives here rather than in StatusPill.jsx because the filter chips need the
// same table, and exporting a constant from a component file trips
// react-refresh/only-export-components.
export const TONE_CLASSES = {
  gray:    "bg-gray-500 text-white",
  teal:    "bg-teal-600 text-white",
  yellow:  "bg-yellow-500 text-gray-900",
  green:   "bg-green-600 text-white",
  red:     "bg-red-600 text-white",
  neutral: "bg-gray-200 text-gray-700",
};

// Unknown values render as themselves in a neutral tone rather than crashing
// or rendering blank — a new backend status should be visible, not silent.
export function bookingStatusMeta(value) {
  const match = BOOKING_STATUSES.find(
    (status) => status.value === value
  );

  return (
    match ?? {
      value,
      label: value || "Unknown",
      tone: "neutral",
    }
  );
}

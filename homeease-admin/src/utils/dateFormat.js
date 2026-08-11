// Booking timestamps arrive as UTC ISO strings. All bucketing is done against
// the Asia/Kolkata calendar, not the viewer's machine — otherwise "Today"
// flips at the wrong hour for anyone outside IST.

const IST = "Asia/Kolkata";

const ABSOLUTE = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: IST,
});

const TIME_ONLY = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: IST,
});

// en-CA yields YYYY-MM-DD, which is trivially parseable.
const IST_DAY = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: IST,
});

// en-IN renders the meridiem lowercase ("10:30 am").
const upperMeridiem = (text) =>
  text.replace(/\b(am|pm)\b/gi, (match) =>
    match.toUpperCase()
  );

// Day index in the IST calendar, so differences come out as whole days.
function istDayIndex(date) {
  const [year, month, day] = IST_DAY.format(date)
    .split("-")
    .map(Number);

  return Date.UTC(year, month - 1, day) / 86400000;
}

function parse(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

// Always-absolute rendering: "25 Jun 2026, 10:30 AM".
export function formatAbsolute(value) {
  const date = parse(value);

  return date
    ? upperMeridiem(ABSOLUTE.format(date))
    : "—";
}

// Full ISO string for the hover tooltip.
export function formatIso(value) {
  const date = parse(value);

  return date ? date.toISOString() : "";
}

// Relative where it reads well, absolute where it does not. Bidirectional:
// booking dates are frequently in the future, so past-only buckets would drop
// most rows through to the absolute branch.
export function formatSmart(value, now = new Date()) {
  const date = parse(value);

  if (!date) {
    return "—";
  }

  const diff =
    istDayIndex(date) - istDayIndex(now);

  const time = upperMeridiem(
    TIME_ONLY.format(date)
  );

  if (diff === 0) {
    return `Today, ${time}`;
  }

  if (diff === -1) {
    return `Yesterday, ${time}`;
  }

  if (diff === 1) {
    return `Tomorrow, ${time}`;
  }

  if (diff < -1 && diff >= -7) {
    return `${Math.abs(diff)} days ago`;
  }

  if (diff > 1 && diff <= 7) {
    return `In ${diff} days`;
  }

  return upperMeridiem(ABSOLUTE.format(date));
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// <input type="date"> yields a calendar date ("2026-01-01"), not an instant.
// Passing it through new Date() would make it UTC midnight, and the IST
// conversion the other helpers do could then shift the displayed day. Reading
// the parts directly keeps a calendar date a calendar date.
export function formatCalendarDate(value) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return `${day} ${MONTHS[month - 1]} ${year}`;
}

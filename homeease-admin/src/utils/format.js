// The Booking Service sends money as strings ("987.00"). Coerce before
// formatting so a missing or malformed value renders as ₹0.00, never ₹NaN.
export function formatCurrency(value) {
  const amount = Number(value);

  const safeAmount = Number.isFinite(amount)
    ? amount
    : 0;

  return `₹${safeAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

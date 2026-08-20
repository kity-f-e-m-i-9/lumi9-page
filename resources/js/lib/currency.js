/**
 * Format a number as an INR amount capped at 2 decimal places, e.g.
 * 389.9 -> "389.90", 99.996 -> "100.00", 350 -> "350.00".
 * Always returns a string safe to interpolate directly (₹{formatAmount(x)}).
 */
export function formatAmount(value) {
  const n = Number(value) || 0;
  return n.toFixed(2);
}

/**
 * Formats integer paise to an Indian-locale rupee string.
 *   118000   -> "₹1,180"
 *   12345600 -> "₹1,23,456"
 *   118050   -> "₹1,180.50"
 *
 * Implemented manually (not Intl.NumberFormat) because Hermes' Intl support
 * varies across RN/Expo versions — a hand-rolled formatter is deterministic
 * on every device and trivially unit-testable.
 */
export function formatPaise(paise: number): string {
  if (!Number.isFinite(paise)) return '₹—';
  const sign = paise < 0 ? '-' : '';
  const abs = Math.abs(Math.round(paise));
  const rupees = Math.floor(abs / 100);
  const p = abs % 100;
  const grouped = groupIndian(String(rupees));
  return p === 0
    ? `${sign}₹${grouped}`
    : `${sign}₹${grouped}.${String(p).padStart(2, '0')}`;
}

/** Indian digit grouping: last 3 digits, then groups of 2 (1,23,45,678). */
function groupIndian(digits: string): string {
  if (digits.length <= 3) return digits;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${last3}`;
}

const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;
const E164_DIGITS_PATTERN = /^[1-9]\d{6,14}$/;

/**
 * Store Indian mobile numbers as their ten-digit local form for backwards
 * compatibility. Store every other country in E.164 format.
 *
 * The completion form supplies a country code, while older clients and
 * existing Indian accounts may still send a local number or +91 number.
 */
export function normalizePhone(input: string): string | null {
  const compact = input.trim().replace(/[()\s.-]/g, "");
  if (!compact || !/^\+?\d+$/.test(compact)) return null;

  const digits = compact.startsWith("+") ? compact.slice(1) : compact;
  if (digits.startsWith("91") && digits.length === 12 && INDIAN_MOBILE_PATTERN.test(digits.slice(2))) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0") && INDIAN_MOBILE_PATTERN.test(digits.slice(1))) {
    return digits.slice(1);
  }
  if (INDIAN_MOBILE_PATTERN.test(digits)) return digits;

  return E164_DIGITS_PATTERN.test(digits) ? `+${digits}` : null;
}
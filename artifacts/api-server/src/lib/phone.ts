const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

/**
 * Store Indian mobile numbers as their ten-digit local form.
 * Accept common user-entered forms such as +91 85006 30595 and 08500630595,
 * but reject values that cannot be safely normalized.
 */
export function normalizePhone(input: string): string | null {
  const compact = input.trim().replace(/[()\s-]/g, "");
  if (!compact || !/^\+?\d+$/.test(compact)) return null;

  let localNumber = compact;
  if (compact.startsWith("+91")) {
    localNumber = compact.slice(3);
  } else if (compact.startsWith("91") && compact.length === 12) {
    localNumber = compact.slice(2);
  } else if (compact.startsWith("0") && compact.length === 11) {
    localNumber = compact.slice(1);
  }

  return INDIAN_MOBILE_PATTERN.test(localNumber) ? localNumber : null;
}
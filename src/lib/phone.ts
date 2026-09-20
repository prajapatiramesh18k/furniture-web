/**
 * Client-safe phone helpers (no server imports).
 * Business rule: Indian mobile numbers, exactly 10 digits.
 */

/** Strip formatting + drop +91 / trunk 0 prefix. */
export function normalizePhone(input: string | null | undefined): string {
  const digits = String(input || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

/** True only for exactly 10 digits after normalization. */
export function isValidPhone(input: string | null | undefined): boolean {
  return normalizePhone(input).length === 10;
}

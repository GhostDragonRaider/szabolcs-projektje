/**
 * Telefonszám és e-mail formátum validáció (frontend).
 * Magyar telefonszám: +36 20/30/70 xxx xxxx, 06 20 123 4567, 06201234567 stb.
 * Legalább 9 számjegy (06 vagy +36 után).
 */
const PHONE_DIGITS_MIN = 9
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidPhone(s: string): boolean {
  if (!s || typeof s !== "string") return false
  const digits = s.replace(/\D/g, "")
  return digits.length >= PHONE_DIGITS_MIN
}

export function isValidEmail(s: string): boolean {
  if (!s || typeof s !== "string") return false
  return EMAIL_REGEX.test(s.trim())
}

export const PHONE_ERROR = "Érvényes telefonszámot adj meg (pl. +36 30 123 4567 vagy 06 30 123 4567)."
export const EMAIL_ERROR = "Érvényes e-mail címet adj meg (pl. pelda@email.hu)."

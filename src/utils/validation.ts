/** Shared validation utilities */

/** Returns true if any error string is non-empty */
export function hasErrors(errors: Record<string, string>): boolean {
  return Object.values(errors).some((e) => e !== '')
}

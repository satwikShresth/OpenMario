/**
 * Registrar placeholder names used when faculty has not been announced.
 * These must not be treated as real professors (no RMP lookup, no profile links).
 */
const PLACEHOLDER_INSTRUCTOR_NAMES = new Set([
   'staff',
   'tba',
   'tbd',
   'to be announced',
   'to be determined',
   'instructor tba',
   'instructor tbd'
]);

export function isPlaceholderInstructor(name: string | null | undefined): boolean {
   if (!name) return true;
   return PLACEHOLDER_INSTRUCTOR_NAMES.has(name.trim().toLowerCase());
}

export function filterRealInstructorNames(names: string[]): string[] {
   return names.filter(name => !isPlaceholderInstructor(name));
}

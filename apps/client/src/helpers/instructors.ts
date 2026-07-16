/**
 * Registrar placeholder names used when faculty has not been announced.
 * Keep in sync with packages/db/src/instructors.ts.
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

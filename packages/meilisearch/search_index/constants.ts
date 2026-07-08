/** Academic year currently indexed in Meilisearch for course search. */
export const ACTIVE_YEAR = 2026;

/** Drexel term IDs for the active academic year. */
export const ACTIVE_TERMS = ['202615', '202625', '202635'] as const;

/** Prior-year terms removed from the sections index during sync. */
export const RETIRED_TERMS_2025 = [
   '202515',
   '202525',
   '202535',
   '202545'
] as const;

export const ACTIVE_TERM_NUMBERS = ACTIVE_TERMS.map(Number);

export function meiliTermFilter(terms: readonly string[]): string {
   return `term IN [${terms.map(term => `"${term}"`).join(', ')}]`;
}

export const MEILI_FILTER_ACTIVE_TERMS = meiliTermFilter(ACTIVE_TERMS);
export const MEILI_FILTER_RETIRED_2025 = meiliTermFilter(RETIRED_TERMS_2025);

export function isActiveTerm(term: string): boolean {
   return (ACTIVE_TERMS as readonly string[]).includes(term);
}

/** Drexel term IDs for the 2025 academic year (Fall–Summer). */
export const TERMS_2025 = ['202515', '202525', '202535', '202545'] as const;

export const MEILI_FILTER_TERMS_2025 = `term IN [${TERMS_2025.map(t => `"${t}"`).join(', ')}]`;

export function isTerm2025(term: string): boolean {
   return (TERMS_2025 as readonly string[]).includes(term);
}

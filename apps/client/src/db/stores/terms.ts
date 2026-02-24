import { Store, useStore } from '@tanstack/react-store';
import { db } from '@/db/dexie';

export type TermRow = {
   id: string;
   term: string;
   year: number;
   is_active: boolean;
};

export const termsStore = new Store(new Map<string, TermRow>());

db.terms.toArray().then(rows => {
   termsStore.setState(() => new Map(rows.map(r => [r.id, r])));
});

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useTermById(id: string | null | undefined): TermRow | null {
   return useStore(termsStore, s => (id ? (s.get(id) ?? null) : null));
}

export function useTermByNameYear(
   termName: string,
   year: number | null,
): TermRow | null {
   return useStore(termsStore, s => {
      if (!year || !termName) return null;
      for (const t of s.values()) {
         if (t.term === termName && t.year === year) return t;
      }
      return null;
   });
}

export function useAllTerms(): TermRow[] {
   return useStore(termsStore, s => Array.from(s.values()));
}

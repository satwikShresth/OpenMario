import { Store, useStore } from '@tanstack/react-store';
import { db } from '@/db/dexie';

export type SectionRow = {
   crn: string;
   term_id: string;
   course_id: string;
   status: string | null;
   liked: boolean;
   grade: string | null;
};

export const sectionsStore = new Store(new Map<string, SectionRow>());

db.sections.toArray().then(rows => {
   sectionsStore.setState(() => new Map(rows.map(r => [r.crn, r])));
});

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useSectionData(crn: string): SectionRow | null {
   return useStore(sectionsStore, s => s.get(crn) ?? null);
}

export function useLikedSections(): SectionRow[] {
   return useStore(sectionsStore, s =>
      Array.from(s.values()).filter(sec => sec.liked),
   );
}

export function useSectionsByTermId(termId: string | null): SectionRow[] {
   return useStore(sectionsStore, s => {
      if (!termId) return [];
      return Array.from(s.values()).filter(sec => sec.term_id === termId);
   });
}

export function useAllSections(): SectionRow[] {
   return useStore(sectionsStore, s => Array.from(s.values()));
}

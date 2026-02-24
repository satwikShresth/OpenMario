import { Store, useStore } from '@tanstack/react-store';
import { db } from '@/db/dexie';

export type SubmissionRow = {
   id: string;
   server_id: string | null;
   owner_id: string | null;
   is_draft: boolean;
   status: string;
   company: string;
   position: string;
   location: string;
   year: number;
   coop_year: string;
   coop_cycle: string;
   program_level: string;
   work_hours: number;
   compensation: number;
   other_compensation: string | null;
   details: string | null;
};

export const submissionsStore = new Store(new Map<string, SubmissionRow>());

db.submissions.toArray().then(rows => {
   submissionsStore.setState(() => new Map(rows.map(r => [r.id, r])));
});

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useSubmissionById(
   id: string | null | undefined,
): SubmissionRow | null {
   return useStore(submissionsStore, s => (id ? (s.get(id) ?? null) : null));
}

/** Match by local id first, then server_id — used on the reported/$key route. */
export function useSubmissionByKey(
   key: string | null | undefined,
): SubmissionRow | null {
   return useStore(submissionsStore, s => {
      if (!key) return null;
      const byId = s.get(key);
      if (byId) return byId;
      for (const sub of s.values()) {
         if (sub.server_id === key) return sub;
      }
      return null;
   });
}

export function useSubmissions(isDraft: boolean): SubmissionRow[] {
   return useStore(submissionsStore, s =>
      Array.from(s.values()).filter(sub => sub.is_draft === isDraft),
   );
}

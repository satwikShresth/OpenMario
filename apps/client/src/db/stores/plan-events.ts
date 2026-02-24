import { Store, useStore } from '@tanstack/react-store';
import { db } from '@/db/dexie';

export type PlanEventRow = {
   id: string;
   type: string;
   title: string | null;
   start: string;
   end: string;
   term_id: string;
   crn: string | null;
};

export const planEventsStore = new Store(new Map<string, PlanEventRow>());

db.plan_events.toArray().then(rows => {
   planEventsStore.setState(() => new Map(rows.map(r => [r.id, r])));
});

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function usePlanEventByCrn(crn: string): PlanEventRow | null {
   return useStore(planEventsStore, s => {
      for (const e of s.values()) {
         if (e.crn === crn) return e;
      }
      return null;
   });
}

export function usePlanEventsByCrn(crn: string | null): PlanEventRow[] {
   return useStore(planEventsStore, s => {
      if (!crn) return [];
      return Array.from(s.values()).filter(e => e.crn === crn);
   });
}

export function usePlanEventsByTermId(termId: string | null): PlanEventRow[] {
   return useStore(planEventsStore, s => {
      if (!termId) return [];
      return Array.from(s.values()).filter(e => e.term_id === termId);
   });
}

export function useAllPlanEvents(): PlanEventRow[] {
   return useStore(planEventsStore, s => Array.from(s.values()));
}

/**
 * All database mutations — each write updates both Dexie (persistence)
 * and the relevant TanStack Store (reactivity) in one synchronous + async step.
 * Stores update immediately (optimistic); Dexie write happens in background.
 */
import { db, type SubmissionRecord } from './dexie';
import { termsStore } from './stores/terms';
import { coursesStore } from './stores/courses';
import { sectionsStore } from './stores/sections';
import { planEventsStore } from './stores/plan-events';
import { submissionsStore } from './stores/submissions';

// ── Terms ─────────────────────────────────────────────────────────────────────

/** Upsert a term by (term, year). Returns the id (existing or new). */
export async function upsertTerm(term: string, year: number): Promise<string> {
   for (const t of termsStore.state.values()) {
      if (t.term === term && t.year === year) return t.id;
   }
   const id = crypto.randomUUID();
   const record = { id, term, year, is_active: false };
   termsStore.setState(s => new Map(s).set(id, record));
   await db.terms.put(record);
   return id;
}

// ── Courses ───────────────────────────────────────────────────────────────────

export async function upsertCourse(course: {
   id: string; course: string; title: string;
   credits?: number | string | null; completed?: boolean;
}): Promise<void> {
   const existing = coursesStore.state.get(course.id);
   const rawCredits = course.credits ?? existing?.credits ?? null;
   const credits = rawCredits != null ? Math.round(Number(rawCredits)) : null;
   const record = {
      id: course.id,
      course: course.course,
      title: course.title,
      credits: Number.isFinite(credits) ? credits : null,
      completed: course.completed ?? existing?.completed ?? false,
   };
   coursesStore.setState(s => new Map(s).set(course.id, record));
   await db.courses.put(record);
}

export async function updateCourse(
   id: string,
   updates: Partial<{ completed: boolean; credits: number | null }>,
): Promise<void> {
   const existing = coursesStore.state.get(id);
   if (!existing) return;
   const record = { ...existing, ...updates };
   coursesStore.setState(s => new Map(s).set(id, record));
   await db.courses.put(record);
}

export async function deleteCourse(id: string): Promise<void> {
   coursesStore.setState(s => { const n = new Map(s); n.delete(id); return n; });
   await db.courses.delete(id);
}

// ── Sections ──────────────────────────────────────────────────────────────────

export async function upsertSection(section: {
   crn: string; term_id: string; course_id: string;
   status?: string | null; liked?: boolean; grade?: string | null;
}): Promise<void> {
   const existing = sectionsStore.state.get(section.crn);
   const record = {
      crn: section.crn,
      term_id: section.term_id,
      course_id: section.course_id,
      status: section.status ?? existing?.status ?? null,
      liked: section.liked ?? existing?.liked ?? false,
      grade: section.grade ?? existing?.grade ?? null,
   };
   sectionsStore.setState(s => new Map(s).set(section.crn, record));
   await db.sections.put(record);
}

export async function updateSection(
   crn: string,
   updates: Partial<Pick<{ liked: boolean; status: string | null; grade: string | null }, 'liked' | 'status' | 'grade'>>,
): Promise<void> {
   const existing = sectionsStore.state.get(crn);
   if (!existing) return;
   const record = { ...existing, ...updates };
   sectionsStore.setState(s => new Map(s).set(crn, record));
   await db.sections.put(record);
}

export async function deleteSection(crn: string): Promise<void> {
   sectionsStore.setState(s => { const n = new Map(s); n.delete(crn); return n; });
   await db.sections.delete(crn);
}

// ── Plan Events ───────────────────────────────────────────────────────────────

export async function insertPlanEvent(event: {
   type: string; title?: string | null;
   start: string; end: string; term_id: string; crn?: string | null;
}): Promise<string> {
   const id = crypto.randomUUID();
   const record = { id, type: event.type, title: event.title ?? null,
      start: event.start, end: event.end, term_id: event.term_id, crn: event.crn ?? null };
   planEventsStore.setState(s => new Map(s).set(id, record));
   await db.plan_events.add(record);
   return id;
}

export async function updatePlanEvent(
   id: string,
   updates: Partial<Pick<{ start: string; end: string; title: string | null }, 'start' | 'end' | 'title'>>,
): Promise<void> {
   const existing = planEventsStore.state.get(id);
   if (!existing) return;
   const record = { ...existing, ...updates };
   planEventsStore.setState(s => new Map(s).set(id, record));
   await db.plan_events.put(record);
}

export async function deletePlanEvent(id: string): Promise<void> {
   planEventsStore.setState(s => { const n = new Map(s); n.delete(id); return n; });
   await db.plan_events.delete(id);
}

export async function deletePlanEventsByCrn(crn: string): Promise<void> {
   const ids = Array.from(planEventsStore.state.values())
      .filter(e => e.crn === crn).map(e => e.id);
   planEventsStore.setState(s => {
      const n = new Map(s);
      ids.forEach(id => n.delete(id));
      return n;
   });
   await db.plan_events.bulkDelete(ids);
}

// ── Submissions ───────────────────────────────────────────────────────────────

export async function upsertSubmission(sub: SubmissionRecord): Promise<void> {
   submissionsStore.setState(s => new Map(s).set(sub.id, sub));
   await db.submissions.put(sub);
}

export async function updateSubmission(
   id: string,
   updates: Partial<SubmissionRecord>,
): Promise<void> {
   const existing = submissionsStore.state.get(id);
   if (!existing) return;
   const record = { ...existing, ...updates };
   submissionsStore.setState(s => new Map(s).set(id, record));
   await db.submissions.put(record);
}

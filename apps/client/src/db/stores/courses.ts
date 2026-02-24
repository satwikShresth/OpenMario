import { Store, useStore } from '@tanstack/react-store';
import { db } from '@/db/dexie';

export type CourseRow = {
   id: string;
   course: string;
   title: string;
   credits: number | null;
   completed: boolean;
};

export const coursesStore = new Store(new Map<string, CourseRow>());

db.courses.toArray().then(rows => {
   coursesStore.setState(() => new Map(rows.map(r => [r.id, r])));
});

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useCourseData(
   courseId: string | null | undefined,
): CourseRow | null {
   return useStore(coursesStore, s =>
      courseId ? (s.get(courseId) ?? null) : null,
   );
}

export function useAllCourses(): CourseRow[] {
   return useStore(coursesStore, s => Array.from(s.values()));
}

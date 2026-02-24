import Dexie, { type Table } from 'dexie';

export type TermRecord = {
   id: string;
   term: string;
   year: number;
   is_active: boolean;
};

export type CourseRecord = {
   id: string;
   course: string;
   title: string;
   credits: number | null;
   completed: boolean;
};

export type SectionRecord = {
   crn: string;
   term_id: string;
   course_id: string;
   status: string | null;
   liked: boolean;
   grade: string | null;
};

export type PlanEventRecord = {
   id: string;
   type: string;
   title: string | null;
   start: string;
   end: string;
   term_id: string;
   crn: string | null;
};

export type SubmissionRecord = {
   id: string;
   server_id: string | null;
   owner_id: string | null;
   is_draft: boolean;
   status: string;
   company: string;
   company_id: string | null;
   position: string;
   position_id: string | null;
   location: string;
   location_city: string | null;
   location_state: string | null;
   location_state_code: string | null;
   year: number;
   coop_year: string;
   coop_cycle: string;
   program_level: string;
   work_hours: number;
   compensation: number;
   other_compensation: string | null;
   details: string | null;
   synced_at: string | null;
};

class OpenmarioDB extends Dexie {
   terms!: Table<TermRecord>;
   courses!: Table<CourseRecord>;
   sections!: Table<SectionRecord>;
   plan_events!: Table<PlanEventRecord>;
   submissions!: Table<SubmissionRecord>;

   constructor() {
      super('openmario');
      this.version(1).stores({
         terms: 'id, [term+year]',
         courses: 'id',
         sections: 'crn, term_id, course_id, liked',
         plan_events: 'id, term_id, crn',
         submissions: 'id, server_id, is_draft',
      });
   }
}

export const db = new OpenmarioDB();

const DEFAULT_TERMS: TermRecord[] = [
   { id: 'term-spring-2025', term: 'Spring', year: 2025, is_active: false },
   { id: 'term-summer-2025', term: 'Summer', year: 2025, is_active: false },
   { id: 'term-fall-2025',   term: 'Fall',   year: 2025, is_active: false },
   { id: 'term-winter-2025', term: 'Winter', year: 2025, is_active: false },
   { id: 'term-spring-2026', term: 'Spring', year: 2026, is_active: false },
   { id: 'term-summer-2026', term: 'Summer', year: 2026, is_active: false },
   { id: 'term-fall-2026',   term: 'Fall',   year: 2026, is_active: false },
   { id: 'term-winter-2026', term: 'Winter', year: 2026, is_active: false },
];

// Seed default terms on first open
db.on('ready', async () => {
   const count = await db.terms.count();
   if (count === 0) await db.terms.bulkAdd(DEFAULT_TERMS);
});

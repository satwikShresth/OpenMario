// Plain TypeScript types that mirror the SQL schema in src/db/schema.sql.ts.
// No ORM — these are used for type-safe raw SQL queries via client.sql<T>.

export type Submission = {
   id: string;
   server_id: string | null;
   owner_id: string | null;
   status: string;
   is_draft: boolean;
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
   created_at: string;
   updated_at: string;
   synced_at: string | null;
};

export type CompanyPosition = {
   id: string;
   company: string;
   company_id: string;
   position: string;
   position_id: string;
   created_at: string;
   updated_at: string;
};

export type Term = {
   id: string;
   term: string;
   year: number;
   is_active: boolean;
   created_at: string;
   updated_at: string;
};

export type Course = {
   id: string;
   course: string;
   title: string;
   credits: number | null;
   completed: boolean;
   created_at: string;
   updated_at: string;
};

export type Section = {
   crn: string;
   term_id: string;
   course_id: string;
   status: string | null;
   liked: boolean;
   grade: string | null;
   created_at: string;
   updated_at: string;
};

export type Favorite = {
   id: string;
   crn: string | null;
   created_at: string;
   updated_at: string;
};

export type PlanEvent = {
   id: string;
   type: string;
   title: string | null;
   start: string;
   end: string;
   term_id: string;
   crn: string | null;
   created_at: string;
   updated_at: string;
};

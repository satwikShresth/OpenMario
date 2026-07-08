export type SubmissionDocument = {
   id: string;
   year: number;
   coop_year: string;
   coop_cycle: string;
   program_level: string;
   work_hours: number;
   compensation: number;
   other_compensation: string | null;
   details: string | null;
   company_id: string | null;
   company_name: string | null;
   position_id: string | null;
   position_name: string | null;
   city: string | null;
   state: string | null;
   state_code: string | null;
};

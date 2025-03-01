import type { Submission } from '#client/types.gen';

// Schema-driven definitions
export const PROGRAM_LEVELS = ['Undergraduate', 'Graduate'] as const;
export const COOP_CYCLES = ['Fall/Winter', 'Winter/Spring', 'Spring/Summer', 'Summer/Fall'] as const;
export const COOP_CYCLES_ = ['Fall/Winter', 'Spring/Summer'] as const;
export const COOP_ROUND = ['A', 'B', 'C'] as const;
export const COOP_YEARS = ['1st', '2nd', '3rd'] as const;
export interface CommonData extends Pick<Submission, 'year' | 'coop_year' | 'coop_cycle' | 'program_level'> {
  coop_round: 'A' | 'B' | 'C';
}

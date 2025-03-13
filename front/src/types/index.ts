export const PROGRAM_LEVELS = ['Undergraduate', 'Graduate'] as const;
export const COOP_CYCLES = ['Fall/Winter', 'Winter/Spring', 'Spring/Summer', 'Summer/Fall'] as const;
export const COOP_CYCLES_ = ['Fall/Winter', 'Spring/Summer'] as const;
export const COOP_ROUND = ['A', 'B', 'C'] as const;
export const COOP_YEARS = ['1st', '2nd', '3rd'] as const;
export interface CommonData extends Pick<Submission, 'year' | 'coop_year' | 'coop_cycle' | 'program_level'> {
  coop_round: 'A' | 'B' | 'C';
}
export interface Submission {
  year: number;
  coop_year: string;
  coop_cycle: string;
  company: string;
  position: string;
  location_city: string;
  location_state_code: string;
  program_level: string;
  work_hours: string;
  compensation: number;
  [key: string]: any;
}

// Type for our filter options
export interface FilterOption {
  id: string;
  label: string;
  options?: string[];
  type: 'text' | 'select' | 'number' | 'range';
  min?: number;
  max?: number;
}

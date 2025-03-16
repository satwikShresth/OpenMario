export const PROGRAM_LEVELS = ["Undergraduate", "Graduate"] as const;
export const COOP_CYCLES = [
  "Fall/Winter",
  "Winter/Spring",
  "Spring/Summer",
  "Summer/Fall",
] as const;
export const COOP_CYCLES_ = ["Fall/Winter", "Spring/Summer"] as const;
export const COOP_ROUND = ["A", "B", "C"] as const;
export const COOP_YEARS = ["1st", "2nd", "3rd"] as const;
export interface CommonData
  extends Pick<
    Submission,
    "year" | "coop_year" | "coop_cycle" | "program_level"
  > {
  coop_round: "A" | "B" | "C";
}

// Type for our filter options
export interface FilterOption {
  id: string;
  label: string;
  options?: string[];
  type: "text" | "select" | "number" | "range";
  min?: number;
  max?: number;
}

export type SubmissionAggregate = {
  position: string;
  company: string;
  location: string;
  work_hours: number;
  compensation: number;
  other_compensation: string;
  details: string;
  year: number;
  coop_year: "1st" | "2nd" | "3rd";
  coop_cycle: "Fall/Winter" | "Winter/Spring" | "Spring/Summer" | "Summer/Fall";
  program_level: "Undergraduate" | "Graduate";
};

export type Submission = {
  id?: string;
  company: string;
  position: string;
  location: string;
  program_level: "Undergraduate" | "Graduate";
  work_hours: string;
  coop_cycle: "Fall/Winter" | "Winter/Spring" | "Spring/Summer" | "Summer/Fall";
  coop_year: "1st" | "2nd" | "3rd";
  year: string;
  compensation: string | null;
  other_compensation: string | null;
  details: string | null;
  [key: string]: any;
};

export type CompanyPosition = {
  company: string;
  position: string;
  company_id: string;
  position_id: string;
};

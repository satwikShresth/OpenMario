import { pgEnum } from 'drizzle-orm/pg-core';

export const job_type = [
   'Co-op Experience',
   'Graduate Co-op Experience',
   'Summer-Only Coop'
] as const;

export const experience_level = ['Advanced', 'Beginner', 'Intermediate'] as const;

export const citizenship_restriction = [
   'No Restriction',
   'Resident Alien (Green Card) or US Citizen',
   'US Citizen Only'
] as const;

export const job_status = [
   'Inactive',
   'Pending',
   'Cancelled',
   'Active',
   'Delete'
] as const;

export const compensation_status = [
   'Unpaid Position',
   'Hourly Paid or Salaried Position'
] as const;

export const program_level = ['Undergraduate', 'Graduate'] as const;

export const coop_cycle = [
   'Fall/Winter',
   'Winter/Spring',
   'Spring/Summer',
   'Summer/Fall'
] as const;

export const coop_year = ['1st', '2nd', '3rd'] as const;

export const coop_sequence = ['Only', 'First', 'Second', 'Third'] as const;

export const program_level_type = pgEnum('program_level', program_level);
export const coop_cycle_type = pgEnum('coop_cycle', coop_cycle);
export const coop_year_type = pgEnum('coop_year', coop_year);
export const job_type_enum = pgEnum('job_type', job_type);
export const experience_level_enum = pgEnum('experience_level', experience_level);
export const job_status_enum = pgEnum('job_status', job_status);
export const compensation_status_enum = pgEnum('compensation_status', compensation_status);
export const citizenship_restriction_enum = pgEnum(
   'citizenship_restriction',
   citizenship_restriction
);
export const coop_sequence_enum = pgEnum('coop_sequence', coop_sequence);

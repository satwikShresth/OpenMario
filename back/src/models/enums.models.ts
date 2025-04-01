import { createSelectSchema } from 'drizzle-zod';
import {
   coop_cycle_type,
   coop_year_type,
   location,
   major,
   minor,
   program_level_type,
} from '#/db/index.ts';
import { z } from 'zod';

export const MajorSchema = createSelectSchema(major);
export type Major = z.infer<typeof MajorSchema>;

export const MinorSchema = createSelectSchema(minor);
export type Minor = z.infer<typeof MinorSchema>;

export const LocationSchema = createSelectSchema(location);
export type Location = z.infer<typeof LocationSchema>;

export const CoopYearSchema = createSelectSchema(coop_year_type);
export type CoopYear = z.infer<typeof CoopYearSchema>;

export const CoopCycleSchema = createSelectSchema(coop_cycle_type);
export type CoopCycle = z.infer<typeof CoopCycleSchema>;

export const ProgramLevelSchema = createSelectSchema(program_level_type);
export type ProgramLevel = z.infer<typeof ProgramLevelSchema>;

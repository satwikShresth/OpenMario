import { createSelectSchema } from 'drizzle-zod';
import { coop_cycle_type, coop_year_type, location, major, minor, program_level_type } from '#db';
import { z } from 'zod';

export const MajorSchema = createSelectSchema(major).meta({ id: 'Major' });
export type Major = z.infer<typeof MajorSchema>;

export const MinorSchema = createSelectSchema(minor).meta({ id: 'Minor' });
export type Minor = z.infer<typeof MinorSchema>;

export const LocationSchema = createSelectSchema(location).meta({
   id: 'Location',
});
export type Location = z.infer<typeof LocationSchema>;

export const CoopYearSchema = createSelectSchema(coop_year_type).meta({
   id: 'CoopYear',
});
export type CoopYear = z.infer<typeof CoopYearSchema>;

export const CoopCycleSchema = createSelectSchema(coop_cycle_type).meta({
   id: 'CoopCycle',
});
export type CoopCycle = z.infer<typeof CoopCycleSchema>;

export const ProgramLevelSchema = createSelectSchema(program_level_type).meta({
   id: 'ProgramLevel',
});
export type ProgramLevel = z.infer<typeof ProgramLevelSchema>;

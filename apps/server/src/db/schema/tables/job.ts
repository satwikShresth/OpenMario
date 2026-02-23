import {
   boolean,
   doublePrecision,
   integer,
   pgTable,
   primaryKey,
   timestamp,
   uuid,
   varchar
} from 'drizzle-orm/pg-core';
import {
   coop_cycle_type,
   coop_year_type,
   citizenship_restriction_enum,
   compensation_status_enum,
   experience_level_enum,
   job_status_enum,
   job_type_enum,
   program_level_type
} from './enums';
import { position, location } from './company';
import { users, major } from './users';

export const submission = pgTable('submission', {
   id: uuid().defaultRandom().primaryKey(),
   position_id: uuid()
      .notNull()
      .references(() => position.id, { onDelete: 'restrict' }),
   location_id: uuid()
      .notNull()
      .references(() => location.id, { onDelete: 'restrict' }),
   program_level: program_level_type().notNull(),
   work_hours: integer().notNull().default(40),
   coop_cycle: coop_cycle_type().notNull(),
   coop_year: coop_year_type().notNull(),
   year: integer().notNull(),
   compensation: doublePrecision(),
   other_compensation: varchar({ length: 255 }),
   details: varchar({ length: 255 }),
   owner_id: uuid().references(() => users.id, { onDelete: 'set null' }),
   created_at: timestamp().notNull().defaultNow()
});

export const job_posting = pgTable('job_posting', {
   id: uuid().defaultRandom().primaryKey(),
   position_id: uuid()
      .notNull()
      .references(() => position.id, { onDelete: 'cascade' }),
   location_id: uuid().references(() => location.id, {
      onDelete: 'restrict'
   }),
   job_type: job_type_enum().notNull(),
   job_status: job_status_enum().notNull().default('Inactive'),
   coop_cycle: coop_cycle_type().notNull(),
   year: integer().notNull(),
   job_length: integer().notNull().default(2),
   work_hours: integer().notNull().default(40),
   openings: integer().default(1),
   division_description: varchar({ length: 10000 }),
   position_description: varchar({ length: 15000 }),
   recommended_qualifications: varchar({ length: 5000 }),
   minimum_gpa: doublePrecision(),
   is_nonprofit: boolean().default(false),
   exposure_hazardous_materials: boolean().default(false),
   is_research_position: boolean().default(false),
   is_third_party_employer: boolean().default(false),
   travel_required: boolean().default(false),
   citizenship_restriction: citizenship_restriction_enum().notNull(),
   pre_employment_screening: varchar({ length: 1000 }).default('None'),
   transportation: varchar({ length: 1000 }),
   compensation_status: compensation_status_enum().notNull(),
   compensation_details: varchar({ length: 5000 }),
   other_compensation: varchar({ length: 5000 }),
   created_at: timestamp().defaultNow(),
   updated_at: timestamp().defaultNow()
});

export const job_experience_levels = pgTable(
   'job_experience_levels',
   {
      job_posting_id: uuid()
         .notNull()
         .references(() => job_posting.id, { onDelete: 'cascade' }),
      experience_level: experience_level_enum().notNull()
   },
   table => [
      primaryKey({ columns: [table.job_posting_id, table.experience_level] })
   ]
);

export const job_posting_major = pgTable(
   'job_posting_major',
   {
      job_posting_id: uuid()
         .notNull()
         .references(() => job_posting.id, { onDelete: 'cascade' }),
      major_id: uuid()
         .notNull()
         .references(() => major.id, { onDelete: 'cascade' })
   },
   table => [primaryKey({ columns: [table.job_posting_id, table.major_id] })]
);

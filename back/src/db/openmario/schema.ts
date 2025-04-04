import {
   boolean,
   doublePrecision,
   integer,
   pgEnum,
   pgTable,
   primaryKey,
   text,
   timestamp,
   unique,
   uuid,
   varchar,
} from 'drizzle-orm/pg-core';

export const job_type = [
   'Co-op Experience',
   'Graduate Co-op Experience',
   'Summer-Only Coop',
] as const;

export const experience_level = [
   'Advanced',
   'Beginner',
   'Intermediate',
] as const;
export const experience_desc = [
   'Limited or no previous work experience/first Co-op',
   'Some related work or volunteer experience/second Co-op',
   'Previous related work experience/final Co-op',
] as const;
export const citizenship_restriction = [
   'No Restriction',
   'Resident Alien (Green Card) or US Citizen',
   'US Citizen Only',
] as const;
export const job_status = [
   'Inactive',
   'Pending',
   'Cancelled',
   'Active',
   'Delete',
] as const;
export const compensation_status = [
   'Unpaid Position',
   'Hourly Paid or Salaried Position',
] as const;
export const program_level = ['Undergraduate', 'Graduate'] as const;
export const coop_cycle = [
   'Fall/Winter',
   'Winter/Spring',
   'Spring/Summer',
   'Summer/Fall',
] as const;
export const coop_year = ['1st', '2nd', '3rd'] as const;

// Define all enum types
export const program_level_type = pgEnum('program_level', program_level);
export const coop_cycle_type = pgEnum('coop_cycle', coop_cycle);
export const coop_year_type = pgEnum('coop_year', coop_year);
export const job_type_enum = pgEnum('job_type', job_type);
export const experience_level_enum = pgEnum(
   'experience_level',
   experience_level,
);
export const experience_desc_enum = pgEnum('experience_desc', experience_desc);
export const job_status_enum = pgEnum('job_status', job_status);
export const compensation_status_enum = pgEnum(
   'compensation_status',
   compensation_status,
);
export const citizenship_restriction_enum = pgEnum(
   'citizenship_restriction',
   citizenship_restriction,
);

export const company = pgTable('company', {
   id: uuid().defaultRandom().primaryKey(),
   name: varchar({ length: 255 }).notNull().unique(),
   owner_id: uuid().references(() => users.id, { onDelete: 'set null' }),
});

export const position = pgTable(
   'position',
   {
      id: uuid().defaultRandom().primaryKey(),
      company_id: uuid()
         .notNull()
         .references(() => company.id, { onDelete: 'restrict' }),
      name: varchar({ length: 255 }).notNull(),
      owner_id: uuid().references(() => users.id, { onDelete: 'set null' }),
   },
   (table) => [unique().on(table.company_id, table.name)],
);

export const location = pgTable(
   'location',
   {
      id: uuid().defaultRandom().primaryKey(),
      state_code: varchar({ length: 3 }).notNull(),
      state: varchar({ length: 100 }).notNull(),
      city: varchar({ length: 100 }).notNull(),
   },
   (table) => [unique().on(table.state_code, table.state, table.city)],
);

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
   created_at: timestamp().notNull().defaultNow(),
});

export const users = pgTable('users', {
   id: uuid().primaryKey().defaultRandom(),
   username: varchar({ length: 100 }).notNull(),
   email: text().notNull().unique(),
   created_at: timestamp().notNull().defaultNow(),
   updated_at: timestamp().notNull().defaultNow(),
});

export const profile_major = pgTable(
   'profile_major',
   {
      user_id: uuid()
         .notNull()
         .references(() => users.id, { onDelete: 'cascade' }),
      major_id: uuid()
         .notNull()
         .references(() => major.id, { onDelete: 'cascade' }),
   },
   (table) => [primaryKey({ columns: [table.user_id, table.major_id] })],
);

export const profile_minor = pgTable(
   'profile_minor',
   {
      user_id: uuid()
         .notNull()
         .references(() => users.id, { onDelete: 'cascade' }),
      minor_id: uuid()
         .notNull()
         .references(() => minor.id, { onDelete: 'cascade' }),
   },
   (table) => [primaryKey({ columns: [table.user_id, table.minor_id] })],
);

export const major = pgTable('major', {
   id: uuid().defaultRandom().primaryKey(),
   program_level: program_level_type().notNull(),
   name: varchar({ length: 255 }).notNull().unique(),
});

export const minor = pgTable('minor', {
   id: uuid().defaultRandom().primaryKey(),
   program_level: program_level_type().notNull(),
   name: varchar({ length: 255 }).notNull().unique(),
});

export const job_posting = pgTable(
   'job_posting',
   {
      id: uuid().defaultRandom().primaryKey(),
      position_id: uuid()
         .notNull()
         .references(() => position.id, { onDelete: 'cascade' }),
      location_id: uuid()
         .references(() => location.id, { onDelete: 'restrict' }),
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
      updated_at: timestamp().defaultNow(),
   },
   (table) => [
      unique().on(
         table.position_id,
         table.location_id,
         table.year,
         table.citizenship_restriction,
         table.minimum_gpa,
         table.travel_required,
      ).nullsNotDistinct(),
   ],
);

export const job_experience_levels = pgTable(
   'job_experience_levels',
   {
      job_posting_id: uuid()
         .notNull()
         .references(() => job_posting.id, { onDelete: 'cascade' }),
      experience_level: experience_level_enum().notNull(),
      description: experience_desc_enum().notNull(),
   },
   (
      table,
   ) => [
      primaryKey({ columns: [table.job_posting_id, table.experience_level] }),
   ],
);

export const job_posting_major = pgTable(
   'job_posting_major',
   {
      job_posting_id: uuid()
         .notNull()
         .references(() => job_posting.id, { onDelete: 'cascade' }),
      major_id: uuid()
         .notNull()
         .references(() => major.id, { onDelete: 'cascade' }),
   },
   (table) => [primaryKey({ columns: [table.job_posting_id, table.major_id] })],
);

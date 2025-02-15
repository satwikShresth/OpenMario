import {
   integer,
   pgEnum,
   pgTable,
   primaryKey,
   text,
   timestamp,
   uniqueIndex,
   uuid,
   varchar,
} from 'drizzle-orm/pg-core';

export const program_level = [
   'Undergraduate',
   'Graduate',
] as const;

export const coop_cycle = [
   'Fall/Winter',
   'Winter/Spring',
   'Spring/Summer',
   'Summer/Fall',
] as const;

export const coop_year = [
   '1st',
   '2nd',
   '3rd',
] as const;

export const compensation_types = [
   'Hourly',
   'Stipend',
   'Bonus',
   'Housing',
   'Transportation',
   'Food',
   'Other',
] as const;

export const program_level_type = pgEnum('program_level', program_level);

export const coop_cycle_type = pgEnum('coop_cycle', coop_cycle);

export const coop_year_type = pgEnum('coop_year', coop_cycle);

export const compensation_type = pgEnum(
   'compensation_type',
   compensation_types,
);

export const revoked = pgTable(
   'revoked',
   {
      id: uuid().defaultRandom().primaryKey(),
      signature: text().notNull(),
   },
);

export const major = pgTable(
   'major',
   {
      id: uuid().defaultRandom().primaryKey(),
      program_level: program_level_type().notNull(),
      name: varchar('name', { length: 255 }).notNull().unique(),
   },
);

export const minor = pgTable(
   'minor',
   {
      id: uuid().defaultRandom().primaryKey(),
      program_level: program_level_type().notNull(),
      name: varchar('name', { length: 255 }).notNull().unique(),
   },
);

export const company = pgTable(
   'company',
   {
      id: uuid().defaultRandom().primaryKey(),
      name: varchar({ length: 255 }).notNull().unique(),
   },
);

export const position = pgTable(
   'position',
   {
      id: uuid().defaultRandom().primaryKey(),
      company_id: uuid()
         .notNull()
         .references(() => company.id, { onDelete: 'restrict' }),
      name: varchar({ length: 255 }).notNull(),
   },
   (table) => [
      uniqueIndex('position_company_id_name_idx').on(
         table.company_id,
         table.name,
      ),
   ],
);

export const location = pgTable(
   'location',
   {
      id: uuid().defaultRandom().primaryKey(),
      state: varchar({ length: 100 }).notNull(),
      city: varchar({ length: 100 }).notNull(),
   },
   (table) => [
      uniqueIndex('location_state_city_idx').on(
         table.state,
         table.city,
      ),
   ],
);

export const submission = pgTable(
   'submission',
   {
      id: uuid().defaultRandom().primaryKey(),
      position_id: uuid()
         .notNull()
         .references(() => position.id, { onDelete: 'restrict' }),
      location_id: uuid()
         .notNull()
         .references(() => location.id, { onDelete: 'restrict' }),
      coop_cycle: coop_cycle_type().notNull(),
      coop_year: coop_year_type().notNull(),
      year: integer().notNull(),
      work_hours: integer().notNull().default(40),
      created_at: timestamp().notNull().defaultNow(),
   },
);

export const submission_major = pgTable(
   'submission_major',
   {
      submission_id: uuid()
         .notNull()
         .references(() => submission.id, { onDelete: 'cascade' }),
      major_id: uuid()
         .notNull()
         .references(() => major.id, { onDelete: 'cascade' }),
   },
   (table) => [
      primaryKey({ columns: [table.submission_id, table.major_id] }),
   ],
);

export const submission_minor = pgTable(
   'submission_minor',
   {
      submission_id: uuid().notNull().references(
         () => submission.id,
         { onDelete: 'cascade' },
      ),
      minor_id: uuid()
         .notNull()
         .references(() => minor.id, { onDelete: 'cascade' }),
   },
   (table) => [
      primaryKey({ columns: [table.submission_id, table.minor_id] }),
   ],
);

export const compensation = pgTable(
   'compensation',
   {
      id: uuid()
         .defaultRandom()
         .primaryKey(),
      submission_id: uuid()
         .notNull()
         .references(() => submission.id, { onDelete: 'cascade' }),
      type: compensation_type()
         .notNull(),
      amount: integer(),
      details: varchar({ length: 250 }),
   },
);

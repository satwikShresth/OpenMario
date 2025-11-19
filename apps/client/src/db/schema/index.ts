import {
   pgTable,
   timestamp,
   varchar,
   uuid,
   integer,
   text,
   pgEnum,
   boolean,
   index
} from 'drizzle-orm/pg-core';

/**
 * Favorites table to store liked sections (by CRN)
 * Replaces the localStorage-based favorites system with persistent database storage
 */
export const favorites = pgTable('favorite_sections', {
   id: uuid('id').primaryKey().defaultRandom(),
   crn: varchar('crn', { length: 10 }).notNull().unique(),
   createdAt: timestamp('created_at').notNull().defaultNow(),
   updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Type exports for favorites
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;

/**
 * Enums for salary submissions
 */
export const coopYearEnum = pgEnum('coop_year', ['1st', '2nd', '3rd']);
export const coopCycleEnum = pgEnum('coop_cycle', [
   'Fall/Winter',
   'Winter/Spring',
   'Spring/Summer',
   'Summer/Fall'
]);
export const programLevelEnum = pgEnum('program_level', [
   'Undergraduate',
   'Graduate'
]);
export const submissionStatusEnum = pgEnum('submission_status', [
   'draft',
   'pending',
   'synced',
   'failed'
]);

/**
 * Submissions table - stores both draft and synced salary submissions
 */
export const submissions = pgTable(
   'submissions',
   {
      id: uuid('id').primaryKey().defaultRandom(),
      // Server-side ID (only for synced submissions)
      serverId: uuid('server_id').unique(),
      ownerId: varchar('owner_id', { length: 255 }),

      // Status tracking
      status: submissionStatusEnum('status').notNull().default('draft'),
      isDraft: boolean('is_draft').notNull().default(true),

      // Company & Position
      company: varchar('company', { length: 100 }).notNull(),
      companyId: varchar('company_id', { length: 255 }),
      position: varchar('position', { length: 100 }).notNull(),
      positionId: varchar('position_id', { length: 255 }),

      // Location
      location: varchar('location', { length: 255 }).notNull(),
      locationCity: varchar('location_city', { length: 100 }),
      locationState: varchar('location_state', { length: 100 }),
      locationStateCode: varchar('location_state_code', { length: 2 }),

      // Co-op details
      year: integer('year').notNull(),
      coopYear: coopYearEnum('coop_year').notNull(),
      coopCycle: coopCycleEnum('coop_cycle').notNull(),
      programLevel: programLevelEnum('program_level').notNull(),

      // Compensation details
      workHours: integer('work_hours').notNull(),
      compensation: integer('compensation').notNull(),
      otherCompensation: varchar('other_compensation', { length: 255 }),
      details: text('details'),

      // Metadata
      createdAt: timestamp('created_at').notNull().defaultNow(),
      updatedAt: timestamp('updated_at').notNull().defaultNow(),
      syncedAt: timestamp('synced_at')
   },
   table => [
      index('submissions_status_idx').on(table.status),
      index('submissions_is_draft_idx').on(table.isDraft),
      index('submissions_company_idx').on(table.company),
      index('submissions_server_id_idx').on(table.serverId)
   ]
);

/**
 * Company positions table - stores company/position combinations for autocomplete
 */
export const companyPositions = pgTable(
   'company_positions',
   {
      id: uuid('id').primaryKey().defaultRandom(),
      company: varchar('company', { length: 100 }).notNull(),
      companyId: varchar('company_id', { length: 255 }).notNull(),
      position: varchar('position', { length: 100 }).notNull(),
      positionId: varchar('position_id', { length: 255 }).notNull(),
      createdAt: timestamp('created_at').notNull().defaultNow(),
      updatedAt: timestamp('updated_at').notNull().defaultNow()
   },
   table => [
      index('company_positions_idx').on(table.companyId, table.positionId)
   ]
);

// Type exports for submissions
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;

// Type exports for company positions
export type CompanyPosition = typeof companyPositions.$inferSelect;
export type NewCompanyPosition = typeof companyPositions.$inferInsert;

import {
   pgTable,
   timestamp,
   varchar,
   uuid,
   integer,
   text,
   boolean,
   index,
   unique
} from 'drizzle-orm/pg-core';

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
      status: varchar('status', { length: 20 }).notNull().default('draft'),
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
      coopYear: varchar('coop_year', { length: 10 }).notNull(),
      coopCycle: varchar('coop_cycle', { length: 20 }).notNull(),
      programLevel: varchar('program_level', { length: 20 }).notNull(),

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

/**
 * Terms table - centralized term/year reference with metadata
 * Normalized to avoid repetition and enable term-level queries
 */
export const terms = pgTable(
   'terms',
   {
      id: uuid('id').primaryKey().defaultRandom(),
      term: varchar('term', { length: 20 }).notNull(),
      year: integer('year').notNull(),
      isActive: boolean('is_active').notNull().default(false),
      createdAt: timestamp('created_at').notNull().defaultNow(),
      updatedAt: timestamp('updated_at').notNull().defaultNow()
   },
   table => [unique().on(table.term, table.year)]
);

// Type exports for terms
export type Term = typeof terms.$inferSelect;
export type NewTerm = typeof terms.$inferInsert;

/**
 * Courses table - stores course-level interest (no specific section)
 * Used for tracking courses user is considering
 */
export const courses = pgTable('courses', {
   id: varchar('id', { length: 255 }).primaryKey(), // e.g., "CS-111"
   course: varchar('course', { length: 255 }).notNull(), // e.g., "CS-1800"
   title: varchar('title', { length: 255 }).notNull(), // e.g., "Introduction to Computer Science"
   credits: integer('credits'), // Number of credits
   completed: boolean('completed').notNull().default(false), // Track if course has been taken
   createdAt: timestamp('created_at').notNull().defaultNow(),
   updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Type exports for courses
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

/**
 * Sections table - tracks section-specific status and likes
 * Links to terms table and optionally to plan events
 */
export const sections = pgTable('sections', {
   crn: varchar('crn', { length: 10 }).primaryKey(),
   termId: uuid('term_id')
      .notNull()
      .references(() => terms.id, { onDelete: 'restrict' }),
   courseId: varchar('course_id', { length: 255 })
      .notNull()
      .references(() => courses.id, { onDelete: 'restrict' }),
   status: varchar('status', { length: 20 }), // nullable - null means just liked, no status (values: 'taken', 'planned')
   liked: boolean('liked').notNull().default(false),
   grade: varchar('grade', { length: 5 }), // e.g., "A", "B+", "P", etc. - for "taken" status
   createdAt: timestamp('created_at').notNull().defaultNow(),
   updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Type exports for sections
export type Section = typeof sections.$inferSelect;
export type NewSection = typeof sections.$inferInsert;

export const favorites = pgTable('favorite_sections', {
   id: uuid('id').primaryKey().defaultRandom(),
   crn: varchar('crn', { length: 10 }).references(() => sections.crn, {
      onDelete: 'cascade'
   }),
   createdAt: timestamp('created_at').notNull().defaultNow(),
   updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Type exports for favorites
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;

/**
 * Plan events table - stores individual calendar event occurrences
 * Each row represents one event instance (not compressed schedules)
 * Links to sections for course events, standalone for unavailable events
 */
export const planEvents = pgTable('plan_events', {
   id: uuid('id').primaryKey().defaultRandom(),
   type: varchar('type', { length: 20 }).notNull(), // 'unavailable' or 'course'
   title: varchar('title', { length: 255 }), // nullable - only for unavailable events, course events fetch via join
   start: timestamp('start').notNull(),
   end: timestamp('end').notNull(),
   termId: uuid('term_id')
      .notNull()
      .references(() => terms.id, { onDelete: 'cascade' }),
   crn: varchar('crn', { length: 10 }).references(() => sections.crn, {
      onDelete: 'cascade'
   }),
   createdAt: timestamp('created_at').notNull().defaultNow(),
   updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Type exports for plan events
export type PlanEvent = typeof planEvents.$inferSelect;
export type NewPlanEvent = typeof planEvents.$inferInsert;

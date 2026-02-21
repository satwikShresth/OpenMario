import {
   boolean,
   index,
   integer,
   numeric,
   pgEnum,
   pgTable,
   primaryKey,
   text,
   time,
   uuid
} from 'drizzle-orm/pg-core';

export const day_of_week = [
   'Monday',
   'Tuesday',
   'Wednesday',
   'Thursday',
   'Friday',
   'Saturday'
] as const;

export const day_of_week_enum = pgEnum('day_of_week', day_of_week);

// ---------------------------------------------------------------------------
// Reference / lookup tables
// ---------------------------------------------------------------------------

export const college = pgTable('college', {
   id: text().primaryKey(),
   name: text().notNull()
});

export const term = pgTable('term', {
   id: integer().primaryKey()
});

// ---------------------------------------------------------------------------
// Core domain tables
// ---------------------------------------------------------------------------

export const subject = pgTable(
   'subject',
   {
      id: text().primaryKey(),
      name: text().notNull(),
      college_id: text()
         .notNull()
         .references(() => college.id, { onDelete: 'restrict' })
   },
   table => [index().on(table.college_id)]
);

export const course = pgTable(
   'course',
   {
      id: uuid().primaryKey(),
      subject_id: text()
         .notNull()
         .references(() => subject.id, { onDelete: 'restrict' }),
      course_number: text().notNull(),
      title: text().notNull(),
      credits: numeric({ precision: 5, scale: 1 }),
      credit_range: text(),
      description: text(),
      writing_intensive: boolean().notNull().default(false),
      repeat_status: text(),
      restrictions: text()
   },
   table => [index().on(table.subject_id)]
);

export const instructor = pgTable('instructor', {
   id: integer().primaryKey(),
   name: text().notNull(),
   department: text(),
   rmp_legacy_id: integer(),
   rmp_id: text(),
   num_ratings: integer(),
   avg_rating: numeric({ precision: 3, scale: 1 }),
   avg_difficulty: numeric({ precision: 3, scale: 1 })
});

export const section = pgTable(
   'section',
   {
      crn: integer().primaryKey(),
      course_id: uuid()
         .notNull()
         .references(() => course.id, { onDelete: 'restrict' }),
      subject_code: text()
         .notNull()
         .references(() => subject.id, { onDelete: 'restrict' }),
      course_number: text().notNull(),
      term_id: integer()
         .notNull()
         .references(() => term.id, { onDelete: 'restrict' }),
      section: text().notNull(),
      max_enroll: integer(),
      start_time: time(),
      end_time: time(),
      instruction_method: text(),
      instruction_type: text()
   },
   table => [
      index().on(table.course_id),
      index().on(table.term_id),
      index().on(table.subject_code)
   ]
);

// ---------------------------------------------------------------------------
// Relationship tables
// ---------------------------------------------------------------------------

export const section_days = pgTable(
   'section_days',
   {
      section_crn: integer()
         .notNull()
         .references(() => section.crn, { onDelete: 'cascade' }),
      day: day_of_week_enum().notNull()
   },
   table => [primaryKey({ columns: [table.section_crn, table.day] })]
);

export const instructor_sections = pgTable(
   'instructor_sections',
   {
      instructor_id: integer()
         .notNull()
         .references(() => instructor.id, { onDelete: 'cascade' }),
      section_crn: integer()
         .notNull()
         .references(() => section.crn, { onDelete: 'cascade' })
   },
   table => [
      primaryKey({ columns: [table.instructor_id, table.section_crn] }),
      index().on(table.section_crn)
   ]
);

export const instructor_courses = pgTable(
   'instructor_courses',
   {
      instructor_id: integer()
         .notNull()
         .references(() => instructor.id, { onDelete: 'cascade' }),
      course_id: uuid()
         .notNull()
         .references(() => course.id, { onDelete: 'cascade' })
   },
   table => [
      primaryKey({ columns: [table.instructor_id, table.course_id] }),
      index().on(table.course_id)
   ]
);

export const course_prerequisites = pgTable(
   'course_prerequisites',
   {
      course_id: uuid()
         .notNull()
         .references(() => course.id, { onDelete: 'cascade' }),
      prerequisite_course_id: uuid()
         .notNull()
         .references(() => course.id, { onDelete: 'cascade' }),
      relationship_type: text().notNull(),
      group_id: text().notNull(),
      can_take_concurrent: boolean().notNull().default(false),
      minimum_grade: text()
   },
   table => [
      primaryKey({ columns: [table.course_id, table.prerequisite_course_id] }),
      index().on(table.prerequisite_course_id)
   ]
);

export const course_corequisites = pgTable(
   'course_corequisites',
   {
      course_id: uuid()
         .notNull()
         .references(() => course.id, { onDelete: 'cascade' }),
      corequisite_course_id: uuid()
         .notNull()
         .references(() => course.id, { onDelete: 'cascade' })
   },
   table => [
      primaryKey({ columns: [table.course_id, table.corequisite_course_id] })
   ]
);

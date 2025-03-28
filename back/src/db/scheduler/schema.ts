import {
   boolean,
   doublePrecision,
   integer,
   pgSchema,
   primaryKey,
   serial,
   text,
   time,
   unique,
   uuid,
} from 'drizzle-orm/pg-core';

export const scheduler = pgSchema('scheduler');

export const instruction_method_enum = scheduler.enum('instruction_method', [
   'instruction',
   'Community Based Learning',
   'Face To Face',
   'Hybrid',
   'Online-Asynchronous',
   'Online-Synchronous',
   'Remote Asynchronous',
   'Remote Synchronous',
]);

export const department_enum = scheduler.enum('department', [
   'Accounting',
   'Anthropology',
   'Architecture',
   'Art History',
   'Biological Sciences',
   'Biology',
   'Business',
   'Chemical Engineering',
   'Chemistry',
   'Communication',
   'Computer Science',
   'Criminal Justice',
   'Culinary Arts',
   'Cultural Science',
   'Decision Science',
   'Design',
   'Digital Media',
   'Economics',
   'Education',
   'Engineering',
   'English',
   'Family Studies & Social Work',
   'Film',
   'Finance',
   'Fine Arts',
   'Geology',
   'Graphic Arts',
   'Health Science',
   'History',
   'Hospitality',
   'Humanities',
   'Information Science',
   'Japanese',
   'Journalism',
   'Languages',
   'Law',
   'Library  Information Science',
   'Library & Information Science',
   'Literature',
   'Management',
   'Marketing',
   'Materials Science',
   'Mathematics',
   'Media Arts & Design',
   'Medicine',
   'Music',
   'Not Specified',
   'Nursing',
   'Philosophy',
   'Photography',
   'Physics',
   'Political Science',
   'Psychology',
   'Public Health',
   'Science',
   'Social Work',
   'Sociology',
   'Statistics',
   'Student Services',
   'Theater',
]);

export const instruction_type_enum = scheduler.enum('instruction_type', [
   'instruction',
   'Career Integrated Experience',
   'Clinical',
   'Dissertation',
   'Integrated Lecture & Lab',
   'Internship/Clerkship/Preceptor',
   'Lab',
   'Lab & Studio',
   'Lecture',
   'Lecture & Clinical',
   'Lecture & Lab',
   'Lecture, Lab & Studio',
   'Lecture & Practicum',
   'Lecture & Recitation',
   'Lecture & Seminar',
   'Lecture & Studio',
   'Medical Rotation',
   'Performance',
   'Practice',
   'Practicum',
   'Practicum & Clinical',
   'Private Lesson',
   'Recitation/Discussion',
   'Recitation & Lab',
   'Research',
   'Seminar',
   'Seminar & Clinical',
   'Seminar & Research',
   'Special Topics',
   'Special Topics-Lab',
   'Special Topics-Lecture',
   'Special Topics-Lecture & Lab',
   'Special Topics-Seminar',
   'Studio',
   'Study Abroad',
   'Thesis',
]);

export const colleges = scheduler.table('colleges', {
   id: text().primaryKey(),
   name: text().notNull().unique(),
});

export const subjects = scheduler.table('subjects', {
   id: text().primaryKey(),
   name: text().notNull().unique(),
   college_id: text()
      .references(() => colleges.id, { onDelete: 'restrict' })
      .notNull(),
});

export const courses = scheduler.table(
   'courses',
   {
      id: uuid().defaultRandom().primaryKey(),
      subject_id: text()
         .references(() => subjects.id, { onDelete: 'restrict' })
         .notNull(),
      course_number: text().notNull(),
      title: text().notNull(),
      description: text(),
      credits: doublePrecision().default(0),
      credit_range: text(),
      repeat_status: text(),
      prerequisites: text(),
      corequisites: text(),
      restrictions: text(),
      writing_intensive: boolean().default(false),
   },
   (table) => [unique().on(table.subject_id, table.course_number)],
);

export const sections = scheduler.table(
   'sections',
   {
      crn: integer().notNull().primaryKey(),
      course_id: uuid()
         .references(() => courses.id, { onDelete: 'restrict' })
         .notNull(),
      section: text().notNull(),
      instruction_type: instruction_type_enum().notNull(),
      instruction_method: instruction_method_enum().notNull(),
      credits: doublePrecision(),
      start_time: time(),
      end_time: time(),
      days: integer().array(),
      term: integer(),
   },
   (table) => [
      unique().on(
         table.section,
         table.course_id,
         table.term,
         table.instruction_type,
      ),
   ],
);

export const instructors = scheduler.table('instructors', {
   id: serial().primaryKey(),
   name: text().notNull(),
   avg_difficulty: doublePrecision(),
   avg_rating: doublePrecision(),
   num_ratings: integer(),
   rmp_legacy_id: integer().unique(),
   rmp_id: text().unique(),
   department: department_enum(),
});

export const section_instructor = scheduler.table(
   'section_instructor',
   {
      section_id: integer()
         .notNull()
         .references(() => sections.crn),
      instructor_id: integer()
         .notNull()
         .references(() => instructors.id),
   },
   (table) => [primaryKey({ columns: [table.section_id, table.instructor_id] })],
);

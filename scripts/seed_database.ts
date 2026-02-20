// /**
//  * Seed PostgreSQL from the Memgraph CSV export.
//  * Run from the project root:
//  *   bun --env-file=.env scripts/seed_database.ts
//  */
// import * as fs from 'node:fs';
// import { join } from 'node:path';
// import { parse } from 'csv-parse';
// import { db } from '../apps/server/src/db';
// import {
//    college,
//    course,
//    course_corequisites,
//    course_prerequisites,
//    day,
//    instructor,
//    instructor_courses,
//    instructor_sections,
//    section,
//    section_days,
//    subject,
//    term
// } from '../apps/server/src/db/schema/course_tables';
//
// const CSV_DIR = join(import.meta.dir, 'memgraph_csv_export');
//
// const csv = (file: string) =>
//    parse(readFileSync(join(CSV_DIR, file)), {
//       columns: true,
//       skip_empty_lines: true
//    });
//
// const n = (v: string) => (v === '' ? null : v);
// const int = (v: string) => (v === '' ? null : Number.parseInt(v));
// const intN = (v: string) => (v === '' ? null : Number.parseInt(v));
// const bool = (v: string) => v === 'True' || v === 'true';
//
// // ---------------------------------------------------------------------------
//
// console.log('Seeding...');
// //
// // await db
// //    .insert(college)
// //    .values(csv('college.csv').map(r => ({ id: r['id']!, name: r['name']! })))
// //    .onConflictDoNothing();
// // console.log('✓ college');
// //
// // await db
// //    .insert(term)
// //    .values(csv('term.csv').map(r => ({ id: int(r['id']!) })))
// //    .onConflictDoNothing();
// // console.log('✓ term');
// //
// // await db
// //    .insert(day)
// //    .values(csv('day.csv').map(r => ({ id: r['id']! })))
// //    .onConflictDoNothing();
// // console.log('✓ day');
// //
// // await db
// //    .insert(subject)
// //    .values(
// //       csv('subject.csv').map(r => ({
// //          id: r['id']!,
// //          name: r['name']!,
// //          college_id: r['college_id']!
// //       }))
// //    )
// //    .onConflictDoNothing();
// // console.log('✓ subject');
// //
// // await db
// //    .insert(course)
// //    .values(
// //       csv('course.csv').map(r => ({
// //          id: r['id']!,
// //          subject_id: r['subject_id']!,
// //          course_number: r['course_number']!,
// //          title: r['title']!,
// //          credits: n(r['credits']!),
// //          credit_range: n(r['credit_range']!),
// //          description: n(r['description']!),
// //          writing_intensive: bool(r['writing_intensive']!),
// //          repeat_status: n(r['repeat_status']!),
// //          restrictions: n(r['restrictions']!)
// //       }))
// //    )
// //    .onConflictDoNothing();
// // console.log('✓ course');
// //
// // await db
// //    .insert(instructor)
// //    .values(
// //       csv('instructor.csv').map(r => ({
// //          id: int(r['id']!),
// //          name: r['name']!,
// //          department: n(r['department']!),
// //          rmp_legacy_id: intN(r['rmp_legacy_id']!),
// //          rmp_id: n(r['rmp_id']!),
// //          num_ratings: intN(r['num_ratings']!),
// //          avg_rating: n(r['avg_rating']!),
// //          avg_difficulty: n(r['avg_difficulty']!)
// //       }))
// //    )
// //    .onConflictDoNothing();
// // console.log('✓ instructor');
//
// // csv('section.csv').map(r => ({
// //    crn: int(r['crn']!),
// //    course_id: r['course_id']!,
// //    subject_code: r['subject_code']!,
// //    course_number: r['course_number']!,
// //    term_id: int(r['term_id']!),
// //    section: r['section']!,
// //    max_enroll: int(r['max_enroll']!),
// //    start_time: n(r['start_time']!),
// //    end_time: n(r['end_time']!),
// //    instruction_method: n(r['instruction_method']!),
// //    instruction_type: n(r['instruction_type']!)
// // }));
//
// // const sections = fs
// //    .createReadStream(join(CSV_DIR, 'course_corequisites.csv'), {})
// //    .pipe(
// //       parse({
// //          columns: true,
// //          skip_empty_lines: true
// //       })
// //    );
// //
// // let some = 0;
// // sections.on('data', async r => {
// //    await db
// //       .insert(course_corequisites)
// //       .values({
// //          course_id: r['course_id']!,
// //          corequisite_course_id: r['corequisite_course_id']!
// //       })
// //       .onConflictDoNothing();
// //    console.log(some++);
// // });
// //
// // sections.on('end', () => console.log('END!!'));
//
// // await db
// //    .insert(course_corequisites)
// //    .values(
// //       csv('course_corequisites.csv').map(r => ({
// //          course_id: r['course_id']!,
// //          corequisite_course_id: r['corequisite_course_id']!
// //       }))
// //    )
// //    .onConflictDoNothing();
// // console.log('✓ course_corequisites');

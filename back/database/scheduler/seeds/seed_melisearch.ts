import { sections, courses, subjects, colleges, instructors, section_instructor } from "../../../src/db/index.ts";
import { db } from "../../../src/db/index.ts";
import { eq,sql } from "drizzle-orm";
import { meilisearchService } from '../../../src/services/meilisearch.service.ts';


const daysOfWeekMap = new Map([
  [1, 'Monday'],
  [2, 'Tuesday'],
  [3, 'Wednesday'],
  [4, 'Thursday'],
  [5, 'Friday'],
  [6, 'Saturday'],
  [7, 'Sunday'],
]);

export default async () => {
  try {
    const meilisearch = meilisearchService.client;
    
    // 1. Index Sections
    console.log("Indexing sections...");
    await indexSections(meilisearch);
    console.log("Sections indexing completed.");
    
    // 2. Index Courses
    console.log("Indexing courses...");
    await indexCourses(meilisearch);
    console.log("Courses indexing completed.");
    
    // 3. Index Instructors
    console.log("Indexing instructors...");
    await indexInstructors(meilisearch);
    console.log("Instructors indexing completed.");
    
    console.log("All MeiliSearch indexing completed successfully");
    return { success: true };
  } catch (error) {
    console.error("Error during MeiliSearch indexing:", error);
    throw error; // Re-throw to allow calling code to handle the error
  }
};

/**
 * Index course sections with related data
 */
async function indexSections(meilisearch) {
  // Create sections index
  await meilisearch.createIndex('sections', { primaryKey: 'crn' });

  const sections_to_index = await db
    .select({
      crn: sections.crn,
      section: sections.section,
      instruction_type: sections.instruction_type,
      instruction_method: sections.instruction_method,
      credits: sections.credits,
      start_time: sections.start_time,
      end_time: sections.end_time,
      days: sections.days,
      term: sections.term,
      course_id: courses.id,
      course_number: courses.course_number,
      course: sql`CONCAT(${subjects.id}, ' ', ${courses.course_number})`,
      title: courses.title,
      description: courses.description,
      subject_id: subjects.id,
      subject_name: subjects.name,
      college_id: colleges.id,
      college_name: colleges.name,
      instructors: sql`(
      WITH instructor_data AS (
        SELECT
          ${instructors.id} as id,
          ${instructors.name} as name,
          ${instructors.avg_difficulty} as avg_difficulty,
          ${instructors.avg_rating} as avg_rating,
          ${instructors.department} as department,
          ${instructors.rmp_legacy_id} as rmp_id,
          ${instructors.num_ratings} as num_ratings
        FROM ${section_instructor}
        JOIN ${instructors} ON ${section_instructor.instructor_id} = ${instructors.id}
        WHERE ${section_instructor.section_id} = ${sections.crn}
      )
      SELECT CASE 
        WHEN COUNT(*) > 0 THEN jsonb_agg(to_jsonb(instructor_data))
        ELSE '[]'::jsonb
      END
      FROM instructor_data
      )`
    })
    .from(sections)
    .innerJoin(courses, eq(sections.course_id, courses.id))
    .innerJoin(subjects, eq(courses.subject_id, subjects.id))
    .innerJoin(colleges, eq(subjects.college_id, colleges.id))
    .then(
      (values)=> values
        .map(
          ({days,...others})=> 
            ({
              days: days?.map(i => daysOfWeekMap.get(i)) || null,
              ...others
            })
        )
    )

  await meilisearch.index('sections').addDocuments(sections_to_index);

  await meilisearch.index('sections').updateSearchableAttributes([
    "crn",
    "section",
    "instruction_type",
    "instruction_method",
    "credits",
    "start_time",
    "end_time",
    "days",
    "term",
    "course",
    "title",
    "description",
    "subject_id",
    "subject_name",
    "college_id",
    "college_name",
    "instructors.name",
    "instructors.department"
  ]);

  // Configure filterable attributes
  await meilisearch.index('sections').updateFilterableAttributes([
    'crn',
    'section',
    'instruction_type',
    'instruction_method',
    'credits',
    'days',
    'term',
    'subject_id',
    'subject_name',
    'college_id',
    "college_name",
    'course',
    "instructors.name",
    "instructors.department"
  ]);

  // Configure sortable attributes
  await meilisearch.index('sections').updateSortableAttributes([
    'crn',
    'course_number',
    'credits',
    'start_time',
    'end_time',
    'instructors.avg_rating'
  ]);

  console.log(`Indexed ${sections_to_index.length} sections successfully`);

}

/**
 * Index courses separately
 */
async function indexCourses(meilisearch) {
  // Create courses index
  await meilisearch.createIndex('courses', { primaryKey: 'id' });

  // Get all courses with their subject and college data
  const coursesToIndex = await db
    .select({
      id: courses.id,
      subject_id: courses.subject_id,
      course_number: courses.course_number,
      title: courses.title,
      description: courses.description,
      credits: courses.credits,
      course: sql`CONCAT(${subjects.id}, ' ', ${courses.course_number})`,
      credit_range: courses.credit_range,
      repeat_status: courses.repeat_status,
      prerequisites: courses.prerequisites,
      corequisites: courses.corequisites,
      restrictions: courses.restrictions,
      writing_intensive: courses.writing_intensive,
      subject_name: subjects.name,
      college_id: colleges.id,
      college_name: colleges.name
    })
    .from(courses)
    .innerJoin(subjects, eq(courses.subject_id, subjects.id))
    .innerJoin(colleges, eq(subjects.college_id, colleges.id));

  await meilisearch.index('courses').addDocuments(coursesToIndex);

  await meilisearch.index('courses').updateSearchableAttributes([
    'searchableText',
    'subject_name',
    'course_number',
    'title',
    'description',
    'prerequisites',
    'corequisites',
    'restrictions'
  ]);

  // Configure filterable attributes
  await meilisearch.index('courses').updateFilterableAttributes([
    'subject_id',
    'college_id',
    'credits',
    'credit_range',
    'repeat_status',
    'writing_intensive',
    'subject_name',
    'college_name'
  ]);

  // Configure sortable attributes
  await meilisearch.index('courses').updateSortableAttributes([
    'course_number',
    'credits',
    'title'
  ]);

  console.log(`Indexed ${coursesToIndex.length} courses successfully`);
}

/**
 * Index instructors separately
 */
async function indexInstructors(meilisearch) {
  // Create instructors index
  await meilisearch.createIndex('instructors', { primaryKey: 'id' });

  // Get all instructors
  const instructorsToIndex = await db
    .select({
      id: instructors.id,
      name: instructors.name,
      avg_difficulty: instructors.avg_difficulty,
      avg_rating: instructors.avg_rating,
      num_ratings: instructors.num_ratings,
      department: instructors.department,
      rmp_legacy_id: instructors.rmp_legacy_id,
      rmp_id: instructors.rmp_id
    })
    .from(instructors);

  // Index the transformed data
  await meilisearch.index('instructors').addDocuments(instructorsToIndex);

  // Configure searchable attributes
  await meilisearch.index('instructors').updateSearchableAttributes([
    'name',
    'department',
    'searchableText'
  ]);

  // Configure filterable attributes
  await meilisearch.index('instructors').updateFilterableAttributes([
    'department',
    'avg_difficulty',
    'avg_rating',
    'num_ratings'
  ]);

  // Configure sortable attributes
  await meilisearch.index('instructors').updateSortableAttributes([
    'name',
    'avg_rating',
    'avg_difficulty',
    'num_ratings'
  ]);

  console.log(`Indexed ${instructorsToIndex.length} instructors successfully`);
}

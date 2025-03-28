import { sections, courses, subjects, colleges, instructors, section_instructor } from "../../../src/db/index.ts";
import { db } from "../../../src/db/index.ts";
import { eq, and } from "drizzle-orm";
import { meilisearchService } from '../../../src/services/meilisearch.service.ts';

export default async () => {
  const meilisearch = meilisearchService.client
  // 1. Index Sections (with course, subject, college, and instructor data)
  await indexSections(meilisearch);
  
  // 2. Index Courses separately
  await indexCourses(meilisearch);
  
  // 3. Index Instructors separately
  await indexInstructors(meilisearch);
  
  console.log("Indexing completed successfully");
}

/**
 * Index course sections with related data
 */
async function indexSections(meilisearch) {
  // Create sections index
  await meilisearch.createIndex('sections', { primaryKey: 'id' });
  
  // First, get all sections with their course, subject, and college data
  const sectionsWithCourses = await db
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
      title: courses.title,
      description: courses.description,
      subject_id: subjects.id,
      subject_name: subjects.name,
      college_id: colleges.id,
      college_name: colleges.name
    })
    .from(sections)
    .innerJoin(courses, eq(sections.course_id, courses.id))
    .innerJoin(subjects, eq(courses.subject_id, subjects.id))
    .innerJoin(colleges, eq(subjects.college_id, colleges.id));

  // Now get instructor data for each section using a separate query
  const sectionInstructors = await db
    .select({
      section_id: section_instructor.section_id,
      instructor_id: instructors.id,
      instructor_name: instructors.name,
      avg_difficulty: instructors.avg_difficulty,
      avg_rating: instructors.avg_rating,
      department: instructors.department
    })
    .from(section_instructor)
    .innerJoin(instructors, eq(section_instructor.instructor_id, instructors.id));
  
  // Create a map of instructors by section ID for easier lookup
  const instructorsBySectionId = new Map();
  sectionInstructors.forEach(si => {
    if (!instructorsBySectionId.has(si.section_id)) {
      instructorsBySectionId.set(si.section_id, []);
    }
    instructorsBySectionId.get(si.section_id).push({
      id: si.instructor_id,
      name: si.instructor_name,
      avg_difficulty: si.avg_difficulty,
      avg_rating: si.avg_rating,
      department: si.department
    });
  });
  
  // Combine the data
  const sectionsRaw = sectionsWithCourses.map(section => ({
    ...section,
    instructors: instructorsBySectionId.get(section.crn) || []
  }));

  // Transform raw data into format suitable for MeiliSearch
  const sectionsToIndex = sectionsRaw.map(section => {
    // Extract instructor names for searchable text and display
    const instructorNames = section.instructors.map(i => i.name).join(', ');
    const instructorDetails = section.instructors.map(i => ({
      id: i.id,
      name: i.name,
      avg_difficulty: i.avg_difficulty,
      avg_rating: i.avg_rating,
      department: i.department
    }));
    
    return {
      id: section.crn.toString(), // MeiliSearch requires string IDs
      crn: section.crn,
      section: section.section,
      instruction_type: section.instruction_type,
      instruction_method: section.instruction_method,
      credits: section.credits,
      start_time: section.start_time ? section.start_time.toString() : null,
      end_time: section.end_time ? section.end_time.toString() : null,
      days: section.days,
      term: section.term,
      course_id: section.course_id,
      course_number: section.course_number,
      title: section.title,
      description: section.description,
      subject_id: section.subject_id,
      subject_name: section.subject_name,
      college_id: section.college_id,
      college_name: section.college_name,
      instructors: instructorDetails,
      instructor_names: instructorNames,
      // Create searchable text field combining multiple attributes including instructors
      searchableText: `${section.subject_name} ${section.course_number} ${section.title} ${section.description || ''} ${instructorNames}`
    };
  });
  
  // Index the transformed data
  await meilisearch.index('sections').addDocuments(sectionsToIndex);
  
  console.log(`Indexed ${sectionsToIndex.length} sections successfully`);
}

/**
 * Index courses separately
 */
async function indexCourses(meilisearch) {
  // Create courses index
  await meilisearch.createIndex('courses', { primaryKey: 'id' });
  
  // Get all courses with their subject and college data
  const coursesWithData = await db
    .select({
      id: courses.id,
      subject_id: courses.subject_id,
      course_number: courses.course_number,
      title: courses.title,
      description: courses.description,
      credits: courses.credits,
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
  
  // Transform for MeiliSearch
  const coursesToIndex = coursesWithData.map(course => ({
    id: course.id,
    subject_id: course.subject_id,
    course_number: course.course_number,
    title: course.title,
    description: course.description,
    credits: course.credits,
    credit_range: course.credit_range,
    repeat_status: course.repeat_status,
    prerequisites: course.prerequisites,
    corequisites: course.corequisites,
    restrictions: course.restrictions,
    writing_intensive: course.writing_intensive,
    subject_name: course.subject_name,
    college_id: course.college_id,
    college_name: course.college_name,
    // Create searchable text field
    searchableText: `${course.subject_name} ${course.course_number} ${course.title} ${course.description || ''} ${course.prerequisites || ''} ${course.corequisites || ''} ${course.restrictions || ''}`
  }));

  // Index the transformed data
  await meilisearch.index('courses').addDocuments(coursesToIndex);
  
  console.log(`Indexed ${coursesToIndex.length} courses successfully`);
}

/**
 * Index instructors separately
 */
async function indexInstructors(meilisearch) {
  // Create instructors index
  await meilisearch.createIndex('instructors', { primaryKey: 'id' });
  
  // Get all instructors
  const instructorsRaw = await db
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
  
  // Transform for MeiliSearch
  const instructorsToIndex = instructorsRaw.map(instructor => ({
    id: instructor.id.toString(),
    name: instructor.name,
    avg_difficulty: instructor.avg_difficulty,
    avg_rating: instructor.avg_rating,
    num_ratings: instructor.num_ratings,
    department: instructor.department,
    rmp_legacy_id: instructor.rmp_legacy_id,
    rmp_id: instructor.rmp_id,
    // Create searchable text
    searchableText: `${instructor.name} ${instructor.department || ''}`
  }));

  // Index the transformed data
  await meilisearch.index('instructors').addDocuments(instructorsToIndex);
  
  console.log(`Indexed ${instructorsToIndex.length} instructors successfully`);
}

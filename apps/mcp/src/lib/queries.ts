import {
   eq,
   desc,
   and,
   or,
   sql,
   inArray,
   count,
   type Column,
   type SQL
} from 'drizzle-orm';
import {
   course,
   instructor,
   instructor_sections,
   section,
   prerequisitesMView,
   corequisitesMView,
   meiliProfessorsIdx,
   instructorSectionsMView,
   companyDetailMView,
   companyPositionsMView,
   position,
   position_review,
   company,
   location
} from '@openmario/db';
import { getDb } from './db';

export async function fetchCourse(courseId: string) {
   const db = getDb();
   const rows = await db
      .select({
         id: course.id,
         subject_id: course.subject_id,
         course_number: course.course_number,
         title: course.title,
         description: course.description,
         credits: course.credits,
         writing_intensive: course.writing_intensive,
         repeat_status: course.repeat_status,
         crn: section.crn,
         instruction_type: section.instruction_type,
         instruction_method: section.instruction_method
      })
      .from(course)
      .leftJoin(section, eq(section.course_id, course.id))
      .where(eq(course.id, courseId))
      .limit(1);

   if (rows.length === 0) throw new Error(`Course not found: ${courseId}`);
   const row = rows[0]!;
   return {
      ...row,
      credits: row.credits ? Number.parseFloat(row.credits) : 0
   };
}

export async function fetchPrerequisites(courseId: string) {
   const db = getDb();
   const [courseRow] = await db
      .select({
         id: course.id,
         name: course.title,
         subjectId: course.subject_id,
         courseNumber: course.course_number
      })
      .from(course)
      .where(eq(course.id, courseId))
      .limit(1);

   if (!courseRow) throw new Error(`Course not found: ${courseId}`);

   const rows = await db
      .select()
      .from(prerequisitesMView)
      .where(eq(prerequisitesMView.course_id, courseId));

   const prerequisites = Object.values(
      rows.reduce<
         Record<
            string,
            {
               id: string;
               name: string;
               subjectId: string;
               courseNumber: string;
               relationshipType: string;
               groupId: string;
               canTakeConcurrent: boolean;
               minimumGrade: string;
            }[]
         >
      >((acc, row) => {
         if (!acc[row.group_id]) acc[row.group_id] = [];
         acc[row.group_id]!.push({
            id: row.prereq_id,
            name: row.prereq_title,
            subjectId: row.prereq_subject_id,
            courseNumber: row.prereq_course_number,
            relationshipType: row.relationship_type,
            groupId: row.group_id,
            canTakeConcurrent: row.can_take_concurrent,
            minimumGrade: row.minimum_grade ?? ''
         });
         return acc;
      }, {})
   );

   return { course: courseRow, prerequisites };
}

export async function fetchCorequisites(courseId: string) {
   const db = getDb();
   const [courseRow] = await db
      .select({
         id: course.id,
         name: course.title,
         subjectId: course.subject_id,
         courseNumber: course.course_number
      })
      .from(course)
      .where(eq(course.id, courseId))
      .limit(1);

   if (!courseRow) throw new Error(`Course not found: ${courseId}`);

   const rows = await db
      .select()
      .from(corequisitesMView)
      .where(eq(corequisitesMView.course_id, courseId));

   return {
      course: courseRow,
      corequisites: rows.map(row => ({
         id: row.coreq_id,
         name: row.coreq_title,
         subjectId: row.coreq_subject_id,
         courseNumber: row.coreq_course_number
      }))
   };
}

export async function fetchDependents(courseId: string) {
   const db = getDb();
   const [courseRow] = await db
      .select({
         id: course.id,
         name: course.title,
         subjectId: course.subject_id,
         courseNumber: course.course_number
      })
      .from(course)
      .where(eq(course.id, courseId))
      .limit(1);

   if (!courseRow) throw new Error(`Course not found: ${courseId}`);

   const rows = await db
      .select({
         id: prerequisitesMView.course_id,
         name: prerequisitesMView.course_title,
         subjectId: prerequisitesMView.course_subject_id,
         courseNumber: prerequisitesMView.course_number
      })
      .from(prerequisitesMView)
      .where(eq(prerequisitesMView.prereq_id, courseId));

   const seen = new Set<string>();
   const dependents = rows.filter(row => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
   });

   return { course: courseRow, dependents };
}

export async function fetchAvailabilities(courseId: string) {
   const db = getDb();
   const rows = await db
      .select({
         term: section.term_id,
         crn: section.crn,
         instructor_id: instructor.id,
         instructor_name: instructor.name,
         avg_difficulty: instructor.avg_difficulty,
         avg_rating: instructor.avg_rating,
         num_ratings: instructor.num_ratings
      })
      .from(section)
      .leftJoin(
         instructor_sections,
         eq(instructor_sections.section_id, section.id)
      )
      .leftJoin(
         instructor,
         eq(instructor.id, instructor_sections.instructor_id)
      )
      .where(eq(section.course_id, courseId));

   return rows.map(row => ({
      term: String(row.term),
      crn: String(row.crn),
      instructor: row.instructor_id
         ? {
              id: row.instructor_id,
              name: row.instructor_name!,
              avg_difficulty: row.avg_difficulty
                 ? Number.parseFloat(row.avg_difficulty)
                 : null,
              avg_rating: row.avg_rating
                 ? Number.parseFloat(row.avg_rating)
                 : null,
              num_ratings: row.num_ratings
           }
         : null
   }));
}

export async function fetchProfessor(professorId: string | number) {
   const db = getDb();
   const id = Number(professorId);
   // View columns are typed via sql<> aliases; compare with sql to avoid Aliased/eq mismatch.
   const [row] = await db
      .select()
      .from(meiliProfessorsIdx)
      .where(sql`${meiliProfessorsIdx.id} = ${id}`)
      .limit(1);
   if (!row) throw new Error(`Professor not found: ${professorId}`);
   return row;
}

export async function fetchProfessorSections(professorId: string | number) {
   const db = getDb();
   const id = Number(professorId);
   return await db
      .select({
         instructor_id: instructorSectionsMView.instructor_id,
         instructor_name: instructorSectionsMView.instructor_name,
         section_crn: instructorSectionsMView.section_crn,
         term_id: instructorSectionsMView.term_id,
         subject_code: instructorSectionsMView.subject_code,
         course_number: instructorSectionsMView.course_number,
         course_title: instructorSectionsMView.course_title,
         section_code: instructorSectionsMView.section_code,
         instruction_method: instructorSectionsMView.instruction_method,
         instruction_type: instructorSectionsMView.instruction_type,
         course_id: course.id
      })
      .from(instructorSectionsMView)
      .innerJoin(
         course,
         and(
            eq(course.subject_id, instructorSectionsMView.subject_code),
            eq(course.course_number, instructorSectionsMView.course_number)
         )
      )
      .where(sql`${instructorSectionsMView.instructor_id} = ${id}`)
      .orderBy(desc(instructorSectionsMView.term_id));
}

export async function fetchCompany(companyId: string) {
   const db = getDb();
   const [companyRow] = await db
      .select()
      .from(companyDetailMView)
      .where(eq(companyDetailMView.company_id, companyId))
      .limit(1);
   if (!companyRow) throw new Error(`Company not found: ${companyId}`);

   const positions = await db
      .select()
      .from(companyPositionsMView)
      .where(eq(companyPositionsMView.company_id, companyId))
      .orderBy(sql`${companyPositionsMView.omega_score} DESC NULLS LAST`);

   return { company: companyRow, positions };
}

type ReviewSort = 'year_desc' | 'rating_desc' | 'rating_asc';

export async function fetchCompanyReviews(
   companyId: string,
   opts: { sort?: ReviewSort; pageIndex?: number; pageSize?: number } = {}
) {
   const db = getDb();
   const sort = opts.sort ?? 'year_desc';
   const pageIndex = opts.pageIndex ?? 1;
   const pageSize = Math.min(opts.pageSize ?? 10, 50);

   const positionIds = await db
      .select({ id: position.id })
      .from(position)
      .where(eq(position.company_id, companyId));

   const ids = positionIds.map(p => p.id);
   if (ids.length === 0) {
      return { pageIndex, pageSize, count: 0, data: [] };
   }

   const order =
      sort === 'rating_desc'
         ? sql`${position_review.rating_overall} DESC NULLS LAST, ${position_review.year} DESC`
         : sort === 'rating_asc'
           ? sql`${position_review.rating_overall} ASC NULLS LAST, ${position_review.year} DESC`
           : sql`${position_review.year} DESC, ${position_review.coop_cycle} ASC`;

   const [total] = await db
      .select({ count: count() })
      .from(position_review)
      .where(inArray(position_review.position_id, ids));

   const data = await db
      .select({
         id: position_review.id,
         position_id: position_review.position_id,
         position_name: position.name,
         year: position_review.year,
         coop_cycle: position_review.coop_cycle,
         department: position_review.department,
         days_per_week: position_review.days_per_week,
         overtime_required: position_review.overtime_required,
         public_transit_available: position_review.public_transit_available,
         would_recommend: position_review.would_recommend,
         description_accurate: position_review.description_accurate,
         rating_overall: position_review.rating_overall,
         rating_collaboration: position_review.rating_collaboration,
         rating_work_variety: position_review.rating_work_variety,
         rating_relationships: position_review.rating_relationships,
         rating_supervisor_access: position_review.rating_supervisor_access,
         rating_training: position_review.rating_training,
         best_features: position_review.best_features,
         challenges: position_review.challenges
      })
      .from(position_review)
      .innerJoin(position, eq(position_review.position_id, position.id))
      .where(inArray(position_review.position_id, ids))
      .orderBy(order)
      .offset((pageIndex - 1) * pageSize)
      .limit(pageSize);

   return { pageIndex, pageSize, count: total?.count ?? 0, data };
}

export async function fetchPositionReviews(
   companyId: string,
   positionId: string,
   opts: { sort?: ReviewSort; pageIndex?: number; pageSize?: number } = {}
) {
   const db = getDb();
   const sort = opts.sort ?? 'year_desc';
   const pageIndex = opts.pageIndex ?? 1;
   const pageSize = Math.min(opts.pageSize ?? 10, 50);

   const [pos] = await db
      .select({ id: position.id })
      .from(position)
      .where(
         and(eq(position.id, positionId), eq(position.company_id, companyId))
      )
      .limit(1);

   if (!pos) throw new Error(`Position not found: ${positionId}`);

   const order =
      sort === 'rating_desc'
         ? sql`${position_review.rating_overall} DESC NULLS LAST, ${position_review.year} DESC`
         : sort === 'rating_asc'
           ? sql`${position_review.rating_overall} ASC NULLS LAST, ${position_review.year} DESC`
           : sql`${position_review.year} DESC, ${position_review.coop_cycle} ASC`;

   const [total] = await db
      .select({ count: count() })
      .from(position_review)
      .where(eq(position_review.position_id, positionId));

   const data = await db
      .select({
         id: position_review.id,
         position_id: position_review.position_id,
         position_name: position.name,
         year: position_review.year,
         coop_cycle: position_review.coop_cycle,
         department: position_review.department,
         days_per_week: position_review.days_per_week,
         overtime_required: position_review.overtime_required,
         public_transit_available: position_review.public_transit_available,
         would_recommend: position_review.would_recommend,
         description_accurate: position_review.description_accurate,
         rating_overall: position_review.rating_overall,
         rating_collaboration: position_review.rating_collaboration,
         rating_work_variety: position_review.rating_work_variety,
         rating_relationships: position_review.rating_relationships,
         rating_supervisor_access: position_review.rating_supervisor_access,
         rating_training: position_review.rating_training,
         best_features: position_review.best_features,
         challenges: position_review.challenges
      })
      .from(position_review)
      .innerJoin(position, eq(position_review.position_id, position.id))
      .where(eq(position_review.position_id, positionId))
      .orderBy(order)
      .offset((pageIndex - 1) * pageSize)
      .limit(pageSize);

   return { pageIndex, pageSize, count: total?.count ?? 0, data };
}

const AUTOCOMPLETE_LIMIT = 25;

/** Match apps/server fuzzy autocomplete (FTS + trigram + ILIKE). */
const fuzzyMatch = (column: Column, matchValue: string): SQL => {
   const q = matchValue.trim();
   const ilike = `${q.toLowerCase().split('').join('%')}%`;
   return sql`(
      to_tsvector('english', ${column}) @@ plainto_tsquery('english', ${q})
      OR ${column} % ${q}
      OR ${column} ILIKE ${ilike}
   )`;
};

export async function autocompleteCompany(comp: string) {
   const db = getDb();
   const q = comp.trim();
   return await db
      .select({
         id: company.id,
         name: company.name,
         company_id: company.id
      })
      .from(company)
      .where(fuzzyMatch(company.name, q))
      .orderBy(sql`similarity(${company.name}, ${q}) DESC`)
      .limit(AUTOCOMPLETE_LIMIT);
}

export async function autocompletePosition(comp: string, pos: string) {
   const db = getDb();
   const posQ = pos.trim();
   const filters = [
      comp !== '*' ? eq(company.name, comp.trim()) : undefined,
      fuzzyMatch(position.name, posQ)
   ].filter(Boolean);

   const rows = await db
      .select({
         id: position.id,
         name: position.name,
         position_id: position.id,
         company_id: company.id,
         company_name: company.name
      })
      .from(position)
      .innerJoin(company, eq(position.company_id, company.id))
      .where(and(...filters))
      .orderBy(sql`similarity(${position.name}, ${posQ}) DESC`)
      .limit(AUTOCOMPLETE_LIMIT);

   const seen = new Set<string>();
   return rows.filter(item => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
   });
}

export async function autocompleteLocation(loc: string) {
   const db = getDb();
   const q = loc.trim();
   const rows = await db
      .select()
      .from(location)
      .where(
         or(
            fuzzyMatch(location.city, q),
            fuzzyMatch(location.state, q),
            fuzzyMatch(location.state_code, q)
         )
      )
      .orderBy(
         sql`GREATEST(
            similarity(${location.city}, ${q}),
            similarity(${location.state}, ${q}),
            similarity(${location.state_code}, ${q})
         ) DESC`
      )
      .limit(AUTOCOMPLETE_LIMIT);

   return rows.map(item => ({
      id: item.id,
      name: `${item.city}, ${item.state_code}`
   }));
}

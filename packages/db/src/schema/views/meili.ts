import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { sql, eq } from 'drizzle-orm';
import {
   instructor,
   instructor_sections,
   section,
   section_days,
   course,
   subject,
   college,
   term,
   company,
   position,
   position_review,
   submission
} from '../tables';

// ============================================================================
// meili_companies_idx
// Regular view — queried only during Meilisearch sync, not on live traffic.
// Replaces companyOmegaMView for seeding purposes.
// ============================================================================

const omegaScore = sql<number>`round((
   0.30 * (
      (avg(${position_review.rating_collaboration}) + avg(${position_review.rating_work_variety}) +
       avg(${position_review.rating_relationships}) + avg(${position_review.rating_supervisor_access}) +
       avg(${position_review.rating_training})) / 5.0 / 4.0
   ) +
   0.25 * (
      count(*) filter (where ${position_review.would_recommend} = true)::numeric
      / nullif(count(*) filter (where ${position_review.would_recommend} is not null), 0)
   ) +
   0.15 * (
      count(*) filter (where ${position_review.description_accurate} = true)::numeric
      / nullif(count(*) filter (where ${position_review.description_accurate} is not null), 0)
   ) +
   0.20 * (
      (avg(${position_review.comp_written_comm}) + avg(${position_review.comp_verbal_comm}) +
       avg(${position_review.comp_comm_style}) + avg(${position_review.comp_original_ideas}) +
       avg(${position_review.comp_problem_solving}) + avg(${position_review.comp_info_evaluation}) +
       avg(${position_review.comp_data_decisions}) + avg(${position_review.comp_ethical_standards}) +
       avg(${position_review.comp_technology_use}) + avg(${position_review.comp_goal_setting}) +
       avg(${position_review.comp_diversity}) + avg(${position_review.comp_work_habits}) +
       avg(${position_review.comp_proactive})) / 13.0 / 4.0
   ) +
   0.10 * (
      1.0 - (
         0.5 * count(*) filter (where ${position_review.overtime_required} = true)::numeric
             / nullif(count(*) filter (where ${position_review.overtime_required} is not null), 0)
         +
         0.5 * least(greatest(avg(${position_review.days_per_week}) - 3, 0), 2) / 2.0
      )
   )
) * 100, 1)`.as('omega_score');

export const meiliCompaniesIdx = pgMaterializedView('meili_companies_m_idx').as(
   qb =>
      qb
         .select({
            company_id: sql<string>`${company.id}`.as('company_id'),
            company_name: sql<string>`${company.name}`.as('company_name'),
            positions: sql<string[]>`array_agg(distinct ${position.name})`.as(
               'positions'
            ),
            total_reviews:
               sql<number>`count(distinct ${position_review.id})`.as(
                  'total_reviews'
               ),
            positions_reviewed:
               sql<number>`count(distinct ${position.id}) filter (where ${position_review.id} is not null)`.as(
                  'positions_reviewed'
               ),
            total_submissions: sql<number>`count(distinct ${submission.id})`.as(
               'total_submissions'
            ),
            avg_compensation:
               sql<number>`round(avg(${submission.compensation})::numeric, 2)`.as(
                  'avg_compensation'
               ),
            median_compensation:
               sql<number>`round(percentile_cont(0.5) within group (order by ${submission.compensation})::numeric, 2)`.as(
                  'median_compensation'
               ),
            omega_score: omegaScore,
            satisfaction_score: sql<number>`round(
            (avg(${position_review.rating_collaboration}) + avg(${position_review.rating_work_variety}) +
             avg(${position_review.rating_relationships}) + avg(${position_review.rating_supervisor_access}) +
             avg(${position_review.rating_training})) / 5.0 / 4.0 * 100, 1)`.as(
               'satisfaction_score'
            ),
            trust_score: sql<number>`round(
            count(*) filter (where ${position_review.would_recommend} = true)::numeric
            / nullif(count(*) filter (where ${position_review.would_recommend} is not null), 0) * 100, 1)`.as(
               'trust_score'
            ),
            integrity_score: sql<number>`round(
            count(*) filter (where ${position_review.description_accurate} = true)::numeric
            / nullif(count(*) filter (where ${position_review.description_accurate} is not null), 0) * 100, 1)`.as(
               'integrity_score'
            ),
            growth_score: sql<number>`round(
            (avg(${position_review.comp_written_comm}) + avg(${position_review.comp_verbal_comm}) +
             avg(${position_review.comp_comm_style}) + avg(${position_review.comp_original_ideas}) +
             avg(${position_review.comp_problem_solving}) + avg(${position_review.comp_info_evaluation}) +
             avg(${position_review.comp_data_decisions}) + avg(${position_review.comp_ethical_standards}) +
             avg(${position_review.comp_technology_use}) + avg(${position_review.comp_goal_setting}) +
             avg(${position_review.comp_diversity}) + avg(${position_review.comp_work_habits}) +
             avg(${position_review.comp_proactive})) / 13.0 / 4.0 * 100, 1)`.as(
               'growth_score'
            ),
            work_life_score: sql<number>`round((
            1.0 - (
               0.5 * count(*) filter (where ${position_review.overtime_required} = true)::numeric
                   / nullif(count(*) filter (where ${position_review.overtime_required} is not null), 0)
               +
               0.5 * least(greatest(avg(${position_review.days_per_week}) - 3, 0), 2) / 2.0
            )
         ) * 100, 1)`.as('work_life_score'),
            avg_rating_overall:
               sql<number>`round(avg(${position_review.rating_overall})::numeric, 2)`.as(
                  'avg_rating_overall'
               ),
            pct_would_recommend: sql<number>`round(
            100.0 * count(*) filter (where ${position_review.would_recommend} = true)
            / nullif(count(*) filter (where ${position_review.would_recommend} is not null), 0), 1)`.as(
               'pct_would_recommend'
            ),
            pct_description_accurate: sql<number>`round(
            100.0 * count(*) filter (where ${position_review.description_accurate} = true)
            / nullif(count(*) filter (where ${position_review.description_accurate} is not null), 0), 1)`.as(
               'pct_description_accurate'
            ),
            avg_days_per_week:
               sql<number>`round(avg(${position_review.days_per_week})::numeric, 1)`.as(
                  'avg_days_per_week'
               ),
            pct_overtime_required: sql<number>`round(
            100.0 * count(*) filter (where ${position_review.overtime_required} = true)
            / nullif(count(*) filter (where ${position_review.overtime_required} is not null), 0), 1)`.as(
               'pct_overtime_required'
            ),
            first_review_year: sql<number>`min(${position_review.year})`.as(
               'first_review_year'
            ),
            last_review_year: sql<number>`max(${position_review.year})`.as(
               'last_review_year'
            )
         })
         .from(company)
         .innerJoin(position, eq(position.company_id, company.id))
         .leftJoin(
            position_review,
            eq(position_review.position_id, position.id)
         )
         .leftJoin(submission, eq(submission.position_id, position.id))
         .groupBy(company.id, company.name)
);

// ============================================================================
// meili_professors_idx
// Regular view — queried only during Meilisearch sync.
// Replaces instructorProfileMView (also used for getProfessor detail lookup).
// ============================================================================

export const meiliProfessorsIdx = pgMaterializedView(
   'meili_professors_m_idx'
).as(qb =>
   qb
      .select({
         id: sql<number>`${instructor.id}`.as('id'),
         name: sql<string>`${instructor.name}`.as('name'),
         department: sql<string | null>`${instructor.department}`.as(
            'department'
         ),
         avg_rating: sql<number | null>`${instructor.avg_rating}`.as(
            'avg_rating'
         ),
         avg_difficulty: sql<number | null>`${instructor.avg_difficulty}`.as(
            'avg_difficulty'
         ),
         num_ratings: sql<number | null>`${instructor.num_ratings}`.as(
            'num_ratings'
         ),
         rmp_id: sql<string | null>`${instructor.rmp_id}`.as('rmp_id'),
         rmp_legacy_id: sql<number | null>`${instructor.rmp_legacy_id}`.as(
            'rmp_legacy_id'
         ),
         weighted_score:
            sql<number>`${instructor.num_ratings} * ${instructor.avg_rating}`.as(
               'weighted_score'
            ),
         total_sections_taught: sql<number>`count(distinct ${section.crn})`.as(
            'total_sections_taught'
         ),
         total_courses_taught: sql<number>`count(distinct ${course.id})`.as(
            'total_courses_taught'
         ),
         total_terms_active: sql<number>`count(distinct ${section.term_id})`.as(
            'total_terms_active'
         ),
         most_recent_term: sql<number>`max(${section.term_id})`.as(
            'most_recent_term'
         ),
         subjects_taught: sql<string[]>`array_agg(distinct ${subject.id})`.as(
            'subjects_taught'
         ),
         instruction_methods: sql<
            string[]
         >`array_agg(distinct ${section.instruction_method})`.as(
            'instruction_methods'
         ),
         courses_taught: sql<{ code: string; title: string }[]>`coalesce(
            json_agg(distinct jsonb_build_object(
               'code', ${subject.id} || ' ' || ${section.course_number},
               'title', ${course.title}
            )) filter (where ${course.id} is not null),
            '[]'
         )`.as('courses_taught')
      })
      .from(instructor)
      .leftJoin(
         instructor_sections,
         eq(instructor_sections.instructor_id, instructor.id)
      )
      .leftJoin(section, eq(section.crn, instructor_sections.section_crn))
      .leftJoin(course, eq(course.id, section.course_id))
      .leftJoin(subject, eq(subject.id, section.subject_code))
      .groupBy(
         instructor.id,
         instructor.name,
         instructor.department,
         instructor.avg_rating,
         instructor.avg_difficulty,
         instructor.num_ratings,
         instructor.rmp_id,
         instructor.rmp_legacy_id
      )
);

// ============================================================================
// meili_sections_idx
// Regular view — queried only during Meilisearch sync.
// Produces the complete section document shape for the sections Meilisearch index.
// ============================================================================

export const meiliSectionsIdx = pgMaterializedView('meili_sections_m_idx').as(
   qb =>
      qb
         .select({
            crn: sql<number>`${section.crn}`.as('crn'),
            section: sql<string>`${section.section}`.as('section'),
            course_number: sql<string>`${section.course_number}`.as(
               'course_number'
            ),
            instruction_type: sql<
               string | null
            >`${section.instruction_type}`.as('instruction_type'),
            instruction_method: sql<
               string | null
            >`${section.instruction_method}`.as('instruction_method'),
            credits: sql<string | null>`${course.credits}`.as('credits'),
            max_enroll: sql<number | null>`${section.max_enroll}`.as(
               'max_enroll'
            ),
            start_time: sql<string | null>`${section.start_time}`.as(
               'start_time'
            ),
            end_time: sql<string | null>`${section.end_time}`.as('end_time'),
            days: sql<string[]>`coalesce(
            array_agg(distinct ${section_days.day}::text) filter (where ${section_days.day} is not null),
            '{}'
         )`.as('days'),
            term: sql<string>`${section.term_id}::text`.as('term'),
            course:
               sql<string>`${subject.id} || ' ' || ${section.course_number}`.as(
                  'course'
               ),
            title: sql<string>`${course.title}`.as('title'),
            description: sql<string | null>`${course.description}`.as(
               'description'
            ),
            restrictions: sql<string | null>`${course.restrictions}`.as(
               'restrictions'
            ),
            repeat_status: sql<string | null>`${course.repeat_status}`.as(
               'repeat_status'
            ),
            writing_intensive: sql<boolean>`${course.writing_intensive}`.as(
               'writing_intensive'
            ),
            subject_id: sql<string>`${subject.id}`.as('subject_id'),
            subject_name: sql<string>`${subject.name}`.as('subject_name'),
            college_id: sql<string>`${college.id}`.as('college_id'),
            college_name: sql<string>`${college.name}`.as('college_name'),
            course_id: sql<string>`${course.id}`.as('course_id'),
            instructors: sql<
               {
                  id: number;
                  name: string;
                  department: string | null;
                  avg_rating: number | null;
                  avg_difficulty: number | null;
                  num_ratings: number | null;
                  rmp_id: string | null;
                  weighted_score: number | null;
               }[]
            >`coalesce(
            json_agg(
               distinct jsonb_build_object(
                  'id',             ${instructor.id},
                  'name',           ${instructor.name},
                  'department',     ${instructor.department},
                  'avg_rating',     ${instructor.avg_rating}::float,
                  'avg_difficulty', ${instructor.avg_difficulty}::float,
                  'num_ratings',    ${instructor.num_ratings},
                  'rmp_id',         ${instructor.rmp_id},
                  'weighted_score', (${instructor.num_ratings} * ${instructor.avg_rating}::float)
               )
            ) filter (where ${instructor.id} is not null),
            '[]'
         )`.as('instructors')
         })
         .from(section)
         .innerJoin(course, eq(course.id, section.course_id))
         .innerJoin(subject, eq(subject.id, section.subject_code))
         .innerJoin(college, eq(college.id, subject.college_id))
         .innerJoin(term, eq(term.id, section.term_id))
         .leftJoin(section_days, eq(section_days.section_crn, section.crn))
         .leftJoin(
            instructor_sections,
            eq(instructor_sections.section_crn, section.crn)
         )
         .leftJoin(
            instructor,
            eq(instructor.id, instructor_sections.instructor_id)
         )
         .groupBy(
            section.crn,
            section.section,
            section.course_number,
            section.instruction_type,
            section.instruction_method,
            section.max_enroll,
            section.start_time,
            section.end_time,
            section.term_id,
            course.id,
            course.title,
            course.description,
            course.credits,
            course.restrictions,
            course.repeat_status,
            course.writing_intensive,
            subject.id,
            subject.name,
            college.id,
            college.name
         )
);

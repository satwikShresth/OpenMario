/**
 * These materialized views are pending manual removal.
 *
 * Steps to clean up:
 *   1. Run: DROP MATERIALIZED VIEW company_omega_m_view;
 *   2. Run: DROP MATERIALIZED VIEW instructor_profile_m_view;
 *   3. Delete this file and remove its export from views/index.ts.
 *
 * They have been replaced by meili_companies_idx and meili_professors_idx
 * (regular views in meili.ts) which are used for Meilisearch seeding and
 * for the getProfessor detail endpoint.
 */

import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { sql, eq } from 'drizzle-orm';
import {
   company,
   position,
   position_review,
   submission,
   instructor,
   instructor_sections,
   section,
   course,
   subject
} from '../tables';

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

export const companyOmegaMView = pgMaterializedView('company_omega_m_view').as(
   qb =>
      qb
         .select({
            company_id: company.id,
            company_name: company.name,
            total_reviews: sql<number>`count(${position_review.id})`.as(
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
            omega_score: omegaScore
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

export const instructorProfileMView = pgMaterializedView(
   'instructor_profile_m_view'
).as(qb =>
   qb
      .select({
         instructor_id: sql<number>`${instructor.id}`.as('instructor_id'),
         instructor_name: sql<string>`${instructor.name}`.as('instructor_name'),
         department: instructor.department,
         avg_rating: instructor.avg_rating,
         avg_difficulty: instructor.avg_difficulty,
         num_ratings: instructor.num_ratings,
         rmp_id: instructor.rmp_id,
         legacy_rmp_id: instructor.rmp_legacy_id,
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
         )
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

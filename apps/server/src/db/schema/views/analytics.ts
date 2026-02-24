import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { sql, eq } from 'drizzle-orm';
import {
   position,
   company,
   job_posting,
   position_review,
   submission
} from '../tables';

const position_id = sql<string>`${position.id}`.as('position_id');
const position_name = sql<string>`${position.name}`.as('position_name');
const company_id = sql<string>`${company.id}`.as('company_id');
const company_name = sql<string>`${company.name}`.as('company_name');

export const positionInformationMView = pgMaterializedView(
   'position_information_m_view'
).as(qb =>
   qb
      .select({
         position_id,
         position_name,
         company_id,
         company_name,
         most_recent_posting_year: sql<number>`max(${job_posting.year})`.as(
            'most_recent_posting_year'
         ),
         total_reviews: sql<number>`count(distinct ${position_review.id})`.as(
            'total_reviews'
         ),
         avg_rating_overall:
            sql<number>`round(avg(${position_review.rating_overall})::numeric, 2)`.as(
               'avg_rating_overall'
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
            )
      })
      .from(position)
      .innerJoin(company, eq(company.id, position.company_id))
      .leftJoin(job_posting, eq(job_posting.position_id, position.id))
      .leftJoin(position_review, eq(position_review.position_id, position.id))
      .leftJoin(submission, eq(submission.position_id, position.id))
      .groupBy(position.id, position.name, company.id, company.name)
);

export const positionReviewAggregateMView = pgMaterializedView(
   'position_review_aggregate_m_view'
).as(qb =>
   qb
      .select({
         position_id,
         position_name,
         company_name,
         total_reviews: sql<number>`count(${position_review.id})`.as(
            'total_reviews'
         ),
         first_review_year: sql<number>`min(${position_review.year})`.as(
            'first_review_year'
         ),
         last_review_year: sql<number>`max(${position_review.year})`.as(
            'last_review_year'
         ),
         avg_rating_overall:
            sql<number>`round(avg(${position_review.rating_overall})::numeric, 2)`.as(
               'avg_rating_overall'
            ),
         avg_rating_collaboration:
            sql<number>`round(avg(${position_review.rating_collaboration})::numeric, 2)`.as(
               'avg_rating_collaboration'
            ),
         avg_rating_work_variety:
            sql<number>`round(avg(${position_review.rating_work_variety})::numeric, 2)`.as(
               'avg_rating_work_variety'
            ),
         avg_rating_relationships:
            sql<number>`round(avg(${position_review.rating_relationships})::numeric, 2)`.as(
               'avg_rating_relationships'
            ),
         avg_rating_supervisor_access:
            sql<number>`round(avg(${position_review.rating_supervisor_access})::numeric, 2)`.as(
               'avg_rating_supervisor_access'
            ),
         avg_rating_training:
            sql<number>`round(avg(${position_review.rating_training})::numeric, 2)`.as(
               'avg_rating_training'
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
         pct_public_transit: sql<number>`round(
            100.0 * count(*) filter (where ${position_review.public_transit_available} = true)
            / nullif(count(*) filter (where ${position_review.public_transit_available} is not null), 0), 1)`.as(
            'pct_public_transit'
         ),
         pct_overtime_required: sql<number>`round(
            100.0 * count(*) filter (where ${position_review.overtime_required} = true)
            / nullif(count(*) filter (where ${position_review.overtime_required} is not null), 0), 1)`.as(
            'pct_overtime_required'
         ),
         avg_comp_written_comm:
            sql<number>`round(avg(${position_review.comp_written_comm})::numeric, 2)`.as(
               'avg_comp_written_comm'
            ),
         avg_comp_verbal_comm:
            sql<number>`round(avg(${position_review.comp_verbal_comm})::numeric, 2)`.as(
               'avg_comp_verbal_comm'
            ),
         avg_comp_comm_style:
            sql<number>`round(avg(${position_review.comp_comm_style})::numeric, 2)`.as(
               'avg_comp_comm_style'
            ),
         avg_comp_original_ideas:
            sql<number>`round(avg(${position_review.comp_original_ideas})::numeric, 2)`.as(
               'avg_comp_original_ideas'
            ),
         avg_comp_problem_solving:
            sql<number>`round(avg(${position_review.comp_problem_solving})::numeric, 2)`.as(
               'avg_comp_problem_solving'
            ),
         avg_comp_info_evaluation:
            sql<number>`round(avg(${position_review.comp_info_evaluation})::numeric, 2)`.as(
               'avg_comp_info_evaluation'
            ),
         avg_comp_data_decisions:
            sql<number>`round(avg(${position_review.comp_data_decisions})::numeric, 2)`.as(
               'avg_comp_data_decisions'
            ),
         avg_comp_ethical_standards:
            sql<number>`round(avg(${position_review.comp_ethical_standards})::numeric, 2)`.as(
               'avg_comp_ethical_standards'
            ),
         avg_comp_technology_use:
            sql<number>`round(avg(${position_review.comp_technology_use})::numeric, 2)`.as(
               'avg_comp_technology_use'
            ),
         avg_comp_goal_setting:
            sql<number>`round(avg(${position_review.comp_goal_setting})::numeric, 2)`.as(
               'avg_comp_goal_setting'
            ),
         avg_comp_diversity:
            sql<number>`round(avg(${position_review.comp_diversity})::numeric, 2)`.as(
               'avg_comp_diversity'
            ),
         avg_comp_work_habits:
            sql<number>`round(avg(${position_review.comp_work_habits})::numeric, 2)`.as(
               'avg_comp_work_habits'
            ),
         avg_comp_proactive:
            sql<number>`round(avg(${position_review.comp_proactive})::numeric, 2)`.as(
               'avg_comp_proactive'
            )
      })
      .from(position)
      .innerJoin(company, eq(company.id, position.company_id))
      .leftJoin(position_review, eq(position_review.position_id, position.id))
      .groupBy(position.id, position.name, company.name)
);

export const companyReviewAggregateMView = pgMaterializedView(
   'company_review_aggregate_m_view'
).as(qb =>
   qb
      .select({
         company_id: company.id,
         company_name: company.name,
         positions_with_reviews:
            sql<number>`count(distinct ${position.id}) filter (where ${position_review.id} is not null)`.as(
               'positions_with_reviews'
            ),
         total_reviews: sql<number>`count(${position_review.id})`.as(
            'total_reviews'
         ),
         first_review_year: sql<number>`min(${position_review.year})`.as(
            'first_review_year'
         ),
         last_review_year: sql<number>`max(${position_review.year})`.as(
            'last_review_year'
         ),
         avg_rating_overall:
            sql<number>`round(avg(${position_review.rating_overall})::numeric, 2)`.as(
               'avg_rating_overall'
            ),
         avg_rating_collaboration:
            sql<number>`round(avg(${position_review.rating_collaboration})::numeric, 2)`.as(
               'avg_rating_collaboration'
            ),
         avg_rating_work_variety:
            sql<number>`round(avg(${position_review.rating_work_variety})::numeric, 2)`.as(
               'avg_rating_work_variety'
            ),
         avg_rating_relationships:
            sql<number>`round(avg(${position_review.rating_relationships})::numeric, 2)`.as(
               'avg_rating_relationships'
            ),
         avg_rating_supervisor_access:
            sql<number>`round(avg(${position_review.rating_supervisor_access})::numeric, 2)`.as(
               'avg_rating_supervisor_access'
            ),
         avg_rating_training:
            sql<number>`round(avg(${position_review.rating_training})::numeric, 2)`.as(
               'avg_rating_training'
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
         pct_public_transit: sql<number>`round(
               100.0 * count(*) filter (where ${position_review.public_transit_available} = true)
               / nullif(count(*) filter (where ${position_review.public_transit_available} is not null), 0), 1)`.as(
            'pct_public_transit'
         ),
         pct_overtime_required: sql<number>`round(
               100.0 * count(*) filter (where ${position_review.overtime_required} = true)
               / nullif(count(*) filter (where ${position_review.overtime_required} is not null), 0), 1)`.as(
            'pct_overtime_required'
         ),
         avg_comp_written_comm:
            sql<number>`round(avg(${position_review.comp_written_comm})::numeric, 2)`.as(
               'avg_comp_written_comm'
            ),
         avg_comp_verbal_comm:
            sql<number>`round(avg(${position_review.comp_verbal_comm})::numeric, 2)`.as(
               'avg_comp_verbal_comm'
            ),
         avg_comp_comm_style:
            sql<number>`round(avg(${position_review.comp_comm_style})::numeric, 2)`.as(
               'avg_comp_comm_style'
            ),
         avg_comp_original_ideas:
            sql<number>`round(avg(${position_review.comp_original_ideas})::numeric, 2)`.as(
               'avg_comp_original_ideas'
            ),
         avg_comp_problem_solving:
            sql<number>`round(avg(${position_review.comp_problem_solving})::numeric, 2)`.as(
               'avg_comp_problem_solving'
            ),
         avg_comp_info_evaluation:
            sql<number>`round(avg(${position_review.comp_info_evaluation})::numeric, 2)`.as(
               'avg_comp_info_evaluation'
            ),
         avg_comp_data_decisions:
            sql<number>`round(avg(${position_review.comp_data_decisions})::numeric, 2)`.as(
               'avg_comp_data_decisions'
            ),
         avg_comp_ethical_standards:
            sql<number>`round(avg(${position_review.comp_ethical_standards})::numeric, 2)`.as(
               'avg_comp_ethical_standards'
            ),
         avg_comp_technology_use:
            sql<number>`round(avg(${position_review.comp_technology_use})::numeric, 2)`.as(
               'avg_comp_technology_use'
            ),
         avg_comp_goal_setting:
            sql<number>`round(avg(${position_review.comp_goal_setting})::numeric, 2)`.as(
               'avg_comp_goal_setting'
            ),
         avg_comp_diversity:
            sql<number>`round(avg(${position_review.comp_diversity})::numeric, 2)`.as(
               'avg_comp_diversity'
            ),
         avg_comp_work_habits:
            sql<number>`round(avg(${position_review.comp_work_habits})::numeric, 2)`.as(
               'avg_comp_work_habits'
            ),
         avg_comp_proactive:
            sql<number>`round(avg(${position_review.comp_proactive})::numeric, 2)`.as(
               'avg_comp_proactive'
            ),
         avg_compensation:
            sql<number>`round(avg(${submission.compensation})::numeric, 2)`.as(
               'avg_compensation'
            ),
         median_compensation:
            sql<number>`round(percentile_cont(0.5) within group (order by ${submission.compensation})::numeric, 2)`.as(
               'median_compensation'
            )
      })
      .from(company)
      .innerJoin(position, eq(position.company_id, company.id))
      .leftJoin(position_review, eq(position_review.position_id, position.id))
      .leftJoin(submission, eq(submission.position_id, position.id))
      .groupBy(company.id, company.name)
);

// Omega components (all normalized to 0-1):
//   satisfaction  = avg of 5 sub-ratings / 4
//   trust         = pct_would_recommend / 100
//   integrity     = pct_description_accurate / 100
//   growth        = avg of 13 comp fields / 4
//   work_life     = 1 - (pct_overtime * 0.5 + clamp(avg_days_per_week - 3, 0, 2) / 4 * 0.5)
//
// Default weights: satisfaction 30, trust 25, integrity 15, growth 20, work_life 10

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

const satisfactionScore = sql<number>`round(
      (avg(${position_review.rating_collaboration}) + avg(${position_review.rating_work_variety}) +
       avg(${position_review.rating_relationships}) + avg(${position_review.rating_supervisor_access}) +
       avg(${position_review.rating_training})) / 5.0 / 4.0 * 100, 1)`.as(
   'satisfaction_score'
);

const trustScore = sql<number>`round(
      count(*) filter (where ${position_review.would_recommend} = true)::numeric
      / nullif(count(*) filter (where ${position_review.would_recommend} is not null), 0) * 100, 1)`.as(
   'trust_score'
);

const integrityScore = sql<number>`round(
      count(*) filter (where ${position_review.description_accurate} = true)::numeric
      / nullif(count(*) filter (where ${position_review.description_accurate} is not null), 0) * 100, 1)`.as(
   'integrity_score'
);

const growthScore = sql<number>`round(
      (avg(${position_review.comp_written_comm}) + avg(${position_review.comp_verbal_comm}) +
       avg(${position_review.comp_comm_style}) + avg(${position_review.comp_original_ideas}) +
       avg(${position_review.comp_problem_solving}) + avg(${position_review.comp_info_evaluation}) +
       avg(${position_review.comp_data_decisions}) + avg(${position_review.comp_ethical_standards}) +
       avg(${position_review.comp_technology_use}) + avg(${position_review.comp_goal_setting}) +
       avg(${position_review.comp_diversity}) + avg(${position_review.comp_work_habits}) +
       avg(${position_review.comp_proactive})) / 13.0 / 4.0 * 100, 1)`.as(
   'growth_score'
);

const workLifeScore = sql<number>`round((
      1.0 - (
         0.5 * count(*) filter (where ${position_review.overtime_required} = true)::numeric
             / nullif(count(*) filter (where ${position_review.overtime_required} is not null), 0)
         +
         0.5 * least(greatest(avg(${position_review.days_per_week}) - 3, 0), 2) / 2.0
      )
   ) * 100, 1)`.as('work_life_score');

export const companyDetailMView = pgMaterializedView(
   'company_detail_m_view'
).as(qb =>
   qb
      .select({
         company_id: company.id,
         company_name: company.name,
         total_reviews: sql<number>`count(distinct ${position_review.id})`.as(
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
         satisfaction_score: satisfactionScore,
         trust_score: trustScore,
         integrity_score: integrityScore,
         growth_score: growthScore,
         work_life_score: workLifeScore,
         avg_rating_overall:
            sql<number>`round(avg(${position_review.rating_overall})::numeric, 2)`.as(
               'avg_rating_overall'
            ),
         avg_rating_collaboration:
            sql<number>`round(avg(${position_review.rating_collaboration})::numeric, 2)`.as(
               'avg_rating_collaboration'
            ),
         avg_rating_work_variety:
            sql<number>`round(avg(${position_review.rating_work_variety})::numeric, 2)`.as(
               'avg_rating_work_variety'
            ),
         avg_rating_relationships:
            sql<number>`round(avg(${position_review.rating_relationships})::numeric, 2)`.as(
               'avg_rating_relationships'
            ),
         avg_rating_supervisor_access:
            sql<number>`round(avg(${position_review.rating_supervisor_access})::numeric, 2)`.as(
               'avg_rating_supervisor_access'
            ),
         avg_rating_training:
            sql<number>`round(avg(${position_review.rating_training})::numeric, 2)`.as(
               'avg_rating_training'
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
         pct_public_transit: sql<number>`round(
            100.0 * count(*) filter (where ${position_review.public_transit_available} = true)
            / nullif(count(*) filter (where ${position_review.public_transit_available} is not null), 0), 1)`.as(
            'pct_public_transit'
         ),
         pct_overtime_required: sql<number>`round(
            100.0 * count(*) filter (where ${position_review.overtime_required} = true)
            / nullif(count(*) filter (where ${position_review.overtime_required} is not null), 0), 1)`.as(
            'pct_overtime_required'
         )
      })
      .from(company)
      .innerJoin(position, eq(position.company_id, company.id))
      .leftJoin(position_review, eq(position_review.position_id, position.id))
      .leftJoin(submission, eq(submission.position_id, position.id))
      .groupBy(company.id, company.name)
);

export const companyPositionsMView = pgMaterializedView(
   'company_positions_m_view'
).as(qb =>
   qb
      .select({
         position_id,
         position_name,
         company_id,
         company_name,
         total_reviews: sql<number>`count(distinct ${position_review.id})`.as(
            'total_reviews'
         ),
         total_submissions: sql<number>`count(distinct ${submission.id})`.as(
            'total_submissions'
         ),
         most_recent_posting_year: sql<number>`max(${job_posting.year})`.as(
            'most_recent_posting_year'
         ),
         avg_rating_overall:
            sql<number>`round(avg(${position_review.rating_overall})::numeric, 2)`.as(
               'avg_rating_overall'
            ),
         avg_rating_collaboration:
            sql<number>`round(avg(${position_review.rating_collaboration})::numeric, 2)`.as(
               'avg_rating_collaboration'
            ),
         avg_rating_work_variety:
            sql<number>`round(avg(${position_review.rating_work_variety})::numeric, 2)`.as(
               'avg_rating_work_variety'
            ),
         avg_rating_relationships:
            sql<number>`round(avg(${position_review.rating_relationships})::numeric, 2)`.as(
               'avg_rating_relationships'
            ),
         avg_rating_supervisor_access:
            sql<number>`round(avg(${position_review.rating_supervisor_access})::numeric, 2)`.as(
               'avg_rating_supervisor_access'
            ),
         avg_rating_training:
            sql<number>`round(avg(${position_review.rating_training})::numeric, 2)`.as(
               'avg_rating_training'
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
         satisfaction_score: satisfactionScore,
         trust_score: trustScore,
         integrity_score: integrityScore,
         growth_score: growthScore,
         work_life_score: workLifeScore
      })
      .from(position)
      .innerJoin(company, eq(company.id, position.company_id))
      .leftJoin(job_posting, eq(job_posting.position_id, position.id))
      .leftJoin(position_review, eq(position_review.position_id, position.id))
      .leftJoin(submission, eq(submission.position_id, position.id))
      .groupBy(position.id, position.name, company.id, company.name)
);

export const positionOmegaMView = pgMaterializedView(
   'position_omega_m_view'
).as(qb =>
   qb
      .select({
         position_id,
         position_name,
         company_id,
         company_name,
         total_reviews: sql<number>`count(${position_review.id})`.as(
            'total_reviews'
         ),
         omega_score: omegaScore,
         satisfaction_score: satisfactionScore,
         trust_score: trustScore,
         integrity_score: integrityScore,
         growth_score: growthScore,
         work_life_score: workLifeScore
      })
      .from(position)
      .innerJoin(company, eq(company.id, position.company_id))
      .leftJoin(position_review, eq(position_review.position_id, position.id))
      .groupBy(position.id, position.name, company.id, company.name)
);

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
            omega_score: omegaScore,
            satisfaction_score: satisfactionScore,
            trust_score: trustScore,
            integrity_score: integrityScore,
            growth_score: growthScore,
            work_life_score: workLifeScore
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

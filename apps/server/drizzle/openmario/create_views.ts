import { db } from '../../src/db/index';
import { sql } from 'drizzle-orm';

async function createViews() {
   console.log('Dropping old regular views if they exist...');
   await db.execute(sql`DROP VIEW IF EXISTS position_information CASCADE`);
   await db.execute(sql`DROP VIEW IF EXISTS position_review_aggregate CASCADE`);
   await db.execute(sql`DROP VIEW IF EXISTS company_review_aggregate CASCADE`);

   console.log('Creating analytics materialized views...');

   await db.execute(sql`DROP MATERIALIZED VIEW IF EXISTS position_information_m_view CASCADE`);
   await db.execute(sql`
    CREATE MATERIALIZED VIEW position_information_m_view AS
    SELECT
      p.id                                                          AS position_id,
      p.name                                                        AS position_name,
      c.id                                                          AS company_id,
      c.name                                                        AS company_name,
      COUNT(DISTINCT jp.id)                                         AS total_postings,
      COUNT(DISTINCT jp.id) FILTER (WHERE jp.job_status = 'Active') AS active_postings,
      MAX(jp.year)                                                  AS most_recent_posting_year,
      COUNT(DISTINCT pr.id)                                         AS total_reviews,
      ROUND(AVG(pr.rating_overall)::numeric, 2)                    AS avg_rating_overall,
      COUNT(DISTINCT s.id)                                          AS total_submissions,
      ROUND(AVG(s.compensation)::numeric, 2)                       AS avg_compensation
    FROM position p
    JOIN company c ON p.company_id = c.id
    LEFT JOIN job_posting jp ON jp.position_id = p.id
    LEFT JOIN position_review pr ON pr.position_id = p.id
    LEFT JOIN submission s ON s.position_id = p.id
    GROUP BY p.id, p.name, c.id, c.name
  `);
   console.log('✓ position_information_m_view');

   await db.execute(sql`DROP MATERIALIZED VIEW IF EXISTS position_review_aggregate_m_view CASCADE`);
   await db.execute(sql`
    CREATE MATERIALIZED VIEW position_review_aggregate_m_view AS
    SELECT
      p.id                                                                              AS position_id,
      p.name                                                                            AS position_name,
      c.name                                                                            AS company_name,
      COUNT(pr.id)                                                                      AS total_reviews,
      MIN(pr.year)                                                                      AS first_review_year,
      MAX(pr.year)                                                                      AS last_review_year,
      ROUND(AVG(pr.rating_overall)::numeric, 2)                                        AS avg_rating_overall,
      ROUND(AVG(pr.rating_collaboration)::numeric, 2)                                  AS avg_rating_collaboration,
      ROUND(AVG(pr.rating_work_variety)::numeric, 2)                                   AS avg_rating_work_variety,
      ROUND(AVG(pr.rating_relationships)::numeric, 2)                                  AS avg_rating_relationships,
      ROUND(AVG(pr.rating_supervisor_access)::numeric, 2)                              AS avg_rating_supervisor_access,
      ROUND(AVG(pr.rating_training)::numeric, 2)                                       AS avg_rating_training,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE pr.would_recommend = true)
          / NULLIF(COUNT(*) FILTER (WHERE pr.would_recommend IS NOT NULL), 0),
        1
      )                                                                                 AS pct_would_recommend,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE pr.description_accurate = true)
          / NULLIF(COUNT(*) FILTER (WHERE pr.description_accurate IS NOT NULL), 0),
        1
      )                                                                                 AS pct_description_accurate,
      ROUND(AVG(pr.days_per_week)::numeric, 1)                                         AS avg_days_per_week,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE pr.public_transit_available = true)
          / NULLIF(COUNT(*) FILTER (WHERE pr.public_transit_available IS NOT NULL), 0),
        1
      )                                                                                 AS pct_public_transit,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE pr.overtime_required = true)
          / NULLIF(COUNT(*) FILTER (WHERE pr.overtime_required IS NOT NULL), 0),
        1
      )                                                                                 AS pct_overtime_required,
      ROUND(AVG(pr.comp_written_comm)::numeric, 2)                                     AS avg_comp_written_comm,
      ROUND(AVG(pr.comp_verbal_comm)::numeric, 2)                                      AS avg_comp_verbal_comm,
      ROUND(AVG(pr.comp_comm_style)::numeric, 2)                                       AS avg_comp_comm_style,
      ROUND(AVG(pr.comp_original_ideas)::numeric, 2)                                   AS avg_comp_original_ideas,
      ROUND(AVG(pr.comp_problem_solving)::numeric, 2)                                  AS avg_comp_problem_solving,
      ROUND(AVG(pr.comp_info_evaluation)::numeric, 2)                                  AS avg_comp_info_evaluation,
      ROUND(AVG(pr.comp_data_decisions)::numeric, 2)                                   AS avg_comp_data_decisions,
      ROUND(AVG(pr.comp_ethical_standards)::numeric, 2)                                AS avg_comp_ethical_standards,
      ROUND(AVG(pr.comp_technology_use)::numeric, 2)                                   AS avg_comp_technology_use,
      ROUND(AVG(pr.comp_goal_setting)::numeric, 2)                                     AS avg_comp_goal_setting,
      ROUND(AVG(pr.comp_diversity)::numeric, 2)                                        AS avg_comp_diversity,
      ROUND(AVG(pr.comp_work_habits)::numeric, 2)                                      AS avg_comp_work_habits,
      ROUND(AVG(pr.comp_proactive)::numeric, 2)                                        AS avg_comp_proactive
    FROM position p
    JOIN company c ON p.company_id = c.id
    LEFT JOIN position_review pr ON pr.position_id = p.id
    GROUP BY p.id, p.name, c.name
  `);
   console.log('✓ position_review_aggregate_m_view');

   await db.execute(sql`DROP MATERIALIZED VIEW IF EXISTS company_review_aggregate_m_view CASCADE`);
   await db.execute(sql`
    CREATE MATERIALIZED VIEW company_review_aggregate_m_view AS
    SELECT
      c.id                                                                              AS company_id,
      c.name                                                                            AS company_name,
      COUNT(DISTINCT p.id) FILTER (WHERE pr.id IS NOT NULL)                            AS positions_with_reviews,
      COUNT(pr.id)                                                                      AS total_reviews,
      MIN(pr.year)                                                                      AS first_review_year,
      MAX(pr.year)                                                                      AS last_review_year,
      ROUND(AVG(pr.rating_overall)::numeric, 2)                                        AS avg_rating_overall,
      ROUND(AVG(pr.rating_collaboration)::numeric, 2)                                  AS avg_rating_collaboration,
      ROUND(AVG(pr.rating_work_variety)::numeric, 2)                                   AS avg_rating_work_variety,
      ROUND(AVG(pr.rating_relationships)::numeric, 2)                                  AS avg_rating_relationships,
      ROUND(AVG(pr.rating_supervisor_access)::numeric, 2)                              AS avg_rating_supervisor_access,
      ROUND(AVG(pr.rating_training)::numeric, 2)                                       AS avg_rating_training,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE pr.would_recommend = true)
          / NULLIF(COUNT(*) FILTER (WHERE pr.would_recommend IS NOT NULL), 0),
        1
      )                                                                                 AS pct_would_recommend,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE pr.description_accurate = true)
          / NULLIF(COUNT(*) FILTER (WHERE pr.description_accurate IS NOT NULL), 0),
        1
      )                                                                                 AS pct_description_accurate,
      ROUND(AVG(pr.days_per_week)::numeric, 1)                                         AS avg_days_per_week,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE pr.public_transit_available = true)
          / NULLIF(COUNT(*) FILTER (WHERE pr.public_transit_available IS NOT NULL), 0),
        1
      )                                                                                 AS pct_public_transit,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE pr.overtime_required = true)
          / NULLIF(COUNT(*) FILTER (WHERE pr.overtime_required IS NOT NULL), 0),
        1
      )                                                                                 AS pct_overtime_required,
      ROUND(AVG(pr.comp_written_comm)::numeric, 2)                                     AS avg_comp_written_comm,
      ROUND(AVG(pr.comp_verbal_comm)::numeric, 2)                                      AS avg_comp_verbal_comm,
      ROUND(AVG(pr.comp_comm_style)::numeric, 2)                                       AS avg_comp_comm_style,
      ROUND(AVG(pr.comp_original_ideas)::numeric, 2)                                   AS avg_comp_original_ideas,
      ROUND(AVG(pr.comp_problem_solving)::numeric, 2)                                  AS avg_comp_problem_solving,
      ROUND(AVG(pr.comp_info_evaluation)::numeric, 2)                                  AS avg_comp_info_evaluation,
      ROUND(AVG(pr.comp_data_decisions)::numeric, 2)                                   AS avg_comp_data_decisions,
      ROUND(AVG(pr.comp_ethical_standards)::numeric, 2)                                AS avg_comp_ethical_standards,
      ROUND(AVG(pr.comp_technology_use)::numeric, 2)                                   AS avg_comp_technology_use,
      ROUND(AVG(pr.comp_goal_setting)::numeric, 2)                                     AS avg_comp_goal_setting,
      ROUND(AVG(pr.comp_diversity)::numeric, 2)                                        AS avg_comp_diversity,
      ROUND(AVG(pr.comp_work_habits)::numeric, 2)                                      AS avg_comp_work_habits,
      ROUND(AVG(pr.comp_proactive)::numeric, 2)                                        AS avg_comp_proactive
    FROM company c
    JOIN position p ON p.company_id = c.id
    LEFT JOIN position_review pr ON pr.position_id = p.id
    GROUP BY c.id, c.name
  `);
   console.log('✓ company_review_aggregate_m_view');

   console.log('\nAll views created successfully.');
   process.exit(0);
}

createViews().catch(err => {
   console.error('Error creating views:', err);
   process.exit(1);
});

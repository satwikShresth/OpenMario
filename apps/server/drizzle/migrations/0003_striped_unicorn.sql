CREATE MATERIALIZED VIEW "public"."company_detail_m_view" AS (select "company"."id", "company"."name", count(distinct "position_review"."id") as "total_reviews", count(distinct "position"."id") filter (where "position_review"."id" is not null) as "positions_reviewed", count(distinct "submission"."id") as "total_submissions", round(avg("submission"."compensation")::numeric, 2) as "avg_compensation", round(percentile_cont(0.5) within group (order by "submission"."compensation")::numeric, 2) as "median_compensation", round((
      0.30 * (
         (avg("position_review"."rating_collaboration") + avg("position_review"."rating_work_variety") +
          avg("position_review"."rating_relationships") + avg("position_review"."rating_supervisor_access") +
          avg("position_review"."rating_training")) / 5.0 / 4.0
      ) +
      0.25 * (
         count(*) filter (where "position_review"."would_recommend" = true)::numeric
         / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0)
      ) +
      0.15 * (
         count(*) filter (where "position_review"."description_accurate" = true)::numeric
         / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0)
      ) +
      0.20 * (
         (avg("position_review"."comp_written_comm") + avg("position_review"."comp_verbal_comm") +
          avg("position_review"."comp_comm_style") + avg("position_review"."comp_original_ideas") +
          avg("position_review"."comp_problem_solving") + avg("position_review"."comp_info_evaluation") +
          avg("position_review"."comp_data_decisions") + avg("position_review"."comp_ethical_standards") +
          avg("position_review"."comp_technology_use") + avg("position_review"."comp_goal_setting") +
          avg("position_review"."comp_diversity") + avg("position_review"."comp_work_habits") +
          avg("position_review"."comp_proactive")) / 13.0 / 4.0
      ) +
      0.10 * (
         1.0 - (
            0.5 * count(*) filter (where "position_review"."overtime_required" = true)::numeric
                / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0)
            +
            0.5 * least(greatest(avg("position_review"."days_per_week") - 3, 0), 2) / 2.0
         )
      )
   ) * 100, 1) as "omega_score", round(
      (avg("position_review"."rating_collaboration") + avg("position_review"."rating_work_variety") +
       avg("position_review"."rating_relationships") + avg("position_review"."rating_supervisor_access") +
       avg("position_review"."rating_training")) / 5.0 / 4.0 * 100, 1) as "satisfaction_score", round(
      count(*) filter (where "position_review"."would_recommend" = true)::numeric
      / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0) * 100, 1) as "trust_score", round(
      count(*) filter (where "position_review"."description_accurate" = true)::numeric
      / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0) * 100, 1) as "integrity_score", round(
      (avg("position_review"."comp_written_comm") + avg("position_review"."comp_verbal_comm") +
       avg("position_review"."comp_comm_style") + avg("position_review"."comp_original_ideas") +
       avg("position_review"."comp_problem_solving") + avg("position_review"."comp_info_evaluation") +
       avg("position_review"."comp_data_decisions") + avg("position_review"."comp_ethical_standards") +
       avg("position_review"."comp_technology_use") + avg("position_review"."comp_goal_setting") +
       avg("position_review"."comp_diversity") + avg("position_review"."comp_work_habits") +
       avg("position_review"."comp_proactive")) / 13.0 / 4.0 * 100, 1) as "growth_score", round((
      1.0 - (
         0.5 * count(*) filter (where "position_review"."overtime_required" = true)::numeric
             / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0)
         +
         0.5 * least(greatest(avg("position_review"."days_per_week") - 3, 0), 2) / 2.0
      )
   ) * 100, 1) as "work_life_score", round(avg("position_review"."rating_overall")::numeric, 2) as "avg_rating_overall", round(avg("position_review"."rating_collaboration")::numeric, 2) as "avg_rating_collaboration", round(avg("position_review"."rating_work_variety")::numeric, 2) as "avg_rating_work_variety", round(avg("position_review"."rating_relationships")::numeric, 2) as "avg_rating_relationships", round(avg("position_review"."rating_supervisor_access")::numeric, 2) as "avg_rating_supervisor_access", round(avg("position_review"."rating_training")::numeric, 2) as "avg_rating_training", round(
            100.0 * count(*) filter (where "position_review"."would_recommend" = true)
            / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0), 1) as "pct_would_recommend", round(
            100.0 * count(*) filter (where "position_review"."description_accurate" = true)
            / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0), 1) as "pct_description_accurate", round(avg("position_review"."days_per_week")::numeric, 1) as "avg_days_per_week", round(
            100.0 * count(*) filter (where "position_review"."public_transit_available" = true)
            / nullif(count(*) filter (where "position_review"."public_transit_available" is not null), 0), 1) as "pct_public_transit", round(
            100.0 * count(*) filter (where "position_review"."overtime_required" = true)
            / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0), 1) as "pct_overtime_required" from "company" inner join "position" on "position"."company_id" = "company"."id" left join "position_review" on "position_review"."position_id" = "position"."id" left join "submission" on "submission"."position_id" = "position"."id" group by "company"."id", "company"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."company_positions_m_view" AS (select "position"."id" as "position_id", "position"."name" as "position_name", "company"."id" as "company_id", "company"."name" as "company_name", count(distinct "position_review"."id") as "total_reviews", count(distinct "submission"."id") as "total_submissions", max("job_posting"."year") as "most_recent_posting_year", round(avg("position_review"."rating_overall")::numeric, 2) as "avg_rating_overall", round(avg("submission"."compensation")::numeric, 2) as "avg_compensation", round(percentile_cont(0.5) within group (order by "submission"."compensation")::numeric, 2) as "median_compensation", round((
      0.30 * (
         (avg("position_review"."rating_collaboration") + avg("position_review"."rating_work_variety") +
          avg("position_review"."rating_relationships") + avg("position_review"."rating_supervisor_access") +
          avg("position_review"."rating_training")) / 5.0 / 4.0
      ) +
      0.25 * (
         count(*) filter (where "position_review"."would_recommend" = true)::numeric
         / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0)
      ) +
      0.15 * (
         count(*) filter (where "position_review"."description_accurate" = true)::numeric
         / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0)
      ) +
      0.20 * (
         (avg("position_review"."comp_written_comm") + avg("position_review"."comp_verbal_comm") +
          avg("position_review"."comp_comm_style") + avg("position_review"."comp_original_ideas") +
          avg("position_review"."comp_problem_solving") + avg("position_review"."comp_info_evaluation") +
          avg("position_review"."comp_data_decisions") + avg("position_review"."comp_ethical_standards") +
          avg("position_review"."comp_technology_use") + avg("position_review"."comp_goal_setting") +
          avg("position_review"."comp_diversity") + avg("position_review"."comp_work_habits") +
          avg("position_review"."comp_proactive")) / 13.0 / 4.0
      ) +
      0.10 * (
         1.0 - (
            0.5 * count(*) filter (where "position_review"."overtime_required" = true)::numeric
                / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0)
            +
            0.5 * least(greatest(avg("position_review"."days_per_week") - 3, 0), 2) / 2.0
         )
      )
   ) * 100, 1) as "omega_score", round(
      (avg("position_review"."rating_collaboration") + avg("position_review"."rating_work_variety") +
       avg("position_review"."rating_relationships") + avg("position_review"."rating_supervisor_access") +
       avg("position_review"."rating_training")) / 5.0 / 4.0 * 100, 1) as "satisfaction_score", round(
      count(*) filter (where "position_review"."would_recommend" = true)::numeric
      / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0) * 100, 1) as "trust_score", round(
      count(*) filter (where "position_review"."description_accurate" = true)::numeric
      / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0) * 100, 1) as "integrity_score", round(
      (avg("position_review"."comp_written_comm") + avg("position_review"."comp_verbal_comm") +
       avg("position_review"."comp_comm_style") + avg("position_review"."comp_original_ideas") +
       avg("position_review"."comp_problem_solving") + avg("position_review"."comp_info_evaluation") +
       avg("position_review"."comp_data_decisions") + avg("position_review"."comp_ethical_standards") +
       avg("position_review"."comp_technology_use") + avg("position_review"."comp_goal_setting") +
       avg("position_review"."comp_diversity") + avg("position_review"."comp_work_habits") +
       avg("position_review"."comp_proactive")) / 13.0 / 4.0 * 100, 1) as "growth_score", round((
      1.0 - (
         0.5 * count(*) filter (where "position_review"."overtime_required" = true)::numeric
             / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0)
         +
         0.5 * least(greatest(avg("position_review"."days_per_week") - 3, 0), 2) / 2.0
      )
   ) * 100, 1) as "work_life_score" from "position" inner join "company" on "company"."id" = "position"."company_id" left join "job_posting" on "job_posting"."position_id" = "position"."id" left join "position_review" on "position_review"."position_id" = "position"."id" left join "submission" on "submission"."position_id" = "position"."id" group by "position"."id", "position"."name", "company"."id", "company"."name");
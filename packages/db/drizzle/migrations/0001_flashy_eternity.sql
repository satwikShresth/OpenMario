ALTER TABLE "__drizzle_migrations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP MATERIALIZED VIEW "public"."company_detail_m_view";--> statement-breakpoint
DROP MATERIALIZED VIEW "public"."company_positions_m_view";--> statement-breakpoint
DROP MATERIALIZED VIEW "public"."company_review_aggregate_m_view";--> statement-breakpoint
DROP MATERIALIZED VIEW "public"."position_omega_m_view";--> statement-breakpoint
DROP MATERIALIZED VIEW "public"."instructor_sections_m_view";--> statement-breakpoint
DROP MATERIALIZED VIEW "public"."position_review_aggregate_m_view";--> statement-breakpoint
DROP MATERIALIZED VIEW "public"."position_information_m_view";--> statement-breakpoint
DROP MATERIALIZED VIEW "public"."meili_companies_m_idx";--> statement-breakpoint
DROP MATERIALIZED VIEW "public"."submissions_m_view";--> statement-breakpoint
DROP MATERIALIZED VIEW "public"."meili_sections_m_idx";--> statement-breakpoint
DROP MATERIALIZED VIEW "public"."corequisites_m_view";--> statement-breakpoint
DROP MATERIALIZED VIEW "public"."meili_professors_m_idx";--> statement-breakpoint
DROP MATERIALIZED VIEW "public"."prerequisites_m_view";--> statement-breakpoint
DROP TABLE "__drizzle_migrations" CASCADE;--> statement-breakpoint
DROP INDEX "course_subject_id_index";--> statement-breakpoint
DROP INDEX "account_userId_idx";--> statement-breakpoint
DROP INDEX "section_course_id_index";--> statement-breakpoint
DROP INDEX "section_crn_index";--> statement-breakpoint
DROP INDEX "section_subject_code_index";--> statement-breakpoint
DROP INDEX "section_term_id_index";--> statement-breakpoint
DROP INDEX "subject_college_id_index";--> statement-breakpoint
DROP INDEX "session_userId_idx";--> statement-breakpoint
DROP INDEX "verification_identifier_idx";--> statement-breakpoint
DROP INDEX "instructor_sections_section_id_index";--> statement-breakpoint
DROP INDEX "instructor_courses_course_id_index";--> statement-breakpoint
DROP INDEX "course_history_academic_year_index";--> statement-breakpoint
DROP INDEX "course_history_term_index";--> statement-breakpoint
DROP INDEX "course_prerequisites_prerequisite_course_id_index";--> statement-breakpoint
CREATE INDEX "course_subject_id_index" ON "course" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "section_course_id_index" ON "section" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "section_crn_index" ON "section" USING btree ("crn");--> statement-breakpoint
CREATE INDEX "section_subject_code_index" ON "section" USING btree ("subject_code");--> statement-breakpoint
CREATE INDEX "section_term_id_index" ON "section" USING btree ("term_id");--> statement-breakpoint
CREATE INDEX "subject_college_id_index" ON "subject" USING btree ("college_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "instructor_sections_section_id_index" ON "instructor_sections" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "instructor_courses_course_id_index" ON "instructor_courses" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_history_academic_year_index" ON "course_history" USING btree ("academic_year");--> statement-breakpoint
CREATE INDEX "course_history_term_index" ON "course_history" USING btree ("term");--> statement-breakpoint
CREATE INDEX "course_prerequisites_prerequisite_course_id_index" ON "course_prerequisites" USING btree ("prerequisite_course_id");--> statement-breakpoint
ALTER TABLE "section_days" DROP CONSTRAINT "section_days_section_id_day_pk";
--> statement-breakpoint
ALTER TABLE "section_days" ADD CONSTRAINT "section_days_section_id_day_pk" PRIMARY KEY("section_id","day");--> statement-breakpoint
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
CREATE MATERIALIZED VIEW "public"."company_positions_m_view" AS (select "position"."id" as "position_id", "position"."name" as "position_name", "company"."id" as "company_id", "company"."name" as "company_name", count(distinct "position_review"."id") as "total_reviews", count(distinct "submission"."id") as "total_submissions", max("job_posting"."year") as "most_recent_posting_year", round(avg("position_review"."rating_overall")::numeric, 2) as "avg_rating_overall", round(avg("position_review"."rating_collaboration")::numeric, 2) as "avg_rating_collaboration", round(avg("position_review"."rating_work_variety")::numeric, 2) as "avg_rating_work_variety", round(avg("position_review"."rating_relationships")::numeric, 2) as "avg_rating_relationships", round(avg("position_review"."rating_supervisor_access")::numeric, 2) as "avg_rating_supervisor_access", round(avg("position_review"."rating_training")::numeric, 2) as "avg_rating_training", round(avg("submission"."compensation")::numeric, 2) as "avg_compensation", round(percentile_cont(0.5) within group (order by "submission"."compensation")::numeric, 2) as "median_compensation", round((
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
   ) * 100, 1) as "work_life_score" from "position" inner join "company" on "company"."id" = "position"."company_id" left join "job_posting" on "job_posting"."position_id" = "position"."id" left join "position_review" on "position_review"."position_id" = "position"."id" left join "submission" on "submission"."position_id" = "position"."id" group by "position"."id", "position"."name", "company"."id", "company"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."company_review_aggregate_m_view" AS (select "company"."id", "company"."name", count(distinct "position"."id") filter (where "position_review"."id" is not null) as "positions_with_reviews", count("position_review"."id") as "total_reviews", min("position_review"."year") as "first_review_year", max("position_review"."year") as "last_review_year", round(avg("position_review"."rating_overall")::numeric, 2) as "avg_rating_overall", round(avg("position_review"."rating_collaboration")::numeric, 2) as "avg_rating_collaboration", round(avg("position_review"."rating_work_variety")::numeric, 2) as "avg_rating_work_variety", round(avg("position_review"."rating_relationships")::numeric, 2) as "avg_rating_relationships", round(avg("position_review"."rating_supervisor_access")::numeric, 2) as "avg_rating_supervisor_access", round(avg("position_review"."rating_training")::numeric, 2) as "avg_rating_training", round(
               100.0 * count(*) filter (where "position_review"."would_recommend" = true)
               / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0), 1) as "pct_would_recommend", round(
               100.0 * count(*) filter (where "position_review"."description_accurate" = true)
               / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0), 1) as "pct_description_accurate", round(avg("position_review"."days_per_week")::numeric, 1) as "avg_days_per_week", round(
               100.0 * count(*) filter (where "position_review"."public_transit_available" = true)
               / nullif(count(*) filter (where "position_review"."public_transit_available" is not null), 0), 1) as "pct_public_transit", round(
               100.0 * count(*) filter (where "position_review"."overtime_required" = true)
               / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0), 1) as "pct_overtime_required", round(avg("position_review"."comp_written_comm")::numeric, 2) as "avg_comp_written_comm", round(avg("position_review"."comp_verbal_comm")::numeric, 2) as "avg_comp_verbal_comm", round(avg("position_review"."comp_comm_style")::numeric, 2) as "avg_comp_comm_style", round(avg("position_review"."comp_original_ideas")::numeric, 2) as "avg_comp_original_ideas", round(avg("position_review"."comp_problem_solving")::numeric, 2) as "avg_comp_problem_solving", round(avg("position_review"."comp_info_evaluation")::numeric, 2) as "avg_comp_info_evaluation", round(avg("position_review"."comp_data_decisions")::numeric, 2) as "avg_comp_data_decisions", round(avg("position_review"."comp_ethical_standards")::numeric, 2) as "avg_comp_ethical_standards", round(avg("position_review"."comp_technology_use")::numeric, 2) as "avg_comp_technology_use", round(avg("position_review"."comp_goal_setting")::numeric, 2) as "avg_comp_goal_setting", round(avg("position_review"."comp_diversity")::numeric, 2) as "avg_comp_diversity", round(avg("position_review"."comp_work_habits")::numeric, 2) as "avg_comp_work_habits", round(avg("position_review"."comp_proactive")::numeric, 2) as "avg_comp_proactive", round(avg("submission"."compensation")::numeric, 2) as "avg_compensation", round(percentile_cont(0.5) within group (order by "submission"."compensation")::numeric, 2) as "median_compensation" from "company" inner join "position" on "position"."company_id" = "company"."id" left join "position_review" on "position_review"."position_id" = "position"."id" left join "submission" on "submission"."position_id" = "position"."id" group by "company"."id", "company"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."position_omega_m_view" AS (select "position"."id" as "position_id", "position"."name" as "position_name", "company"."id" as "company_id", "company"."name" as "company_name", count("position_review"."id") as "total_reviews", round((
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
   ) * 100, 1) as "work_life_score" from "position" inner join "company" on "company"."id" = "position"."company_id" left join "position_review" on "position_review"."position_id" = "position"."id" group by "position"."id", "position"."name", "company"."id", "company"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."instructor_sections_m_view" AS (select "instructor"."id" as "instructor_id", "instructor"."name" as "instructor_name", "section"."crn" as "section_crn", "section"."term_id" as "term_id", "section"."subject_code" as "subject_code", "section"."course_number" as "course_number", "course"."title" as "course_title", "section"."section" as "section_code", "section"."instruction_method" as "instruction_method", "section"."instruction_type" as "instruction_type" from "instructor" inner join "instructor_sections" on "instructor_sections"."instructor_id" = "instructor"."id" inner join "section" on "section"."id" = "instructor_sections"."section_id" inner join "course" on "course"."id" = "section"."course_id" inner join "subject" on "subject"."id" = "section"."subject_code");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."position_review_aggregate_m_view" AS (select "position"."id" as "position_id", "position"."name" as "position_name", "company"."name" as "company_name", count("position_review"."id") as "total_reviews", min("position_review"."year") as "first_review_year", max("position_review"."year") as "last_review_year", round(avg("position_review"."rating_overall")::numeric, 2) as "avg_rating_overall", round(avg("position_review"."rating_collaboration")::numeric, 2) as "avg_rating_collaboration", round(avg("position_review"."rating_work_variety")::numeric, 2) as "avg_rating_work_variety", round(avg("position_review"."rating_relationships")::numeric, 2) as "avg_rating_relationships", round(avg("position_review"."rating_supervisor_access")::numeric, 2) as "avg_rating_supervisor_access", round(avg("position_review"."rating_training")::numeric, 2) as "avg_rating_training", round(
            100.0 * count(*) filter (where "position_review"."would_recommend" = true)
            / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0), 1) as "pct_would_recommend", round(
            100.0 * count(*) filter (where "position_review"."description_accurate" = true)
            / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0), 1) as "pct_description_accurate", round(avg("position_review"."days_per_week")::numeric, 1) as "avg_days_per_week", round(
            100.0 * count(*) filter (where "position_review"."public_transit_available" = true)
            / nullif(count(*) filter (where "position_review"."public_transit_available" is not null), 0), 1) as "pct_public_transit", round(
            100.0 * count(*) filter (where "position_review"."overtime_required" = true)
            / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0), 1) as "pct_overtime_required", round(avg("position_review"."comp_written_comm")::numeric, 2) as "avg_comp_written_comm", round(avg("position_review"."comp_verbal_comm")::numeric, 2) as "avg_comp_verbal_comm", round(avg("position_review"."comp_comm_style")::numeric, 2) as "avg_comp_comm_style", round(avg("position_review"."comp_original_ideas")::numeric, 2) as "avg_comp_original_ideas", round(avg("position_review"."comp_problem_solving")::numeric, 2) as "avg_comp_problem_solving", round(avg("position_review"."comp_info_evaluation")::numeric, 2) as "avg_comp_info_evaluation", round(avg("position_review"."comp_data_decisions")::numeric, 2) as "avg_comp_data_decisions", round(avg("position_review"."comp_ethical_standards")::numeric, 2) as "avg_comp_ethical_standards", round(avg("position_review"."comp_technology_use")::numeric, 2) as "avg_comp_technology_use", round(avg("position_review"."comp_goal_setting")::numeric, 2) as "avg_comp_goal_setting", round(avg("position_review"."comp_diversity")::numeric, 2) as "avg_comp_diversity", round(avg("position_review"."comp_work_habits")::numeric, 2) as "avg_comp_work_habits", round(avg("position_review"."comp_proactive")::numeric, 2) as "avg_comp_proactive" from "position" inner join "company" on "company"."id" = "position"."company_id" left join "position_review" on "position_review"."position_id" = "position"."id" group by "position"."id", "position"."name", "company"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."position_information_m_view" AS (select "position"."id" as "position_id", "position"."name" as "position_name", "company"."id" as "company_id", "company"."name" as "company_name", max("job_posting"."year") as "most_recent_posting_year", count(distinct "position_review"."id") as "total_reviews", round(avg("position_review"."rating_overall")::numeric, 2) as "avg_rating_overall", count(distinct "submission"."id") as "total_submissions", round(avg("submission"."compensation")::numeric, 2) as "avg_compensation", round(percentile_cont(0.5) within group (order by "submission"."compensation")::numeric, 2) as "median_compensation" from "position" inner join "company" on "company"."id" = "position"."company_id" left join "job_posting" on "job_posting"."position_id" = "position"."id" left join "position_review" on "position_review"."position_id" = "position"."id" left join "submission" on "submission"."position_id" = "position"."id" group by "position"."id", "position"."name", "company"."id", "company"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."meili_companies_m_idx" AS (select "company"."id" as "company_id", "company"."name" as "company_name", array_agg(distinct "position"."name") as "positions", count(distinct "position_review"."id") as "total_reviews", count(distinct "position"."id") filter (where "position_review"."id" is not null) as "positions_reviewed", count(distinct "submission"."id") as "total_submissions", round(avg("submission"."compensation")::numeric, 2) as "avg_compensation", round(percentile_cont(0.5) within group (order by "submission"."compensation")::numeric, 2) as "median_compensation", round((
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
         ) * 100, 1) as "work_life_score", round(avg("position_review"."rating_overall")::numeric, 2) as "avg_rating_overall", round(
            100.0 * count(*) filter (where "position_review"."would_recommend" = true)
            / nullif(count(*) filter (where "position_review"."would_recommend" is not null), 0), 1) as "pct_would_recommend", round(
            100.0 * count(*) filter (where "position_review"."description_accurate" = true)
            / nullif(count(*) filter (where "position_review"."description_accurate" is not null), 0), 1) as "pct_description_accurate", round(avg("position_review"."days_per_week")::numeric, 1) as "avg_days_per_week", round(
            100.0 * count(*) filter (where "position_review"."overtime_required" = true)
            / nullif(count(*) filter (where "position_review"."overtime_required" is not null), 0), 1) as "pct_overtime_required", min("position_review"."year") as "first_review_year", max("position_review"."year") as "last_review_year" from "company" inner join "position" on "position"."company_id" = "company"."id" left join "position_review" on "position_review"."position_id" = "position"."id" left join "submission" on "submission"."position_id" = "position"."id" group by "company"."id", "company"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."submissions_m_view" WITH (fillfactor = 90) AS (select "submission"."id", "submission"."year", "submission"."coop_year", "submission"."coop_cycle", "submission"."program_level", "submission"."work_hours", "submission"."compensation", "submission"."other_compensation", "submission"."details", "submission"."owner_id", "submission"."created_at", "company"."id" as "company_id", "position"."id" as "position_id", "company"."name" as "company_name", "position"."name" as "position_name", "location"."city" as "city", "location"."state" as "state", "location"."state_code" as "state_code", 
          coalesce("company"."name", '')                  || ' ' ||
          coalesce("position"."name", '')                 || ' ' ||
          coalesce("location"."city", '')                 || ' ' ||
          coalesce("location"."state", '')                || ' ' ||
          coalesce("location"."state_code", '')           || ' ' ||
          coalesce("submission"."details", '')            || ' ' ||
          coalesce("submission"."other_compensation", '')
         as "search_text" from "submission" left join "position" on "submission"."position_id" = "position"."id" left join "location" on "submission"."location_id" = "location"."id" left join "company" on "position"."company_id" = "company"."id");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."meili_sections_m_idx" AS (select "section"."crn" as "crn", "section"."section" as "section", "section"."course_number" as "course_number", "section"."instruction_type" as "instruction_type", "section"."instruction_method" as "instruction_method", "course"."credits" as "credits", "section"."max_enroll" as "max_enroll", "section"."start_time" as "start_time", "section"."end_time" as "end_time", coalesce(
            array_agg(distinct "section_days"."day"::text) filter (where "section_days"."day" is not null),
            '{}'
         ) as "days", "section"."term_id"::text as "term", "subject"."id" || ' ' || "section"."course_number" as "course", "course"."title" as "title", "course"."description" as "description", "course"."restrictions" as "restrictions", "course"."repeat_status" as "repeat_status", "course"."writing_intensive" as "writing_intensive", "subject"."id" as "subject_id", "subject"."name" as "subject_name", "college"."id" as "college_id", "college"."name" as "college_name", "course"."id" as "course_id", coalesce(
            json_agg(
               distinct jsonb_build_object(
                  'id',             "instructor"."id",
                  'name',           "instructor"."name",
                  'department',     "instructor"."department",
                  'avg_rating',     "instructor"."avg_rating"::float,
                  'avg_difficulty', "instructor"."avg_difficulty"::float,
                  'num_ratings',    "instructor"."num_ratings",
                  'rmp_id',         "instructor"."rmp_id",
                  'rmp_legacy_id',  "instructor"."rmp_legacy_id",
                  'weighted_score', ("instructor"."num_ratings" * "instructor"."avg_rating"::float)
               )
            ) filter (where "instructor"."id" is not null),
            '[]'
         ) as "instructors" from "section" inner join "course" on "course"."id" = "section"."course_id" inner join "subject" on "subject"."id" = "section"."subject_code" inner join "college" on "college"."id" = "subject"."college_id" inner join "term" on "term"."id" = "section"."term_id" left join "section_days" on "section_days"."section_id" = "section"."id" left join "instructor_sections" on "instructor_sections"."section_id" = "section"."id" left join "instructor" on "instructor"."id" = "instructor_sections"."instructor_id" group by "section"."crn", "section"."section", "section"."course_number", "section"."instruction_type", "section"."instruction_method", "section"."max_enroll", "section"."start_time", "section"."end_time", "section"."term_id", "course"."id", "course"."title", "course"."description", "course"."credits", "course"."restrictions", "course"."repeat_status", "course"."writing_intensive", "subject"."id", "subject"."name", "college"."id", "college"."name");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."corequisites_m_view" WITH (fillfactor = 90) AS (select "course_corequisites"."course_id", "course"."title" as "course_title", "course"."subject_id" as "course_subject_id", "course"."course_number" as "course_number", "coreq_course"."id" as "coreq_id", "coreq_course"."title" as "coreq_title", "coreq_course"."subject_id" as "coreq_subject_id", "coreq_course"."course_number" as "coreq_course_number" from "course_corequisites" inner join "course" on "course"."id" = "course_corequisites"."course_id" inner join "course" "coreq_course" on "coreq_course"."id" = "course_corequisites"."corequisite_course_id");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."meili_professors_m_idx" AS (select "instructor"."id" as "id", "instructor"."name" as "name", "instructor"."department" as "department", "instructor"."avg_rating" as "avg_rating", "instructor"."avg_difficulty" as "avg_difficulty", "instructor"."num_ratings" as "num_ratings", "instructor"."rmp_id" as "rmp_id", "instructor"."rmp_legacy_id" as "rmp_legacy_id", "instructor"."num_ratings" * "instructor"."avg_rating" as "weighted_score", count(distinct "section"."crn") as "total_sections_taught", count(distinct "course"."id") as "total_courses_taught", count(distinct "section"."term_id") as "total_terms_active", max("section"."term_id") as "most_recent_term", array_agg(distinct "subject"."id") as "subjects_taught", array_agg(distinct "section"."instruction_method") as "instruction_methods", coalesce(
            json_agg(distinct jsonb_build_object(
               'code', "subject"."id" || ' ' || "section"."course_number",
               'title', "course"."title"
            )) filter (where "course"."id" is not null),
            '[]'
         ) as "courses_taught" from "instructor" left join "instructor_sections" on "instructor_sections"."instructor_id" = "instructor"."id" left join "section" on "section"."id" = "instructor_sections"."section_id" left join "course" on "course"."id" = "section"."course_id" left join "subject" on "subject"."id" = "section"."subject_code" group by "instructor"."id", "instructor"."name", "instructor"."department", "instructor"."avg_rating", "instructor"."avg_difficulty", "instructor"."num_ratings", "instructor"."rmp_id", "instructor"."rmp_legacy_id");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."prerequisites_m_view" WITH (fillfactor = 90) AS (select "course_prerequisites"."course_id", "course"."title" as "course_title", "course"."subject_id" as "course_subject_id", "course"."course_number" as "course_number", "prereq_course"."id" as "prereq_id", "prereq_course"."title" as "prereq_title", "prereq_course"."subject_id" as "prereq_subject_id", "prereq_course"."course_number" as "prereq_course_number", "course_prerequisites"."relationship_type", "course_prerequisites"."group_id", "course_prerequisites"."can_take_concurrent", "course_prerequisites"."minimum_grade" from "course_prerequisites" inner join "course" on "course"."id" = "course_prerequisites"."course_id" inner join "course" "prereq_course" on "prereq_course"."id" = "course_prerequisites"."prerequisite_course_id");
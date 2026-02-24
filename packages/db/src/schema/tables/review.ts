import {
   boolean,
   integer,
   pgTable,
   smallint,
   text,
   timestamp,
   unique,
   uuid,
   varchar
} from 'drizzle-orm/pg-core';
import { coop_cycle_type, coop_sequence_enum } from './enums';
import { position } from './company';

export const position_review = pgTable(
   'position_review',
   {
      id: uuid().defaultRandom().primaryKey(),
      position_id: uuid()
         .notNull()
         .references(() => position.id, { onDelete: 'cascade' }),
      job_id: varchar({ length: 20 }).notNull(),
      review_index: integer().notNull().default(1),

      coop_cycle: coop_cycle_type().notNull(),
      year: integer().notNull(),
      coop_sequence: coop_sequence_enum(),
      department: varchar({ length: 255 }),
      days_per_week: integer(),
      shift_work_required: boolean(),
      overtime_required: boolean(),
      public_transit_available: boolean(),
      employer_housing_assistance: boolean(),

      // Satisfaction ratings: 4=Very Satisfied, 3=Satisfied, 2=Dissatisfied, 1=Very Dissatisfied
      rating_collaboration: smallint(),
      rating_work_variety: smallint(),
      rating_relationships: smallint(),
      rating_supervisor_access: smallint(),
      rating_training: smallint(),
      rating_overall: smallint(),

      would_recommend: boolean(),
      description_accurate: boolean(),
      best_features: text(),
      challenges: text(),
      resume_description: text(),

      // Career competency ratings: 4=highest, 1=lowest, null=Unable to Rate
      comp_written_comm: smallint(),
      comp_verbal_comm: smallint(),
      comp_comm_style: smallint(),
      comp_original_ideas: smallint(),
      comp_problem_solving: smallint(),
      comp_info_evaluation: smallint(),
      comp_data_decisions: smallint(),
      comp_ethical_standards: smallint(),
      comp_technology_use: smallint(),
      comp_goal_setting: smallint(),
      comp_diversity: smallint(),
      comp_work_habits: smallint(),
      comp_proactive: smallint(),

      created_at: timestamp().defaultNow()
   },
   table => [unique().on(table.position_id, table.job_id, table.review_index)]
);

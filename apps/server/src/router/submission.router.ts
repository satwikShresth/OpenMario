import { os } from './context';
import {
   db,
   company,
   position,
   location,
   submission,
   submissionMView
} from '@/db';
import {
   and,
   eq,
   or,
   sql,
   asc,
   desc,
   isNull,
   type SQL,
   type SelectedFields
} from 'drizzle-orm';
import { maybe } from '@/utils';
import type { SubmissionQuerySchema } from '@/contracts/submission.contract';
import type { z } from 'zod';

// Type definitions
type SubmissionQueryParams = z.infer<typeof SubmissionQuerySchema>;

/**
 * Helper function to get position ID by company and position name
 */
const getPositionCTE = (companyName: string, positionName: string) =>
   db.$with('position_cte').as(
      db
         .select({ position_id: position.id })
         .from(position)
         .innerJoin(company, eq(position.company_id, company.id))
         .where(
            and(eq(company.name, companyName), eq(position.name, positionName))
         )
         .limit(1)
   );

/**
 * Helper function to get location ID by city and state code
 */
const getLocationCTE = (locationStr: string) => {
   const [city, state_code] = locationStr.split(',').map(s => s.trim());

   return db.$with('location_cte').as(
      db
         .select({ location_id: location.id })
         .from(location)
         .where(
            and(eq(location.city, city!), eq(location.state_code, state_code!))
         )
         .limit(1)
   );
};

/**
 * Helper function to build where clause from query parameters.
 * All filters target the flat materialized view — no runtime joins needed.
 */
const buildWhereClause = (params: SubmissionQueryParams) =>
   and(
      // BETWEEN is a single range check vs 22 OR equality conditions
      maybe(
         params?.year,
         ([start_year, end_year]: number[]) =>
            sql`${submissionMView.year} between ${start_year} and ${end_year}`
      ),
      maybe(params?.coop_year, (coop_years: string[]) =>
         or(
            ...coop_years.map((coop_year: string) =>
               eq(submissionMView.coop_year, coop_year as any)
            )
         )
      ),
      maybe(params?.coop_cycle, (coop_cycles: string[]) =>
         or(
            ...coop_cycles.map((cycle: string) =>
               eq(submissionMView.coop_cycle, cycle as any)
            )
         )
      ),
      maybe(params?.program_level, (level: string) =>
         eq(submissionMView.program_level, level as any)
      ),
      // Three-layer search:
      //   FTS            — exact stems, "phrases", OR, -negation  (GIN tsvector index)
      //   ILIKE          — prefix / substring typing              (GIN trigram index)
      //   word_similarity — typo fallback; only evaluated on rows that missed
      //                     the two indexed conditions above (bitmap OR short-circuit)
      maybe(params?.search, (term: string) => {
         const ilikeTerm = `%${term}%`;
         return sql`(
            ${submissionMView.search_vector} @@ websearch_to_tsquery('english', ${term})
            OR ${submissionMView.search_text} ILIKE ${ilikeTerm}
            OR word_similarity(${term}, ${submissionMView.search_text}) > 0.3
         )`;
      })
   );

/**
 * Helper function to get sort column based on field name
 */
const getSortColumn = (
   field: SubmissionQueryParams['sortField']
): SQL<unknown> => {
   switch (field) {
      case 'company':
         return sql`company_name`;
      case 'position':
         return sql`position_name`;
      case 'compensation':
         return sql`compensation`;
      case 'year':
         return sql`year`;
      case 'coop':
         return sql`coop_year`;
      case 'location':
         return sql`city`;
      default:
         return sql`compensation`;
   }
};

/**
 * Retrieve co-op submission records with pagination and filtering
 */
export const listSubmissions = os.submission.list.handler(async ({ input }) => {
   const { pageIndex, pageSize, distinct, sort, sortField, search } = input;
   const sortColumn = getSortColumn(sortField);
   const order = sort === 'ASC' ? asc(sortColumn) : desc(sortColumn);

   const whereClause = buildWhereClause(input);

   // Three-tier rank (all naturally compose):
   //   ts_rank   — 0.001–1.0 for FTS hits, 0 otherwise            (dominant)
   //   word_similarity — 0–1.0 fuzzy score, scaled down            (tiebreaker)
   // FTS matches always float above pure fuzzy/substring matches.
   const rankExpr = search
      ? sql<number>`(
           coalesce(
              ts_rank(
                 '{0.1, 0.2, 0.4, 1.0}',
                 ${submissionMView.search_vector},
                 websearch_to_tsquery('english', ${search})
              ),
              0.0
           )
           + word_similarity(${search}, ${submissionMView.search_text}) * 0.2
        )`.as('rank')
      : null;

   try {
      const subQuerySelect = <TSelection extends SelectedFields<any, any>>(
         distinct: boolean,
         fields: TSelection
      ) =>
         distinct
            ? db.selectDistinctOn(
                 [
                    submissionMView.company,
                    submissionMView.position,
                    submissionMView.compensation,
                    submissionMView.program_level
                 ],
                 fields
              )
            : db.select(fields);

      const baseFields = {
         year: submissionMView.year,
         coop_year: submissionMView.coop_year,
         coop_cycle: submissionMView.coop_cycle,
         program_level: submissionMView.program_level,
         work_hours: submissionMView.work_hours,
         compensation: submissionMView.compensation,
         other_compensation: submissionMView.other_compensation,
         details: submissionMView.details,
         company: submissionMView.company,
         position: submissionMView.position,
         location_city: submissionMView.city,
         location_state: submissionMView.state,
         location_state_code: submissionMView.state_code
      };

      const subQuery = subQuerySelect(!!distinct, {
         ...baseFields,
         ...(rankExpr ? { rank: rankExpr } : {})
      })
         .from(submissionMView)
         .where(whereClause)
         .as('sub_query');

      // Primary sort by relevance rank when searching; user sort is secondary.
      const orderClauses = rankExpr ? [desc(sql`rank`), order] : [order];

      const [count, data] = await Promise.all([
         db.$count(subQuery),
         db
            .select()
            .from(subQuery)
            .orderBy(...orderClauses)
            .offset((pageIndex - 1) * pageSize)
            .limit(pageSize)
      ]);

      return {
         pageIndex,
         pageSize,
         count,
         data: data as any
      };
   } catch (error: any) {
      console.error('Error listing submissions:', error);
      throw new Error(error.message || 'Failed to list submissions');
   }
});

/**
 * Create new co-op submission
 */
export const createSubmission = os.submission.create.handler(
   async ({ input }) => {
      const positionCTE = getPositionCTE(input.company, input.position);
      const locationCTE = getLocationCTE(input.location);

      return await db
         .with(positionCTE, locationCTE)
         .insert(submission)
         .values({
            position_id: sql`(select ${positionCTE.position_id} from ${positionCTE})`,
            location_id: sql`(select ${locationCTE.location_id} from ${locationCTE})`,
            coop_cycle: input.coop_cycle,
            coop_year: input.coop_year,
            year: input.year,
            program_level: input.program_level,
            work_hours: input.work_hours,
            compensation: input.compensation,
            other_compensation: input.other_compensation,
            details: input.details,
            owner_id: null
         })
         .returning({ id: submission.id, owner_id: submission.owner_id })
         .then(([result]) => ({
            id: result!.id,
            owner_id: result!.owner_id,
            message: 'Added position successfully'
         }))
         .catch(error => {
            console.error('Error creating submission:', error);
            throw new Error(error.message || 'Failed to create submission');
         });
   }
);

/**
 * Update an existing co-op submission
 */
export const updateSubmission = os.submission.update.handler(
   async ({ input }) => {
      if (!input.id) {
         throw new Error('Submission ID is required for update');
      }

      const positionCTE = getPositionCTE(input.company, input.position);
      const locationCTE = getLocationCTE(input.location);

      return await db
         .with(positionCTE, locationCTE)
         .update(submission)
         .set({
            position_id: sql`(select ${positionCTE.position_id} from ${positionCTE})`,
            location_id: sql`(select ${locationCTE.location_id} from ${locationCTE})`,
            coop_cycle: input.coop_cycle,
            coop_year: input.coop_year,
            year: input.year,
            program_level: input.program_level,
            work_hours: input.work_hours,
            compensation: input.compensation,
            other_compensation: input.other_compensation,
            details: input.details
         })
         .where(and(eq(submission.id, input.id), isNull(submission.owner_id)))
         .returning()
         .then(([value]) => {
            if (!value) {
               throw new Error(
                  'Submission not found or you do not have permission to update it'
               );
            }
            return {
               id: value.id,
               message: 'Updated position successfully'
            };
         })
         .catch(error => {
            console.error('Error updating submission:', error);
            throw new Error(error.message || 'Failed to update submission');
         });
   }
);

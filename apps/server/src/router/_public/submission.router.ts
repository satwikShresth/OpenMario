import { os } from '@/router/helpers';
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
import type { SubmissionQuery } from '@openmario/contracts';

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
const buildWhereClause = (params: SubmissionQuery) =>
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
      maybe(params?.search, (search: string) => {
         const terms = search.trim().split(/\s+/);

         const termClauses = terms.map(
            term => sql`paradedb.boolean(
            should => ARRAY[
               -- fuzzy fallback on the concat field catches typos/partials
               paradedb.fuzzy_term('search_text', ${term}, distance => 2),

               -- prefix match per field with boosts for ranking
               paradedb.boost(4.0, paradedb.fuzzy_term('company_name',  ${term}, distance => 2, prefix => true)),
               paradedb.boost(3.0, paradedb.fuzzy_term('position_name', ${term}, distance => 2, prefix => true)),
               paradedb.boost(2.0, paradedb.fuzzy_term('city',          ${term}, distance => 2, prefix => true)),
               paradedb.boost(1.5, paradedb.fuzzy_term('state',         ${term}, distance => 2, prefix => true)),
               paradedb.boost(1.0, paradedb.fuzzy_term('details',       ${term}, distance => 2, prefix => true))
            ]
         )`
         );

         return sql`${submissionMView.id} @@@ paradedb.boolean(
         must => ARRAY[${sql.join(termClauses, sql`, `)}]
      )`;
      })
   );

/**
 * Helper function to get sort column based on field name
 */
const getSortColumn = (field: SubmissionQuery['sortField']): SQL<unknown> => {
   const map = {
      company: sql`company_name`,
      position: sql`position_name`,
      compensation: sql`compensation`,
      year: sql`year`,
      coop: sql`coop_year`,
      location: sql`city`
   };
   const value = map[field]!;
   return map[field] ? value : sql`compensation`;
};

/**
 * Retrieve co-op submission records with pagination and filtering
 */
export const listSubmissions = os.submission.list.handler(async ({ input }) => {
   const { pageIndex, pageSize, distinct, sort, sortField } = input;
   const sortColumn = getSortColumn(sortField);
   const order = sort === 'ASC' ? asc(sortColumn) : desc(sortColumn);

   const whereClause = buildWhereClause(input);

   const subQuerySelect = <TSelection extends SelectedFields<any, any>>(
      distinct: boolean,
      fields: TSelection
   ) =>
      distinct
         ? db.selectDistinctOn(
              [
                 submissionMView.company_name,
                 submissionMView.position_name,
                 submissionMView.compensation,
                 submissionMView.program_level
              ],
              fields
           )
         : db.select(fields);

   const subQuery = subQuerySelect(!!distinct, {
      id: submissionMView.id,
      year: submissionMView.year,
      coop_year: submissionMView.coop_year,
      coop_cycle: submissionMView.coop_cycle,
      program_level: submissionMView.program_level,
      work_hours: submissionMView.work_hours,
      compensation: submissionMView.compensation,
      other_compensation: submissionMView.other_compensation,
      details: submissionMView.details,
      company: submissionMView.company_name,
      company_id: submissionMView.company_id,
      position: submissionMView.position_name,
      position_id: submissionMView.position_id,
      location_city: submissionMView.city,
      location_state: submissionMView.state,
      location_state_code: submissionMView.state_code,
      rank: sql`paradedb.score(id)`.as('rank')
   })
      .from(submissionMView)
      .where(whereClause)
      .as('sub_query');

   return await Promise.all([
      db.$count(subQuery),
      db
         .select()
         .from(subQuery)
         .orderBy(desc(sql`rank`), order)
         .offset((pageIndex - 1) * pageSize)
         .limit(pageSize)
   ])
      .then(([count, data]) => ({
         pageIndex,
         pageSize,
         count,
         data: data as any
      }))
      .catch(error => {
         console.error('Error listing submissions:', error);
         throw new Error(error.message || 'Failed to list submissions');
      });
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

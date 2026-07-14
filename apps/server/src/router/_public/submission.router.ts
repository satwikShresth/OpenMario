import { os } from '@/router/helpers';
import type { DbClient } from '@openmario/db';
import {
   position,
   submission,
   submissionMView
} from '@openmario/db';
import {
   INDEX_NAMES,
   type SubmissionDocument,
   type MeilisearchService
} from '@openmario/meilisearch';
import {
   and,
   eq,
   inArray,
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
import {
   searchSubmissionIds,
   searchSubmissions
} from '@/utils/submission-search';

const toSubmissionDocument = (
   row: typeof submissionMView.$inferSelect
): SubmissionDocument => ({
   id: row.id,
   year: row.year,
   coop_year: row.coop_year,
   coop_cycle: row.coop_cycle,
   program_level: row.program_level,
   work_hours: row.work_hours,
   compensation: row.compensation,
   other_compensation: row.other_compensation,
   details: row.details,
   company_id: row.company_id,
   company_name: row.company_name,
   position_id: row.position_id,
   position_name: row.position_name,
   city: row.city,
   state: row.state,
   state_code: row.state_code
});

const syncSubmissionToMeili = async (
   db: DbClient,
   meilisearch: MeilisearchService,
   submissionId: string
) => {
   const [row] = await db
      .select()
      .from(submissionMView)
      .where(eq(submissionMView.id, submissionId))
      .limit(1);

   if (!row) return;

   await meilisearch.client
      .index<SubmissionDocument>(INDEX_NAMES.submissions)
      .addDocuments([toSubmissionDocument(row)]);
};

const assertPositionCompany = async (
   db: DbClient,
   positionId: string,
   companyId?: string
) => {
   const [row] = await db
      .select({ company_id: position.company_id })
      .from(position)
      .where(eq(position.id, positionId))
      .limit(1);
   if (!row) throw new Error('position_id not found');
   if (companyId && row.company_id !== companyId) {
      throw new Error('position_id does not belong to company_id');
   }
};

/**
 * Helper function to build where clause from query parameters.
 * All filters target the flat materialized view — no runtime joins needed.
 */
const buildWhereClause = (
   params: SubmissionQuery,
   submissionIds?: string[]
) =>
   and(
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
      maybe(submissionIds, (ids: string[]) =>
         ids.length > 0 ? inArray(submissionMView.id, ids) : sql`false`
      )
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
   return map[field!] ?? sql`compensation`;
};

const listSubmissionsFromPostgres = async (
   db: DbClient,
   input: SubmissionQuery & { pageIndex: number; pageSize: number },
   submissionIds?: string[]
) => {
   const { pageIndex, pageSize, distinct, sort, sortField } = input;
   const sortColumn = getSortColumn(sortField);
   const order = sort === 'ASC' ? asc(sortColumn) : desc(sortColumn);
   const whereClause = buildWhereClause(input, submissionIds);

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
      location_state_code: submissionMView.state_code
   })
      .from(submissionMView)
      .where(whereClause)
      .as('sub_query');

   const [count, data] = await Promise.all([
      db.$count(subQuery),
      db
         .select()
         .from(subQuery)
         .orderBy(order)
         .offset((pageIndex - 1) * pageSize)
         .limit(pageSize)
   ]);

   return {
      pageIndex,
      pageSize,
      count,
      data: data as any
   };
};

/**
 * Retrieve co-op submission records with pagination and filtering
 */
export const listSubmissions = os.submission.list.handler(
   async ({ input, context: { db, meilisearch } }) => {
      const { pageIndex, pageSize } = input;

      if (input.search?.trim()) {
         if (!meilisearch) {
            throw new Error('Search is unavailable');
         }

         if (input.distinct) {
            const submissionIds = await searchSubmissionIds(meilisearch, input);
            if (submissionIds.length === 0) {
               return { pageIndex, pageSize, count: 0, data: [] };
            }

            return listSubmissionsFromPostgres(db, input, submissionIds);
         }

         return searchSubmissions(meilisearch, { ...input, pageIndex, pageSize });
      }

      return listSubmissionsFromPostgres(db, input);
   }
);

/**
 * Create new co-op submission
 */
export const createSubmission = os.submission.create.handler(
   async ({ input, context: { db, meilisearch } }) => {
      await assertPositionCompany(db, input.position_id, input.company_id);

      return await db
         .insert(submission)
         .values({
            position_id: input.position_id,
            location_id: input.location_id,
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
         .then(async ([result]) => {
            await db.refreshMaterializedView(submissionMView).concurrently();
            if (meilisearch) {
               await syncSubmissionToMeili(db, meilisearch, result!.id);
            }
            return {
               id: result!.id,
               owner_id: result!.owner_id,
               message: 'Added position successfully'
            };
         })
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
   async ({ input, context: { db, meilisearch } }) => {
      if (!input.id) {
         throw new Error('Submission ID is required for update');
      }

      await assertPositionCompany(db, input.position_id, input.company_id);

      return await db
         .update(submission)
         .set({
            position_id: input.position_id,
            location_id: input.location_id,
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
         .then(async ([value]) => {
            if (!value) {
               throw new Error(
                  'Submission not found or you do not have permission to update it'
               );
            }
            await db.refreshMaterializedView(submissionMView).concurrently();
            if (meilisearch) {
               await syncSubmissionToMeili(db, meilisearch, value.id);
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

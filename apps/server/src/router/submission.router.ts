import { os } from './context';
import { db, company, position, location, submission } from '@/db';
import { and, eq, or, sql, asc, desc, isNull, type SQL } from 'drizzle-orm';
import { querySQL } from './helpers';
import { maybe } from '@/utils';
import { SubmissionQuerySchema } from '@/contracts/submission.contract';
import type { z } from 'zod';

// Type definitions
type SubmissionQueryParams = z.infer<typeof SubmissionQuerySchema>;

/**
 * Helper function to get position ID by company and position name
 */
const getPositionId = async (companyName: string, positionName: string) => {
   const [result] = await db
      .select({ position_id: position.id })
      .from(position)
      .innerJoin(company, eq(position.company_id, company.id))
      .where(
         and(eq(company.name, companyName), eq(position.name, positionName))
      )
      .limit(1);

   if (!result?.position_id) {
      throw new Error('Company or Position does not exist');
   }

   return result.position_id;
};

/**
 * Helper function to get location ID by city and state code
 */
const getLocationId = async (locationStr: string) => {
   const [city, state_code] = locationStr.split(',').map(s => s.trim());

   const [result] = await db
      .select({ location_id: location.id })
      .from(location)
      .where(
         and(eq(location.city, city!), eq(location.state_code, state_code!))
      )
      .limit(1);

   if (!result?.location_id) {
      throw new Error('Location does not exist');
   }

   return result.location_id;
};

/**
 * Helper function to build where clause from query parameters
 */
const buildWhereClause = (params: SubmissionQueryParams) =>
   and(
      // Company filter - if multiple companies provided, match any of them
      maybe(params?.company, (companies: string[]) =>
         or(...companies.map((name: string) => eq(company.name, name)))
      ),
      // Position filter - if multiple positions provided, match any of them using fuzzy search
      maybe(params?.position, (positions: string[]) =>
         or(...positions.map((pos: string) => querySQL(position.name, pos)))
      ),
      //
      // // Location filter - match city and state code
      maybe(params?.location, (locations: string[]) =>
         or(
            ...locations.map((loc: string) =>
               and(
                  eq(location.city, loc.split(', ')[0]!),
                  eq(location.state_code, loc.split(', ')[1]!)
               )
            )
         )
      ),
      //
      // // Year filter - match any of the provided years
      maybe(params?.year, ([start_year, end_year]: number[]) =>
         or(
            ...Array.from({ length: end_year! - start_year! + 1 }, (_, i) =>
               eq(submission.year, start_year! + i)
            )
         )
      ),

      // Coop year filter
      maybe(params?.coop_year, (coop_years: string[]) =>
         or(
            ...coop_years.map((coop_year: string) =>
               eq(submission.coop_year, coop_year as any)
            )
         )
      ),

      // Coop cycle filter
      maybe(params?.coop_cycle, (coop_cycles: string[]) =>
         or(
            ...coop_cycles.map((cycle: string) =>
               eq(submission.coop_cycle, cycle as any)
            )
         )
      ),

      // Program level filter - single value
      maybe(params?.program_level, (level: string) =>
         eq(submission.program_level, level as any)
      )
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
   const { pageIndex, pageSize, distinct, sort, sortField } = input;
   const sortColumn = getSortColumn(sortField);
   const order = sort === 'ASC' ? asc(sortColumn) : desc(sortColumn);

   const whereClause = buildWhereClause(input);

   try {
      //@ts-ignore: selectDistinctOn type issue
      const subQuerySelect = (distinct: boolean, schema: any) =>
         distinct
            ? db.selectDistinctOn(
                 [
                    company.name,
                    position.name,
                    submission.compensation,
                    submission.program_level
                 ],
                 schema
              )
            : db.select(schema);

      const subQuery = subQuerySelect(!!distinct, {
         year: submission.year,
         coop_year: submission.coop_year,
         coop_cycle: submission.coop_cycle,
         program_level: submission.program_level,
         work_hours: submission.work_hours,
         compensation: submission.compensation,
         other_compensation: submission.other_compensation,
         details: submission.details,
         company: sql`${company.name}`.as('company_name'),
         position: sql`${position.name}`.as('position_name'),
         location_city: location.city,
         location_state: location.state,
         location_state_code: location.state_code
      })
         .from(submission)
         .leftJoin(position, eq(submission.position_id, position.id))
         .leftJoin(location, eq(submission.location_id, location.id))
         .leftJoin(company, eq(position.company_id, company.id))
         .where(whereClause)
         .as('subQuery');

      const count = await db.$count(subQuery);
      const data = await db
         .select()
         .from(subQuery)
         .orderBy(order)
         .offset((pageIndex - 1) * pageSize)
         .limit(pageSize);

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
      try {
         const position_id = await getPositionId(input.company, input.position);
         const location_id = await getLocationId(input.location);

         const toBeInserted = {
            position_id,
            location_id,
            coop_cycle: input.coop_cycle,
            coop_year: input.coop_year,
            year: input.year,
            program_level: input.program_level,
            work_hours: input.work_hours,
            compensation: input.compensation,
            other_compensation: input.other_compensation,
            details: input.details,
            owner_id: null
         };

         const [result] = await db
            .insert(submission)
            //@ts-ignore: type issue with enum
            .values(toBeInserted)
            .returning({ id: submission.id, owner_id: submission.owner_id });

         return {
            id: result!.id,
            owner_id: result!.owner_id,
            message: 'Added position successfully'
         };
      } catch (error: any) {
         console.error('Error creating submission:', error);
         throw new Error(error.message || 'Failed to create submission');
      }
   }
);

/**
 * Update an existing co-op submission
 */
export const updateSubmission = os.submission.update.handler(
   async ({ input }) => {
      const position_id = await getPositionId(input.company, input.position);
      const location_id = await getLocationId(input.location);

      const toBeUpdated = {
         position_id,
         location_id,
         coop_cycle: input.coop_cycle,
         coop_year: input.coop_year,
         year: input.year,
         program_level: input.program_level,
         work_hours: input.work_hours,
         compensation: input.compensation,
         other_compensation: input.other_compensation,
         details: input.details
      };

      return await db
         .update(submission)
         .set(toBeUpdated)
         //@ts-ignore: type issue with enum
         .where(and(eq(submission.id, input.id), isNull(submission.owner_id)))
         .returning()
         .then(([value]) => ({
            id: value?.id!,
            message: 'Updated position successfully'
         }))
         .catch(error => {
            console.error('Error updating submission:', error);
            throw new Error(error.message || 'Failed to update submission');
         });
   }
);

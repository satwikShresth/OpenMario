// routes/submission.routes.ts
import { Hono } from 'hono';
import { validator as zValidator } from 'hono-openapi/zod';
import { company, db, location, position, submission } from '#db';
import {
   type SubmissionAggregate,
   SubmissionAggregateSchema,
   type SubmissionAggregateUpdate,
   SubmissionCreateResponseSchema,
   SubmissionInsert,
   SubmissionListResponseSchema,
   type SubmissionMeIds,
   SubmissionMeIdsSchema,
   SubmissionMeResponseSchema,
   type SubmissionQuery,
   SubmissionQuerySchema,
   SubmissionUpdateResponseSchema,
} from '#models';
import { validateUser } from '#/middleware/validation.middleware.ts';
import { and, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import {
   DescribeSubmissionRoute,
   getLoationId,
   getPositionId,
   transformQuery,
} from './submission.routes.helpers.ts';

export default () => {
   const router = new Hono().basePath('/submissions');

   /**
    * GET /submissions
    * Retrieve co-op submission records with pagination and filtering
    */
   router
      .get(
         '/',
         DescribeSubmissionRoute({
            description: 'Retrieve co-op submission records with pagination and filtering',
            responses: {
               '200': {
                  description: 'Paginated list of submission records',
                  schema: SubmissionListResponseSchema,
               },
            },
         }),
         zValidator('query', SubmissionQuerySchema),
         async (c) => {
            const queryRaw = c.req.valid('query') as SubmissionQuery;
            const { distinct, skip, limit, query, pageIndex } = transformQuery(queryRaw);

            //@ts-ignore: I duuno why
            const subQuerySelect = (distinct: boolean, schema: any) =>
               distinct
                  ? db.selectDistinctOn(
                     [
                        company.name,
                        position.name,
                        submission.compensation,
                        submission.program_level,
                     ],
                     schema,
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
               position: position.name,
               location_city: location.city,
               location_state: location.state,
               location_state_code: location.state_code,
            })
               .from(submission)
               .leftJoin(position, eq(submission.position_id, position.id))
               .leftJoin(location, eq(submission.location_id, location.id))
               .leftJoin(company, eq(position.company_id, company.id))
               .where(and(...(query?.filter(Boolean) || [])))
               .as('subQuery');

            try {
               const count = await db.$count(subQuery);
               const data = await db
                  .select()
                  .from(subQuery)
                  .offset(skip!)
                  .limit(limit!);

               return c.json({ pageIndex, pageSize: limit, count, data }, 200);
            } catch (error) {
               //@ts-ignore: I duuno why
               return c.json({ message: error.message }, 409);
            }
         },
      )
      /**
       * POST /submissions
       * Create new co-op submission(s)
       */
      .post(
         '/',
         DescribeSubmissionRoute({
            description: 'Create new co-op submission(s)',
            responses: {
               '200': {
                  description: 'Successfully created submission',
                  schema: SubmissionCreateResponseSchema,
               },
               '201': {
                  description: 'Successfully created submission',
                  schema: SubmissionCreateResponseSchema,
               },
            },
         }),
         zValidator('json', SubmissionAggregateSchema),
         async (c) => {
            const user_id = c.get('jwtPayload')?.user_id || null;
            const insertData = c.req.valid('json') as SubmissionAggregate;

            try {
               const toBeInserted: SubmissionInsert = {
                  position_id: await getPositionId(insertData),
                  location_id: await getLoationId(insertData),
                  coop_cycle: insertData.coop_cycle,
                  coop_year: insertData.coop_year,
                  year: insertData.year,
                  program_level: insertData.program_level,
                  work_hours: insertData.work_hours,
                  compensation: insertData.compensation,
                  other_compensation: insertData.other_compensation,
                  details: insertData.details,
                  owner_id: user_id,
               };

               const result = await db
                  .insert(submission)
                  //@ts-ignore: I duuno why
                  .values(toBeInserted)
                  .returning();

               const { id, owner_id } = result[0];
               return c.json(
                  { id, owner_id, message: 'Added position successfully' },
                  201,
               );
            } catch (error) {
               //@ts-ignore: I duuno why
               return c.json({ message: error.message }, 409);
            }
         },
      )
      /**
       * PATCH /submissions
       * Update an existing co-op submission
       */
      .patch(
         '/',
         DescribeSubmissionRoute({
            description: 'Update an existing co-op submission',
            responses: {
               '201': {
                  description: 'Successfully updated submission',
                  schema: SubmissionUpdateResponseSchema,
               },
            },
         }),
         zValidator('json', SubmissionAggregateSchema),
         async (c) => {
            const user_id = c.get('jwtPayload')?.user_id || null;
            const updateData = c.req.valid('json') as SubmissionAggregateUpdate;

            try {
               const toBeUpdated: SubmissionInsert = {
                  id: updateData.id,
                  position_id: await getPositionId(updateData),
                  location_id: await getLoationId(updateData),
                  coop_cycle: updateData.coop_cycle,
                  coop_year: updateData.coop_year,
                  year: updateData.year,
                  program_level: updateData.program_level,
                  work_hours: updateData.work_hours,
                  compensation: updateData.compensation,
                  other_compensation: updateData.other_compensation,
                  details: updateData.details,
               };

               await db
                  .update(submission)
                  .set(toBeUpdated)
                  .where(
                     and(
                        eq(submission.id, toBeUpdated.id!),
                        or(
                           isNull(submission.owner_id),
                           eq(submission.owner_id, user_id),
                        ),
                     ),
                  )
                  .returning();

               return c.json({ message: 'Updated position successfully' }, 201);
            } catch (error) {
               //@ts-ignore: I duuno why
               return c.json({ message: error.message }, 409);
            }
         },
      );

   /**
    * GET /submissions/me
    * Retrieve all co-op submissions owned by the authenticated user
    */
   router.get(
      '/me',
      DescribeSubmissionRoute({
         description: 'Retrieve all co-op submissions owned by the authenticated user',
         responses: {
            '200': {
               description: "List of user's submissions",
               schema: SubmissionMeResponseSchema,
            },
         },
      }),
      validateUser,
      zValidator('query', SubmissionMeIdsSchema),
      async (c) => {
         const { ids } = c.req.valid('query') as SubmissionMeIds;
         const user_id = c.get('jwtPayload')?.user_id;

         try {
            if (ids && ids?.length > 0) {
               await db
                  .update(submission)
                  .set({ owner_id: user_id })
                  .where(
                     and(inArray(submission.id, ids!), isNull(submission.owner_id)),
                  );
            }

            const data = await db
               .select({
                  id: submission.id,
                  owner_id: submission.owner_id,
                  year: submission.year,
                  coop_year: submission.coop_year,
                  coop_cycle: submission.coop_cycle,
                  program_level: submission.program_level,
                  work_hours: submission.work_hours,
                  compensation: submission.compensation,
                  other_compensation: submission.other_compensation,
                  details: submission.details,
                  company: company.name,
                  position: position.name,
                  location_city: location.city,
                  location_state: location.state,
                  location_state_code: location.state_code,
                  location: sql`CONCAT(${location.city}, ', ', ${location.state_code})`,
               })
               .from(submission)
               .innerJoin(position, eq(submission.position_id, position.id))
               .innerJoin(location, eq(submission.location_id, location.id))
               .innerJoin(company, eq(position.company_id, company.id))
               .where(eq(submission.owner_id, user_id));

            return c.json({ data }, 200);
         } catch (error) {
            //@ts-ignore: I duuno why
            return c.json({ message: error.message }, 409);
         }
      },
   );

   return router;
};

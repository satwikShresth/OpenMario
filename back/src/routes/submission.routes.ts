//routes/submission.routes.ts
import { Response, Router } from 'express';
import { company, db, location, position, submission } from '#db';
import {
   paramsIdSchema,
   RequestParamsId,
   type SubmissionAggregate,
   SubmissionAggregateSchema,
   SubmissionInsert,
   SubmissionQuery,
   SubmissionQuerySchema,
} from '#models';
import { zodBodyValidator, zodParamsValidator, zodQueryValidator } from '#/middleware/validation.middleware.ts';
import { and, count, eq, sql } from 'drizzle-orm';

export default () => {
   const router = Router();

   /**
    * GET /submissions
    * @summary Retrieve co-op submission records with pagination and filtering
    * @tags Submissions
    * @param {Boolean} distinct.query - Query prarmer for filtering submission using company
    * @param {array<string>} company.query - Query prarmer for filtering submission using company
    * @param {array<string>} position.query - Query prarmer for filtering submission using position
    * @param {array<string>} location.query - Query prarmer for filtering submission using location
    * @param {array<string>} year.query - Query prarmer for filtering submission using year
    * @param {array<string>} coop_year.query - Query prarmer for filtering submission using coop_year
    * @param {array<string>} coop_cycle.query - Query prarmer for filtering submission using coop_cycle
    * @param {string} program_level.query - Query prarmer for filtering submission using program_level
    * @param {string} skip.query - Query prarmer for offeset
    * @param {string} limit.query - Query prarmer for limit
    * @return {array<SubmissionResponse>} 200 - Success response with paginated submissions
    * @example response - 200 - Example success response
    * {
    *   "skip": 0,
    *   "limit": 100,
    *   "data": [{
    *     "id": "123e4567-e89b-12d3-a456-426614174000",
    *     "year": 2024,
    *     "coop_year": "1st",
    *     "coop_cycle": "Fall/Winter",
    *     "program_level": "Undergraduate",
    *     "work_hours": 40,
    *     "compensation": 45000,
    *     "other_compensation": "Housing stipend",
    *     "details": "Full-stack development role",
    *     "company": "Tech Corp",
    *     "position": "Software Engineer",
    *     "location_city": "Boston",
    *     "location_state": "Massachusetts",
    *     "location_state_code": "MA"
    *   }]
    * }
    * @return {object} 409 - Error response
    * @example response - 409 - Example error response
    * {
    *   "message": "Failed to retrieve submissions"
    * }
    */
   router
      .route('/')
      .get(
         zodQueryValidator(SubmissionQuery),
         async (req: RequestParamsId, res: Response) => {
            const { distinct, skip, limit, query, pageIndex } = req?.validated
               ?.query as SubmissionQuery;

            console.log(distinct);
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
               company: sql`${company.name}`.as('subQuery'),
               position: position.name,
               location_city: location.city,
               location_state: location.state,
               location_state_code: location.state_code,
            })
               .from(submission)
               .innerJoin(position, eq(submission.position_id, position.id))
               .innerJoin(location, eq(submission.location_id, location.id))
               .innerJoin(company, eq(position.company_id, company.id))
               .where(and(...(query?.filter(Boolean) || [])))
               .as('subQuery');

            const count = await db.$count(subQuery);

            return await db
               .select()
               .from(subQuery)
               .offset(skip!)
               .limit(limit!)
               .then((data) => res.status(200).json({ pageIndex, pageSize: limit, count, data }))
               .catch(({ message }) => res.status(409).json({ message }));
         },
      )
      /**
       * POST /submissions
       * @summary Create new co-op submission(s)
       * @tags Submissions
       * @param {SubmissionAggregate} request.body.required - Submission data
       * @return {object} 201 - Successfully created submission
       * @example response - 201 - Success response example
       * {
       *   "message": "Added positions successfully"
       * }
       * @return {object} 409 - Error response
       * @example response - 409 - Error response example
       * {
       *   "message": "Failed to add positions",
       *   "detail": "Company or Position does not exist"
       * }
       */
      .post(
         zodBodyValidator(SubmissionAggregateSchema),
         async (req: RequestParamsId, res: Response) => {
            const insertData = req?.validated?.body! as SubmissionAggregate;
            const toBeInserted: SubmissionInsert = {};

            try {
               toBeInserted.position_id = await db
                  .select({ position_id: position.id })
                  .from(position)
                  .innerJoin(company, eq(position.company_id, company.id))
                  .where(
                     and(
                        eq(company.name, insertData.company),
                        eq(position.name, insertData.position),
                     ),
                  )
                  .limit(1)
                  .then((values) => {
                     const position_id = values[0]?.position_id!;
                     if (!position_id) {
                        throw new Error('Comapny or Position does not exist');
                     }
                     return position_id;
                  })
                  .catch(({ message }) => {
                     console.log(message);
                     throw new Error(message);
                  });

               toBeInserted.location_id = await db
                  .select({ location_id: location.id })
                  .from(location)
                  .where(
                     and(
                        eq(location.city, insertData.location.split(',')[0].trim()),
                        eq(
                           location.state_code,
                           insertData.location.split(',')[1].trim(),
                        ),
                     ),
                  )
                  .limit(1)
                  .then((values) => {
                     const location_id = values[0]?.location_id!;
                     if (!location_id) throw new Error('Location does not exist');
                     return location_id;
                  })
                  .catch(({ message }) => {
                     console.log(message);
                     throw new Error(message);
                  });

               toBeInserted.coop_cycle = insertData.coop_cycle;
               toBeInserted.coop_year = insertData.coop_year;
               toBeInserted.year = insertData.year;
               toBeInserted.program_level = insertData.program_level;
               toBeInserted.work_hours = insertData.work_hours;
               toBeInserted.compensation = insertData.compensation;
               toBeInserted.other_compensation = insertData.other_compensation;
               toBeInserted.details = insertData.details;
            } catch ({ message }: any) {
               return res.status(409).json({ message });
            }

            return await db
               .insert(submission)
               .values(toBeInserted)
               .returning()
               .then(([{ id }]) =>
                  res
                     .status(201)
                     .json({ id, message: 'Added positions successfully' })
               )
               .catch(({ message }) =>
                  res
                     .status(409)
                     .json({ message: 'Failed to add positions', detail: message })
               );
         },
      );

   router.route('/:id')
      .all(zodParamsValidator(paramsIdSchema));
   return router;
};

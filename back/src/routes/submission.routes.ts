//routes/submission.routes.ts
import { Response, Router } from 'express';
import { company, db, location, position, submission } from '#db';
import {
   RequestParamsId,
   type SubmissionAggregate,
   SubmissionAggregateSchema,
   SubmissionInsert,
   SubmissionQuery,
   SubmissionQuerySchema,
} from '#models';
import { zodBodyValidator, zodQueryValidator } from '#/middleware/validation.middleware.ts';
import { and, eq } from 'drizzle-orm';

export default () => {
   const router = Router();

   /**
    * GET /submissions
    * @summary Retrieve co-op submission records with pagination and filtering
    * @tags Submissions
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
   router.route('/')
      .get(
         zodQueryValidator(SubmissionQuery),
         async (req: RequestParamsId, res: Response) => {
            const { skip, limit, query } = req?.validated?.query as SubmissionQuery;
            return await db
               .select({
                  id: submission.id,
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
               })
               .from(submission)
               .innerJoin(position, eq(submission.position_id, position.id))
               .innerJoin(location, eq(submission.location_id, location.id))
               .innerJoin(company, eq(position.company_id, company.id))
               .where(and(...(query?.filter(Boolean) || [])))
               .offset(skip!)
               .limit(limit!)
               .then((data) => res.status(200).json({ skip, limit, data }))
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
            const toBeInserted = [];
            try {
               toBeInserted.push(
                  ...await Promise
                     .all(
                        insertData
                           .positions
                           .map(async (position_) => {
                              const position_id = await db
                                 .select({ position_id: position.id })
                                 .from(position)
                                 .innerJoin(company, eq(position.company_id, company.id))
                                 .where(and(
                                    eq(company.name, position_.company),
                                    eq(position.name, position_.position),
                                 ))
                                 .limit(1)
                                 .then((values) => {
                                    const position_id = values[0]?.position_id!;
                                    if (!position_id) throw new Error('Comapny or Position does not exist');
                                    return position_id;
                                 })
                                 .catch(({ message }) => {
                                    console.log(message);
                                    throw new Error(message);
                                 });

                              const location_id = await db.select({ location_id: location.id })
                                 .from(location)
                                 .where(
                                    and(
                                       eq(location.city, position_.location.split(',')[0].trim()),
                                       eq(location.state_code, position_.location.split(',')[1].trim()),
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

                              return {
                                 position_id,
                                 location_id,
                                 coop_cycle: insertData.coop_cycle,
                                 coop_year: insertData.coop_year,
                                 year: insertData.year,
                                 program_level: insertData.program_level,
                                 work_hours: position_.work_hours,
                                 compensation: position_.compensation,
                                 other_compensation: position_.other_compensation,
                                 details: position_.details,
                              } satisfies SubmissionInsert;
                           }),
                     ),
               );
            } catch ({ message }: any) {
               return res.status(409).json({ message });
            }

            return await db
               .insert(submission)
               .values(toBeInserted)
               .returning()
               .then((_) => res.status(201).json({ message: 'Added positions successfully' }))
               .catch(({ message }) => {
                  return res.status(409).json({ message: 'Failed to add positions', detail: message });
               });
         },
      );

   //router.route('/:id')
   //   .all(
   //      zodParamsValidator(paramsIdSchema),
   //   )
   //   .get(
   //      async (req: RequestParamsId, res: Response) => {
   //         const _validatedId = req?.validated?.params?.id!;
   //      },
   //   )
   //   .put(
   //      zodBodyValidator(SubmissionAggregateUpdateSchema),
   //      async (req: RequestParamsId, res: Response) => {
   //         const _validatedId = req?.validated?.params?.id!;
   //         const _updateData = req?.validated?.body! as SubmissionAggregate;
   //      },
   //   );
   return router;
};

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

   router.route('/')
      .get(
         zodQueryValidator(SubmissionQuerySchema),
         async (req: RequestParamsId, res: Response) => {
            const { skip = 0, limit = 100, queries } = req?.validated?.query as SubmissionQuery;
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
               .where(and(...queries))
               .offset(skip)
               .limit(limit)
               .then((data) => res.status(200).json({ skip, limit, data }))
               .catch(({ message }) => res.status(409).json({ message }));
         },
      )
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

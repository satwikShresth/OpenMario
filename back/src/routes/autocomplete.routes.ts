import { Request, Response, Router } from 'express';
import { and, eq, ilike, or } from 'drizzle-orm';
import { zodQueryValidator } from '#/middleware/validation.middleware.ts';
import { z } from 'zod';
import { company, db, location, position } from '#db';
import { RequestParamsId } from '#models';

export default () => {
   const router = Router();

   router.get(
      '/company',
      zodQueryValidator(
         z.object(
            {
               company_name: z.string().optional(),
            },
         )
            .transform(
               ({ company_name }) => company_name !== undefined ? ilike(company.name, `%${company_name.trim()}%`) : undefined,
            ),
      ),
      async (req: RequestParamsId, res: Response) => {
         const query = req?.validated?.query;

         return await db
            .select({ name: company.name })
            .from(company)
            .where(query)
            .then((results) => res.status(200).json(results.map((item) => item.name)))
            .catch(({ message }) => res.staus(409).json({ message }));
      },
   );

   router.get(
      '/position',
      zodQueryValidator(
         z.object(
            {
               company_name: z.string({ required_error: 'Comapny Name is Requried' }),
               position_name: z.string().optional(),
            },
         )
            .transform(
               ({ company_name, position_name }) => [
                  eq(company.name, company_name.trim()),
                  position_name !== undefined ? ilike(position.name, `%${position_name.trim()}%`) : undefined,
               ],
            ),
      ),
      async (req: Request, res: Response) => {
         const queries = req?.validated?.query;

         return await db
            .select({ name: position.name })
            .from(position)
            .innerJoin(company, eq(position.company_id, company.id))
            .where(and(...queries))
            .then((results) => res.status(200).json(results.map((item) => item.name)))
            .catch(({ message }) => res.staus(409).json({ message }));
      },
   );

   router.get(
      '/location',
      zodQueryValidator(
         z.object(
            {
               company_name: z.string({ required_error: 'Comapny Name is Requried' }),
               position_name: z.string().optional(),
            },
         )
            .transform(
               ({ company_name, position_name }) => [
                  eq(company.name, company_name.trim()),
                  position_name !== undefined ? ilike(position.name, `%${position_name.trim()}%`) : undefined,
               ],
            ),
      ),
      async (req: Request, res: Response) => {
         const queries = req?.validated?.query;

         return await db
            .select()
            .from(location)
            .where(or(...queries))
            .then((results) => res.status(200).json(results.map((item) => `${item.city}, ${item.state_code}`)))
            .catch(({ message }) => res.staus(409).json({ message }));
      },
   );

   return router;
};

import { Request, Response, Router } from 'express';
import { and, Column, eq, or, sql } from 'drizzle-orm';
import { zodQueryValidator } from '#/middleware/validation.middleware.ts';
import { z } from 'zod';
import { company, db, location, position } from '#db';
import { RequestParamsId } from '#models';

const querySQL = (column: Column, matchValue?: string) =>
   matchValue &&
   sql`(
    to_tsvector('english', ${column}) @@ to_tsquery('english', ${
      matchValue
         .trim()
         .split(/\s+/)
         .map((term) => `${term}:*`)
         .join(' & ')
   })
    OR ${column} % ${matchValue.trim()}
    OR ${column} ILIKE ${matchValue.trim().toLowerCase().split('').join('%') + '%'}
  )`;

const orderSQL = (column: Column, matchValue?: string) =>
   matchValue &&
   sql`(
    (CASE WHEN lower(${column}) ILIKE ${
      matchValue
         .trim()
         .toLowerCase()
         .split('')
         .reduce((pattern, char, idx) => idx === 0 ? char + '%' : pattern + ' ' + char + '%', '')
   } THEN 1 ELSE 0 END) * 10000
    + similarity(${column}, ${matchValue.trim()})
  ) DESC`;

const queryStringPreprocess = () =>
   z.preprocess(
      (name) => String(name).trim().replace(/[^a-zA-Z\s]/g, ''),
      z.string({ required_error: 'Need to have a query' }).min(3, 'Should have minimum 3 characters'),
   );

export default () => {
   const router = Router();

   router.get(
      '/company',
      zodQueryValidator(
         z.object({ comp: queryStringPreprocess() })
            .transform(
               ({ comp }) => ({
                  query: querySQL(company.name, comp),
                  order: orderSQL(company.name, comp),
               }),
            ),
      ),
      async (req: RequestParamsId, res: Response) => {
         const { query, order } = req?.validated?.query;

         return await db
            .select({ name: company.name })
            .from(company)
            .where(query)
            .orderBy(order)
            .then((results) => res.status(200).json(results.map((item) => item.name)))
            .catch(({ message }) => res.staus(409).json({ message }));
      },
   );

   router.get(
      '/position',
      zodQueryValidator(
         z.object(
            {
               comp: z.string({ required_error: 'Comapny Name is Requried' }),
               pos: z.preprocess(
                  (name) => name && String(name).trim().replace(/[^a-zA-Z\s]/g, ''),
                  z.string().min(3, 'Should have minimum 3 characters').optional(),
               ),
            },
         )
            .transform(
               ({ comp, pos }) => ({
                  queries: [eq(company.name, comp.trim()), querySQL(position.name, pos)],
                  order: orderSQL(position.name, pos),
               }),
            ),
      ),
      async (req: Request, res: Response) => {
         const { queries, order } = req?.validated?.query;

         return await db
            .select({ name: position.name })
            .from(position)
            .innerJoin(company, eq(position.company_id, company.id))
            .where(and(...queries))
            .orderBy(order)
            .then((results) => res.status(200).json(results.map((item) => item.name)))
            .catch(({ message }) => res.staus(409).json({ message }));
      },
   );

   router.get(
      '/location',
      zodQueryValidator(
         z.object({ loc: queryStringPreprocess() })
            .transform(
               ({ loc }) => ({
                  queries: [
                     querySQL(location.city, loc),
                     querySQL(location.state, loc),
                     querySQL(location.state_code, loc),
                  ],
                  order: sql`GREATEST(
                     similarity(${location.city}, ${loc.trim()}),
                     similarity(${location.state}, ${loc.trim()}),
                     similarity(${location.state_code}, ${loc.trim()})
                  ) DESC`,
               }),
            ),
      ),
      async (req: Request, res: Response) => {
         const { queries, order } = req?.validated?.query;

         return await db
            .select()
            .from(location)
            .where(or(...queries))
            .orderBy(order)
            .then((results) => res.status(200).json(results.map((item) => `${item.city}, ${item.state_code}`)))
            .catch(({ message }) => res.staus(409).json({ message }));
      },
   );

   return router;
};

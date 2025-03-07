import { Request, Response, Router } from 'express';
import { and, eq, or, sql } from 'drizzle-orm';
import { zodQueryValidator } from '#/middleware/validation.middleware.ts';
import { company, db, location, position } from '#db';
import { z } from 'zod';
import { orderSQL, querySQL, RequestParamsId } from '#models';

const queryStringPreprocess = () =>
   z.preprocess(
      (name) => String(name).trim().replace(/[^a-zA-Z\s]/g, ''),
      z.string({ required_error: 'Need to have a query' }).min(3, 'Should have minimum 3 characters'),
   );

export default () => {
   const router = Router();
   const limit = 25;

   /**
    * GET /autocomplete/company
    * @summary Search for companies by name with fuzzy matching
    * @tags Search
    * @param {string} comp.query.required - Search parameters for company name
    * @return {array<string>} 200 - List of matching company names
    * @example response - 200 - Example success response
    * [
    *   "Apple Inc",
    *   "Apple Technologies",
    *   "Appleseed Solutions"
    * ]
    * @return {object} 409 - Error response
    * @example response - 409 - Example error response
    * {
    *   "message": "Database query failed"
    * }
    */
   router.get(
      '/company',
      zodQueryValidator(
         z.object({ comp: queryStringPreprocess() })
            .transform(
               ({ comp }: { comp: string }) => ({
                  query: querySQL(company.name, comp),
                  order: orderSQL(company.name, comp),
               }),
            ),
      ),
      async (req: RequestParamsId, res: Response) => {
         const { query, order } = req?.validated?.query;

         return await db
            .select({ id: company.id, name: company.name })
            .from(company)
            .where(query)
            .orderBy(order)
            .limit(limit)
            .then((results) => {
               console.log(results);
               return results;
            })
            .then((results) => res.status(200).json(results))
            .catch(({ message }) => res.status(409).json({ message }));
      },
   );

   /**
    * GET /autocomplete/position
    * @summary Search for positions within a specific company
    * @tags Search
    * @param {string} comp.query.required - Company name and optional position search term
    * @param {string} pos.query.required - Company name and optional position search term
    * @return {array<string>} 200 - List of matching position titles
    * @example response - 200 - Example success response
    * [
    *   "Software Engineer",
    *   "Senior Software Engineer",
    *   "Software Engineering Intern"
    * ]
    * @return {object} 409 - Error response
    * @example response - 409 - Example error response
    * {
    *   "message": "Database query failed"
    * }
    */
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
                  queries: [comp !== '*' ? eq(company.name, comp.trim()) : undefined, querySQL(position.name, pos)],
                  order: orderSQL(position.name, pos),
               }),
            ),
      ),
      async (req: Request, res: Response) => {
         const { queries, order } = req?.validated?.query;

         return await db
            .select({ id: position.id, name: position.name })
            .from(position)
            .innerJoin(company, eq(position.company_id, company.id))
            .where(and(...queries))
            .limit(limit)
            .then((results) => res.status(200).json(results))
            .catch(({ message }) => res.status(409).json({ message }));
      },
   );

   /**
    * GET /autocomplete/location
    * @summary Search for locations with fuzzy matching across city, state, and state code
    * @tags Search
    * @param {string} loc.query.required - Search parameters for location
    * @return {array<string>} 200 - List of matching locations in "City, State_Code" format
    * @example response - 200 - Example success response
    * [
    *   "Boston, MA",
    *   "Cambridge, MA",
    *   "Waltham, MA"
    * ]
    * @return {object} 409 - Error response
    * @example response - 409 - Example error response
    * {
    *   "message": "Database query failed"
    * }
    */
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
            .limit(limit)
            .orderBy(order)
            .then((results) => res.status(200).json(results.map((item) => ({ id: item.id, name: `${item.city}, ${item.state_code}` }))))
            .catch(({ message }) => res.status(409).json({ message }));
      },
   );

   return router;
};

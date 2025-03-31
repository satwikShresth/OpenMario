import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq, or, sql } from 'drizzle-orm';
import { company, db, location, position } from '#db';
import { z } from 'zod';
import { orderSQL, querySQL } from '#models';

const queryStringPreprocess = () =>
   z.preprocess(
      (name) =>
         String(name)
            .trim()
            .replace(/[^a-zA-Z\s]/g, ''),
      z
         .string({ required_error: 'Need to have a query' })
         .min(3, 'Should have minimum 3 characters'),
   );

export default () => {
   const router = new Hono();
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
      zValidator(
         'query',
         z
            .object({ comp: queryStringPreprocess() })
            .transform(({ comp }: { comp: string }) => ({
               query: querySQL(company.name, comp),
               order: orderSQL(company.name, comp),
            })),
      ),
      async (c) => {
         const { query, order } = c.req.valid('query');

         return await db
            .select({ id: company.id, name: company.name })
            .from(company)
            .where(query)
            //@ts-ignore: I duuno why
            .orderBy(order)
            .limit(limit)
            .then((results) => c.json(results, 200))
            .catch(({ message }) => c.json({ message }, 409));
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
      zValidator(
         'query',
         z
            .object({
               comp: z.string({ required_error: 'Company Name is Required' }),
               pos: z.preprocess(
                  (name) =>
                     name &&
                     String(name)
                        .trim()
                        .replace(/[^a-zA-Z\s]/g, ''),
                  z.string().min(3, 'Should have minimum 3 characters').optional(),
               ),
            })
            .transform(({ comp, pos }) => ({
               queries: [
                  comp !== '*' ? eq(company.name, comp.trim()) : undefined,
                  querySQL(position.name, pos),
               ],
               order: orderSQL(position.name, pos),
            })),
      ),
      async (c) => {
         const { queries, order } = c.req.valid('query');

         return await db
            .selectDistinctOn([position.name], {
               id: position.id,
               name: position.name,
            })
            .from(position)
            .innerJoin(company, eq(position.company_id, company.id))
            .where(and(...queries))
            .limit(limit)
            .then((results) => c.json(results, 200))
            .catch(({ message }) => c.json({ message }, 409));
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
      zValidator(
         'query',
         z
            .object({ loc: queryStringPreprocess() })
            .transform(({ loc }) => ({
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
            })),
      ),
      async (c) => {
         const { queries, order } = c.req.valid('query');

         return await db
            .select()
            .from(location)
            .where(or(...queries))
            .limit(limit)
            .orderBy(order)
            .then((results) =>
               c.json(
                  results.map((item) => ({
                     id: item.id,
                     name: `${item.city}, ${item.state_code}`,
                  })),
                  200,
               )
            )
            .catch(({ message }) => c.json({ message }, 409));
      },
   );

   return router;
};

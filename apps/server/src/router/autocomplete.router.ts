import { os } from './context';
import { db, company, position, location } from '@/db';
import { and, eq, or, sql } from 'drizzle-orm';
import { querySQL, orderSQL } from './helpers';

const LIMIT = 100;

/**
 * Search for companies by name with fuzzy matching
 */
export const searchCompany = os.autocomplete.company.handler(
   async ({ input: { comp } }) => {
      const query = querySQL(company.name, comp);
      const order = orderSQL(company.name, comp);

      return await db
         .select({ id: company.id, name: company.name })
         .from(company)
         .where(query)
         //@ts-expect-error orderBy type issue with sql template
         .orderBy(order)
         .limit(LIMIT)
         .then(results => results)
         .catch(error => {
            console.error('Error searching companies:', error);
            throw new Error(error.message || 'Failed to search companies');
         });
   }
);

/**
 * Search for positions within a specific company
 */
export const searchPosition = os.autocomplete.position.handler(
   async ({ input: { comp, pos } }) => {
      const queries = [
         comp !== '*' ? eq(company.name, comp.trim()) : undefined,
         querySQL(position.name, pos)
      ];
      const order = orderSQL(position.name, pos);

      return await db
         .select({
            id: position.id,
            name: position.name
         })
         .from(position)
         .innerJoin(company, eq(position.company_id, company.id))
         .where(and(...queries))
         //@ts-expect-error orderBy type issue with sql template
         .orderBy(order)
         .limit(LIMIT)
         .then(results => {
            // Remove duplicates by position name, keeping the highest ranked one
            const seen = new Set<string>();
            return results.filter(item => {
               if (seen.has(item.name)) {
                  return false;
               }
               seen.add(item.name);
               return true;
            });
         })
         .catch(error => {
            console.error('Error searching positions:', error);
            throw new Error(error.message || 'Failed to search positions');
         });
   }
);

/**
 * Search for locations with fuzzy matching across city, state, and state code
 */
export const searchLocation = os.autocomplete.location.handler(
   async ({ input: { loc } }) => {
      const queries = [
         querySQL(location.city, loc),
         querySQL(location.state, loc),
         querySQL(location.state_code, loc)
      ];

      const order = sql`
      GREATEST(
         similarity(${location.city}, ${loc.trim()}),
         similarity(${location.state}, ${loc.trim()}),
         similarity(${location.state_code}, ${loc.trim()})
      ) DESC`;

      return await db
         .select()
         .from(location)
         .where(or(...queries))
         .limit(LIMIT)
         .orderBy(order)
         .then(results =>
            results.map(item => ({
               id: item.id,
               name: `${item.city}, ${item.state_code}`
            }))
         )
         .catch(error => {
            console.error('Error searching locations:', error);
            throw new Error(error.message || 'Failed to search locations');
         });
   }
);

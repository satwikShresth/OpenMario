import { type Column, type SQL, sql } from 'drizzle-orm';

/**
 * Helper function to create fuzzy search SQL queries
 * Uses full-text search, similarity and pattern matching
 */
export const querySQL = (
   column: Column,
   matchValue?: string
): SQL | undefined =>
   matchValue
      ? sql`(
          to_tsvector('english', ${column}) @@ plainto_tsquery('english', ${matchValue.trim()})
          OR ${column} % ${matchValue.trim()}
          OR ${column} ILIKE ${matchValue.trim().toLowerCase().split('').join('%') + '%'}
        )`
      : undefined;

/**
 * Helper function to create ordering SQL for fuzzy search results
 * Prioritizes exact matches and then similarity
 */
export const orderSQL = (
   column: Column,
   matchValue?: string
): SQL | undefined =>
   matchValue
      ? sql`(
        (CASE WHEN lower(${column}) ILIKE ${matchValue
           .trim()
           .toLowerCase()
           .split('')
           .reduce(
              (pattern, char, idx) =>
                 idx === 0 ? char + '%' : pattern + ' ' + char + '%',
              ''
           )} THEN 1 ELSE 0 END) * 10000
        + similarity(${column}, ${matchValue.trim()})
      ) DESC`
      : undefined;

import instructors from './assets/instructors.json' with { type: 'json' };
import * as schema from '../../../src/db/scheduler/schema.ts';
import { db } from '../../../src/db/index.ts';

try {
   console.log(`Inserting ${instructors.length} instructors...`);
   const result = await db
      .insert(schema.instructors)
      .values(instructors)
      .onConflictDoNothing();

   console.log(`Successfully processed instructors insertion.`);
} catch (error) {
   console.error('Error inserting instructors:', error);
   throw error; // Re-throw to handle in the main sequence
}


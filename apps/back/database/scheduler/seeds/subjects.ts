import subjects from './assets/subjects.json' with { type: 'json' };
import * as schema from '../../../src/db/scheduler/schema.ts';
import { db } from '../../../src/db/index.ts';

try {
   // First, insert all colleges and wait for completion
   const colleges = Object.entries(subjects).map(([id, { title }]) => ({
      id,
      name: title,
   }));

   console.log(`Inserting ${colleges.length} colleges...`);
   await db
      .insert(schema.colleges)
      .values(colleges)
      .onConflictDoNothing();

   console.log('College insertion completed.');

   // Next, prepare and insert all subjects
   const subjects_ = Object.entries(subjects)
      .map(([college_id, { subjects }]) =>
         Object.entries(subjects).map(([id, name]) => ({
            id,
            name,
            college_id,
         }))
      )
      .flatMap((item) => item);

   console.log(`Inserting ${subjects_.length} subjects...`);
   await db
      .insert(schema.subjects)
      .values(subjects_)
      .onConflictDoNothing();

   console.log('Subject insertion completed.');
} catch (error) {
   console.error('Error inserting subjects:', error);
   throw error; // Re-throw to handle in the main sequence
}

import instructors from './assets/instructors.json' with { type: 'json' };
import * as schema from '../../../src/db/scheduler/schema.ts';
import { db } from '../../../src/db/index.ts';

export default async () =>
   await db
      .insert(schema.instructors)
      .values(instructors)
      .onConflictDoNothing()
      .catch((error) => console.log(error));

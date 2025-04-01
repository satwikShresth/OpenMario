import subjects from './assets/subjects.json' with { type: 'json' };
import * as schema from '../../../src/db/scheduler/schema.ts';
import { db } from '../../../src/db/index.ts';

export default async () => {
   await db
      .insert(schema.colleges)
      .values(
         Object.entries(subjects).map(([id, { title }]) => ({ id, name: title })),
      ).onConflictDoNothing();

   const subjects_ = Object.entries(subjects)
      .map(([college_id, { subjects }]) =>
         Object.entries(subjects).map(([id, name]) => ({ id, name, college_id }))
      )
      .flatMap((item) => item);

   await db.insert(schema.subjects).values(subjects_).onConflictDoNothing();
};

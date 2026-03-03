import { orpc } from './helpers';
import { subject } from '@openmario/db';
import { asc } from 'drizzle-orm';

export const listSubjectsProcedure = orpc.subjects.list.handler(
   ({ context: { neon } }) =>
      neon
         .select({ id: subject.id, name: subject.name })
         .from(subject)
         .orderBy(asc(subject.id))
);

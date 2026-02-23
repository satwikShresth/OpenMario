import type { z } from 'zod';
import type {
   ProfessorSectionSchema,
   ProfessorListItemSchema,
   ProfessorListQuerySchema,
} from '@openmario/contracts';

export type Section = z.infer<typeof ProfessorSectionSchema>;
export type ProfessorProfile = z.infer<typeof ProfessorListItemSchema>;
export type ProfessorListItem = z.infer<typeof ProfessorListItemSchema>;
export type SortBy = z.infer<typeof ProfessorListQuerySchema>['sort_by'];

export const currentTermId = (): number => {
   const now = new Date();
   const year = now.getFullYear();
   const month = now.getMonth() + 1;
   let term: number;
   if (month <= 3) term = 15;
   else if (month <= 6) term = 25;
   else if (month <= 9) term = 35;
   else term = 45;
   return year * 100 + term;
};

export const termLabel = (termId: number) => {
   const year = Math.floor(termId / 100);
   const code = termId % 100;
   const seasonMap: Record<number, string> = { 15: 'Fall', 25: 'Winter', 35: 'Spring', 45: 'Summer' };
   return `${seasonMap[code] ?? 'Unknown'} ${year}`;
};

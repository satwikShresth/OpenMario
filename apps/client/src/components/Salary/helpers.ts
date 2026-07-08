import type { SubmissionListItem } from '@openmario/contracts';
import type { SubmissionDocument } from '@openmario/meilisearch';
import { INDEX_NAMES } from '@openmario/meilisearch';
import type { SalarySearchSchema } from '@/routes/-validator.ts';

export const toSubmissionListItem = (
   doc: SubmissionDocument
): SubmissionListItem => ({
   year: doc.year,
   coop_year: doc.coop_year,
   coop_cycle: doc.coop_cycle,
   program_level: doc.program_level,
   work_hours: doc.work_hours,
   compensation: doc.compensation,
   other_compensation: doc.other_compensation,
   details: doc.details,
   company: doc.company_name ?? '',
   company_id: doc.company_id,
   position: doc.position_name ?? '',
   position_id: doc.position_id,
   location_city: doc.city ?? '',
   location_state: doc.state ?? '',
   location_state_code: doc.state_code ?? ''
});

export const buildSubmissionMeiliFilter = (query: SalarySearchSchema) => {
   const parts: string[] = [];

   if (query.year?.length === 2) {
      parts.push(`year >= ${query.year[0]} AND year <= ${query.year[1]}`);
   }

   if (query.program_level) {
      parts.push(`program_level = "${query.program_level}"`);
   }

   return parts.length > 0 ? parts.join(' AND ') : undefined;
};

const sortFieldMap = {
   company: 'company_name',
   position: 'position_name',
   compensation: 'compensation',
   year: 'year',
   coop: 'coop_year',
   location: 'city'
} as const;

export const getSubmissionSortIndex = (query: SalarySearchSchema) => {
   const field = sortFieldMap[query.sortField ?? 'compensation'];
   const direction = query.sort === 'ASC' ? 'asc' : 'desc';
   return `${INDEX_NAMES.submissions}:${field}:${direction}`;
};

export const dedupeSubmissions = (
   items: SubmissionListItem[],
   distinct: boolean
) => {
   if (!distinct) return items;

   const seen = new Set<string>();

   return items.filter(item => {
      const key = `${item.company}|${item.position}|${item.compensation}|${item.program_level}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
   });
};

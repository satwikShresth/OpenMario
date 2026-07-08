import type { SubmissionQuery } from '@openmario/contracts';
import type { SubmissionDocument } from '@openmario/meilisearch';
import { INDEX_NAMES } from '@openmario/meilisearch';
import type { MeilisearchService } from '@openmario/meilisearch';

export const toSubmissionListItem = (doc: SubmissionDocument) => ({
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

export const buildSubmissionMeiliFilter = (input: SubmissionQuery) => {
   const parts: string[] = [];

   if (input.year?.length === 2) {
      parts.push(`year >= ${input.year[0]} AND year <= ${input.year[1]}`);
   }

   if (input.program_level) {
      parts.push(`program_level = "${input.program_level}"`);
   }

   if (input.coop_year?.length) {
      parts.push(
         `coop_year IN [${input.coop_year.map(year => `"${year}"`).join(', ')}]`
      );
   }

   if (input.coop_cycle?.length) {
      parts.push(
         `coop_cycle IN [${input.coop_cycle.map(cycle => `"${cycle}"`).join(', ')}]`
      );
   }

   return parts.length > 0 ? parts.join(' AND ') : undefined;
};

export const buildSubmissionMeiliSort = (input: SubmissionQuery) => {
   const direction = input.sort === 'ASC' ? 'asc' : 'desc';
   const fieldMap = {
      company: 'company_name',
      position: 'position_name',
      compensation: 'compensation',
      year: 'year',
      coop: 'coop_year',
      location: 'city'
   } as const;

   const field = fieldMap[input.sortField ?? 'compensation'];
   return [`${field}:${direction}`];
};

export async function searchSubmissions(
   meilisearch: MeilisearchService,
   input: SubmissionQuery & { pageIndex: number; pageSize: number }
) {
   const index = meilisearch.client.index<SubmissionDocument>(
      INDEX_NAMES.submissions
   );
   const filter = buildSubmissionMeiliFilter(input);
   const sort = buildSubmissionMeiliSort(input);
   const { pageIndex, pageSize } = input;

   const result = await index.search(input.search!, {
      filter,
      sort,
      limit: pageSize,
      offset: (pageIndex - 1) * pageSize
   });

   return {
      pageIndex,
      pageSize,
      count: result.totalHits ?? result.estimatedTotalHits ?? result.hits.length,
      data: result.hits.map(toSubmissionListItem)
   };
}

export async function searchSubmissionIds(
   meilisearch: MeilisearchService,
   input: SubmissionQuery
) {
   const index = meilisearch.client.index<SubmissionDocument>(
      INDEX_NAMES.submissions
   );

   const result = await index.search(input.search!, {
      filter: buildSubmissionMeiliFilter(input),
      limit: 10_000,
      attributesToRetrieve: ['id']
   });

   return result.hits.map(hit => hit.id);
}

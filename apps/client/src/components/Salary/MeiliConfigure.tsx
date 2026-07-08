import { Configure, useSortBy } from 'react-instantsearch';
import { useEffect } from 'react';
import type { SalarySearchSchema } from '@/routes/-validator.ts';
import {
   buildSubmissionMeiliFilter,
   getSubmissionSortIndex
} from './helpers';

const PAGE_SIZE = 20;

type SalaryMeiliConfigureProps = {
   query: SalarySearchSchema;
   sortItems: { label: string; value: string }[];
};

export function SalaryMeiliConfigure({
   query,
   sortItems
}: SalaryMeiliConfigureProps) {
   const sortBy = useSortBy({ items: sortItems });
   const sortIndex = getSubmissionSortIndex(query);

   useEffect(() => {
      if (sortBy.currentRefinement !== sortIndex) {
         sortBy.refine(sortIndex);
      }
   }, [sortIndex]);

   return (
      <Configure
         hitsPerPage={PAGE_SIZE}
         filters={buildSubmissionMeiliFilter(query)}
      />
   );
}

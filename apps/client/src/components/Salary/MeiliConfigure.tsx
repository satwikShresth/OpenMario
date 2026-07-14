import { useConfigure } from 'react-instantsearch';
import { useMemo } from 'react';
import type { SalarySearchSchema } from '@/routes/-validator.ts';
import { buildSubmissionMeiliFilter } from './helpers';

const PAGE_SIZE = 20;

type SalaryMeiliConfigureProps = {
   query: SalarySearchSchema;
};

export function SalaryMeiliConfigure({ query }: SalaryMeiliConfigureProps) {
   const filters = useMemo(() => buildSubmissionMeiliFilter(query), [query]);

   useConfigure({
      hitsPerPage: PAGE_SIZE,
      filters: filters ?? '',
      attributesToRetrieve: [
         'id',
         'year',
         'coop_year',
         'coop_cycle',
         'program_level',
         'work_hours',
         'compensation',
         'other_compensation',
         'details',
         'company_id',
         'company_name',
         'position_id',
         'position_name',
         'city',
         'state',
         'state_code',
      ],
   });

   return null;
}

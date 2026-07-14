import {
   Box,
   Button,
   createListCollection,
   Flex,
   Icon,
   Text,
   useDisclosure,
} from '@chakra-ui/react';
import { Suspense } from 'react';
import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { Index, InstantSearch } from 'react-instantsearch';
import { FilterIcon } from '@/components/icons';
import { Salary } from '@/components/Salary';
import { SearchBox, SortSelect, Stats } from '@/components/Search';
import { salarySearchSchema } from './-validator.ts';
import { useMobile } from '@/hooks';
import { useSearchClient } from '@/helpers';
import { INDEX_NAMES } from '@openmario/meilisearch';
import z from 'zod';
import { SalaryMeiliConfigure } from '@/components/Salary/MeiliConfigure';
import MeiliBody from '@/components/Salary/DataTable/MeiliBody';
import { getSubmissionSortIndex } from '@/components/Salary/helpers';

const sortByCollection = createListCollection({
   items: [
      { label: 'Most Relevant', value: INDEX_NAMES.submissions },
      {
         label: 'Salary (High)',
         value: `${INDEX_NAMES.submissions}:compensation:desc`
      },
      {
         label: 'Salary (Low)',
         value: `${INDEX_NAMES.submissions}:compensation:asc`
      },
      { label: 'Year', value: `${INDEX_NAMES.submissions}:year:desc` },
      {
         label: 'Company A→Z',
         value: `${INDEX_NAMES.submissions}:company_name:asc`
      },
      {
         label: 'Position A→Z',
         value: `${INDEX_NAMES.submissions}:position_name:asc`
      },
      { label: 'Location', value: `${INDEX_NAMES.submissions}:city:asc` },
      {
         label: 'Co-op Year',
         value: `${INDEX_NAMES.submissions}:coop_year:asc`
      }
   ]
});

export const Route = createFileRoute('/salary')({
   beforeLoad: () => ({ getLabel: () => 'Salary' }),
   validateSearch: z.optional(salarySearchSchema),
   component: SalaryPage
});

function SalarySearch() {
   const query = salarySearchSchema.parse(Route.useSearch() ?? {});
   const isMobile = useMobile();
   const { open: isFilterOpen, onOpen: openFilter, onClose: closeFilter } = useDisclosure();

   return (
      <Index indexName={INDEX_NAMES.submissions}>
         <SalaryMeiliConfigure query={query} />
         <Flex direction='column' gap={4} w='full' minW={0}>
            <Flex align='center' gap={3} w='full' minW={0}>
               {isMobile && (
                  <Button onClick={openFilter} variant='solid' size='sm' flexShrink={0}>
                     <Icon as={FilterIcon} />
                     <Text>Filters</Text>
                  </Button>
               )}
               <Box flex='1' minWidth='0'>
                  <SearchBox />
               </Box>
               <Box flexShrink={0}>
                  <Salary.ReportSalaryMenu />
               </Box>
            </Flex>

            {isMobile && (
               <Flex direction='row' width='full' gap={3} justify='space-between'>
                  <SortSelect
                     sortBy={sortByCollection}
                     syncIndex={getSubmissionSortIndex(query)}
                  />
               </Flex>
            )}

            <Salary.DataTable.Filters open={isFilterOpen} onClose={closeFilter} />
            <Salary.DataTable.Footer />

            {!isMobile && (
               <Flex justify='space-between' align='center' gap={3}>
                  <Box flex='1' minWidth='0'>
                     <Stats />
                  </Box>
                  <Box flexShrink={0}>
                     <SortSelect
                        sortBy={sortByCollection}
                        syncIndex={getSubmissionSortIndex(query)}
                     />
                  </Box>
               </Flex>
            )}

            {isMobile && <Stats />}

            <MeiliBody />
         </Flex>
      </Index>
   );
}

function SalaryPage() {
   const { searchClient } = useSearchClient();
   const showNested = useRouterState({
      select: s => s.matches.some(m => m.routeId.startsWith('/salary/_dialog')),
   });

   return (
      <Suspense>
         <Salary.Root>
            {showNested ? (
               <Outlet />
            ) : (
               // @ts-ignore: shupp
               <InstantSearch
                  searchClient={searchClient}
                  future={{ preserveSharedStateOnUnmount: true }}
               >
                  <SalarySearch />
               </InstantSearch>
            )}
         </Salary.Root>
      </Suspense>
   );
}

export type SalaryRoute = typeof Route;

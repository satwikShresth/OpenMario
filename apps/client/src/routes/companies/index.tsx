import { createFileRoute } from '@tanstack/react-router';
import { Box, createListCollection, Flex } from '@chakra-ui/react';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Configure, Index, InstantSearch } from 'react-instantsearch';
import { SearchBox, SortSelect, Stats } from '@/components/Search';
import { Company } from '@/components/Company';
import { orpc } from '@/helpers';
import { env } from '@env';
import { INDEX_NAMES } from '@openmario/meilisearch';

const sortByCollection = createListCollection({
   items: [
      { label: 'Most Relevant', value: INDEX_NAMES.companies },
      { label: 'Omega Score', value: `${INDEX_NAMES.companies}:omega_score:desc` },
      { label: 'Total Reviews', value: `${INDEX_NAMES.companies}:total_reviews:desc` },
      { label: 'Avg Compensation', value: `${INDEX_NAMES.companies}:avg_compensation:desc` },
      { label: '% Recommend', value: `${INDEX_NAMES.companies}:pct_would_recommend:desc` },
      { label: 'Company Name A→Z', value: `${INDEX_NAMES.companies}:company_name:asc` },
   ],
});

export const Route = createFileRoute('/companies/')({
   component: CompaniesPage,
});

function CompaniesSearch() {
   return (
      <Index indexName={INDEX_NAMES.companies}>
         <Configure hitsPerPage={20} />
         <Flex direction='column' gap={4}>
            <Flex
               direction={{ base: 'column', sm: 'row' }}
               align={{ base: 'stretch', sm: 'center' }}
               gap={{ base: 3, sm: 4 }}
            >
               <Box flex='1' minWidth='0'>
                  <SearchBox />
               </Box>
               <Box flexShrink={0}>
                  <SortSelect sortBy={sortByCollection} />
               </Box>
            </Flex>

            <Flex justify='space-between' align='center'>
               <Stats />
            </Flex>

            <Company.Cards />
         </Flex>
      </Index>
   );
}

function CompaniesPage() {
   const refetchInterval = 1000 * 60 * 10;
   const { data } = useSuspenseQuery(
      orpc.auth.getSearchToken.queryOptions({
         staleTime: refetchInterval - 1000,
         gcTime: refetchInterval - 1000,
         refetchInterval,
         refetchIntervalInBackground: true,
      })
   );

   const { searchClient } = instantMeiliSearch(
      env.VITE_MEILI_HOST,
      () => (data as { token: string }).token
   );

   return (
      <Suspense>
         <Company.Root>
            <Company.PageHeader />
            {/* @ts-ignore: shupp */}
            <InstantSearch
               searchClient={searchClient}
               future={{ preserveSharedStateOnUnmount: true }}
            >
               <CompaniesSearch />
            </InstantSearch>
         </Company.Root>
      </Suspense>
   );
}

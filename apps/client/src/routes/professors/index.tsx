import { createFileRoute } from '@tanstack/react-router';
import { Box, createListCollection, Flex } from '@chakra-ui/react';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Configure, Index, InstantSearch } from 'react-instantsearch';
import { SearchBox, SortSelect, Stats } from '@/components/Search';
import { Professor } from '@/components/Professor';
import { orpc } from '@/helpers';
import { env } from '@env';
import { INDEX_NAMES } from '@openmario/meilisearch';

const sortByCollection = createListCollection({
   items: [
      { label: 'Most Relevant', value: INDEX_NAMES.professors },
      { label: 'Avg Rating', value: `${INDEX_NAMES.professors}:avg_rating:desc` },
      { label: 'Most Rated', value: `${INDEX_NAMES.professors}:num_ratings:desc` },
      { label: 'Most Sections', value: `${INDEX_NAMES.professors}:total_sections_taught:desc` },
      { label: 'Difficulty (Hard)', value: `${INDEX_NAMES.professors}:avg_difficulty:desc` },
      { label: 'Difficulty (Easy)', value: `${INDEX_NAMES.professors}:avg_difficulty:asc` },
      { label: 'Name A→Z', value: `${INDEX_NAMES.professors}:name:asc` },
   ],
});

export const Route = createFileRoute('/professors/')({
   component: ProfessorsPage,
});

function ProfessorsSearch() {
   return (
      <Index indexName={INDEX_NAMES.professors}>
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

            <Professor.Cards />
         </Flex>
      </Index>
   );
}

function ProfessorsPage() {
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
         <Professor.Root>
            <Professor.PageHeader />
            {/* @ts-ignore: shupp */}
            <InstantSearch
               searchClient={searchClient}
               future={{ preserveSharedStateOnUnmount: true }}
            >
               <ProfessorsSearch />
            </InstantSearch>
         </Professor.Root>
      </Suspense>
   );
}

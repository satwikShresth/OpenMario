import { createFileRoute } from '@tanstack/react-router';
import { Box, Button, createListCollection, Flex, Icon, Text, useDisclosure } from '@chakra-ui/react';
import { Suspense } from 'react';
import { Configure, Index, InstantSearch } from 'react-instantsearch';
import { SearchBox, SortSelect, Stats } from '@/components/Search';
import { Company } from '@/components/Company';
import { useSearchClient } from '@/helpers';
import { INDEX_NAMES } from '@openmario/meilisearch';
import { useMobile } from '@/hooks';
import { FilterIcon } from '@/components/icons';

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
   const isMobile = useMobile();
   const { open: isFilterOpen, onOpen: openFilter, onClose: closeFilter } = useDisclosure();

   return (
      <Index indexName={INDEX_NAMES.companies}>
         <Configure hitsPerPage={20} />
         <Flex direction='column' gap={4}>
            {/* Search header */}
            <Flex
               direction={{ base: 'column', sm: 'row' }}
               align={{ base: 'stretch', sm: 'center' }}
               gap={{ base: 3, sm: 4 }}
            >
               <Box flex='1' minWidth='0'>
                  <SearchBox />
               </Box>
            </Flex>

            {/* Mobile filter + sort row */}
            {isMobile && (
               <Flex direction='row' width='full' gap={3} justify='space-between'>
                  <Button onClick={openFilter} variant='outline' size='md'>
                     <Icon as={FilterIcon} />
                     <Text>Filters</Text>
                  </Button>
                  <SortSelect sortBy={sortByCollection} />
               </Flex>
            )}

            {/* Main content */}
            <Flex
               direction={{ base: 'column', lg: 'row' }}
               flex='1'
               width='full'
               gap={{ base: 4, md: 5 }}
               align='stretch'
            >
               {/* Desktop sidebar */}
               {!isMobile && (
                  <Box width='280px' flexShrink={0}>
                     <Company.Filters open={isFilterOpen} onClose={closeFilter} />
                  </Box>
               )}

               {/* Results */}
               <Flex direction='column' flex='1' minWidth='0' gap={{ base: 3, md: 4 }}>
                  {!isMobile ? (
                     <Flex justify='space-between' align='center' gap={3}>
                        <Box flex='1' minWidth='0'>
                           <Stats />
                        </Box>
                        <Box flexShrink={0}>
                           <SortSelect sortBy={sortByCollection} />
                        </Box>
                     </Flex>
                  ) : (
                     <Stats />
                  )}
                  <Company.Cards />
               </Flex>
            </Flex>
         </Flex>

         {/* Mobile filter drawer */}
         {isMobile && (
            <Company.Filters open={isFilterOpen} onClose={closeFilter} />
         )}
      </Index>
   );
}

function CompaniesPage() {
   const { searchClient } = useSearchClient();

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

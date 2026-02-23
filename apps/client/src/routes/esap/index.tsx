import {
   Badge,
   Box,
   Card,
   Container,
   Flex,
   Input,
   Select,
   Separator,
   Skeleton,
   Spinner,
   Stack,
   Text,
   VStack,
   createListCollection,
} from '@chakra-ui/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { orpc } from '@/helpers/rpc.ts';
import { z } from 'zod';
import { useCallback, useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';

const esapSearchSchema = z.object({
   search: z.string().optional().catch(undefined),
   sort_by: z
      .enum(['omega_score', 'total_reviews', 'avg_rating_overall', 'company_name'])
      .optional()
      .catch('total_reviews'),
   order: z.enum(['asc', 'desc']).optional().catch('desc'),
});

type EsapSearchSchema = z.infer<typeof esapSearchSchema>;

const omegaMeta = (score: number | null) => {
   if (score === null) return { color: 'gray.400', label: 'N/A' };
   if (score >= 70) return { color: 'green.500', label: `${score}` };
   if (score >= 50) return { color: 'yellow.500', label: `${score}` };
   return { color: 'red.500', label: `${score}` };
};

const sortOptions = createListCollection({
   items: [
      { label: 'Total Reviews', value: 'total_reviews' },
      { label: 'Omega Score', value: 'omega_score' },
      { label: 'Avg Rating', value: 'avg_rating_overall' },
      { label: 'Company Name', value: 'company_name' },
   ],
});

const orderOptions = createListCollection({
   items: [
      { label: 'Descending', value: 'desc' },
      { label: 'Ascending', value: 'asc' },
   ],
});

export const Route = createFileRoute('/esap/')({
   validateSearch: esapSearchSchema,
   component: EsapPage,
});

const PAGE_SIZE = 20;

function ScorePill({ label, value }: { label: string; value: number | null }) {
   return (
      <Box textAlign='center' minW='64px'>
         <Text fontSize='sm' fontWeight='semibold' color={value == null ? 'fg.subtle' : 'fg'}>
            {value != null ? `${value}%` : '—'}
         </Text>
         <Text fontSize='xs' color='fg.muted' whiteSpace='nowrap'>
            {label}
         </Text>
      </Box>
   );
}

function EsapPage() {
   const query = Route.useSearch();
   const navigate = useNavigate({ from: Route.fullPath });

   const searchInputRef = useRef<HTMLInputElement>(null);
   const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
   const sentinelRef = useRef<HTMLDivElement>(null);

   const sortBy = query.sort_by ?? 'total_reviews';
   const order = query.order ?? 'desc';

   const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
      useInfiniteQuery(
         orpc.esap.listCompanies.infiniteOptions({
            input: (pageParam: number) => ({
               search: query.search,
               sort_by: sortBy,
               order,
               pageIndex: pageParam,
               pageSize: PAGE_SIZE,
            }),
            initialPageParam: 1,
            getNextPageParam: lastPage => {
               const totalPages = Math.ceil(lastPage.count / lastPage.pageSize);
               return lastPage.pageIndex < totalPages ? lastPage.pageIndex + 1 : undefined;
            },
            staleTime: 30_000,
         })
      );

   const companies = data?.pages.flatMap(p => p.data) ?? [];
   const totalCount = data?.pages[0]?.count ?? 0;

   const updateSearch = useCallback(
      (updates: Partial<EsapSearchSchema>) =>
         navigate({ search: (prev: EsapSearchSchema) => ({ ...prev, ...updates }) }),
      [navigate]
   );

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => updateSearch({ search: val || undefined }), 300);
   };

   useEffect(() => {
      if (searchInputRef.current && query.search !== undefined)
         searchInputRef.current.value = query.search;
   }, []);

   useEffect(() => {
      const el = sentinelRef.current;
      if (!el) return;
      const observer = new IntersectionObserver(
         entries => {
            if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage)
               fetchNextPage();
         },
         { threshold: 0.1 }
      );
      observer.observe(el);
      return () => observer.disconnect();
   }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

   return (
      <Container maxW='4xl'>
         <VStack align='stretch' gap={6} mt={10}>
            <Flex justify='space-between' align='center' wrap='wrap' gap={3}>
               <Text fontSize='3xl' fontWeight='bolder'>ESAP Companies</Text>
               <Text color='fg.muted' fontSize='sm'>{totalCount} companies</Text>
            </Flex>

            <Separator />

            <Flex gap={3} wrap='wrap' align='center'>
               <Box flex='1' minW='200px' position='relative'>
                  <Input
                     ref={searchInputRef}
                     placeholder='Search companies...'
                     defaultValue={query.search ?? ''}
                     onChange={handleSearchChange}
                     pl={9}
                  />
                  <Box position='absolute' left={3} top='50%' transform='translateY(-50%)' color='fg.muted'>
                     <FiSearch />
                  </Box>
               </Box>

               <Select.Root
                  collection={sortOptions}
                  width='180px'
                  value={[sortBy]}
                  onValueChange={({ value }) =>
                     updateSearch({ sort_by: value[0] as EsapSearchSchema['sort_by'] })
                  }
               >
                  <Select.HiddenSelect />
                  <Select.Control>
                     <Select.Trigger><Select.ValueText placeholder='Sort by' /></Select.Trigger>
                  </Select.Control>
                  <Select.Positioner>
                     <Select.Content>
                        {sortOptions.items.map(item => (
                           <Select.Item key={item.value} item={item}>{item.label}</Select.Item>
                        ))}
                     </Select.Content>
                  </Select.Positioner>
               </Select.Root>

               <Select.Root
                  collection={orderOptions}
                  width='150px'
                  value={[order]}
                  onValueChange={({ value }) =>
                     updateSearch({ order: value[0] as 'asc' | 'desc' })
                  }
               >
                  <Select.HiddenSelect />
                  <Select.Control>
                     <Select.Trigger><Select.ValueText placeholder='Order' /></Select.Trigger>
                  </Select.Control>
                  <Select.Positioner>
                     <Select.Content>
                        {orderOptions.items.map(item => (
                           <Select.Item key={item.value} item={item}>{item.label}</Select.Item>
                        ))}
                     </Select.Content>
                  </Select.Positioner>
               </Select.Root>
            </Flex>

            {isLoading ? (
               <VStack gap={3}>
                  {Array.from({ length: 5 }).map((_, i) => (
                     <Skeleton key={i} height='100px' borderRadius='lg' width='100%' />
                  ))}
               </VStack>
            ) : companies.length === 0 ? (
               <Box textAlign='center' py={16}>
                  <Text fontSize='lg' color='fg.muted'>No companies found</Text>
               </Box>
            ) : (
               <VStack gap={3} align='stretch'>
                  {companies.map(company => {
                     const omega = omegaMeta(company.omega_score);
                     return (
                        <Card.Root
                           key={company.company_id}
                           variant='outline'
                           borderRadius='xl'
                           _hover={{ shadow: 'md', borderColor: 'colorPalette.400' }}
                           cursor='pointer'
                           transition='all 0.15s'
                           onClick={() =>
                              navigate({
                                 to: '/esap/$company_id',
                                 params: { company_id: company.company_id },
                              })
                           }
                        >
                           <Card.Body py={5} px={6}>
                              <Stack
                                 direction={{ base: 'column', md: 'row' }}
                                 align={{ base: 'stretch', md: 'center' }}
                                 gap={5}
                              >
                                 <Flex direction='column' align='center' justify='center' minW='72px' gap={0.5}>
                                    <Text fontSize='2xl' fontWeight='bold' color={omega.color} lineHeight='1'>
                                       {omega.label}
                                    </Text>
                                    <Text fontSize='xs' color='fg.muted' letterSpacing='wide'>OMEGA</Text>
                                 </Flex>

                                 <Separator orientation='vertical' height='56px' display={{ base: 'none', md: 'block' }} />

                                 <Box flex={1} minW={0}>
                                    <Text fontSize='lg' fontWeight='semibold' lineClamp={1}>
                                       {company.company_name}
                                    </Text>
                                    <Flex gap={4} mt={1} wrap='wrap'>
                                       <Text fontSize='sm' color='fg.muted'>{company.total_reviews} reviews</Text>
                                       <Text fontSize='sm' color='fg.muted'>{company.positions_reviewed} positions</Text>
                                       {company.avg_rating_overall != null && (
                                          <Badge variant='subtle' colorPalette='blue' size='sm'>
                                             {company.avg_rating_overall} / 4 avg
                                          </Badge>
                                       )}
                                    </Flex>
                                 </Box>

                                 <Separator orientation='vertical' height='56px' display={{ base: 'none', md: 'block' }} />

                                 <Flex gap={4} wrap='wrap' justify={{ base: 'flex-start', md: 'flex-end' }}>
                                    <ScorePill label='Satisfaction' value={company.satisfaction_score} />
                                    <ScorePill label='Trust' value={company.trust_score} />
                                    <ScorePill label='Integrity' value={company.integrity_score} />
                                    <ScorePill label='Growth' value={company.growth_score} />
                                    <ScorePill label='Work-Life' value={company.work_life_score} />
                                 </Flex>
                              </Stack>
                           </Card.Body>
                        </Card.Root>
                     );
                  })}
               </VStack>
            )}

            <Box ref={sentinelRef} py={4} display='flex' justifyContent='center'>
               {isFetchingNextPage && <Spinner size='sm' color='fg.muted' />}
               {!hasNextPage && companies.length > 0 && (
                  <Text fontSize='sm' color='fg.subtle'>All {totalCount} companies loaded</Text>
               )}
            </Box>
         </VStack>
      </Container>
   );
}

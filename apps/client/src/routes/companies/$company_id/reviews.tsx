import {
   Box,
   Container,
   Flex,
   Select,
   Skeleton,
   Spinner,
   Text,
   VStack,
   createListCollection,
} from '@chakra-ui/react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { orpc } from '@/helpers/rpc.ts';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ReviewCard } from '@/components/Company/helpers';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';

export const Route = createFileRoute('/companies/$company_id/reviews')({
   validateSearch: z.object({
      sort: z.enum(['year_desc', 'rating_desc', 'rating_asc']).optional().catch('year_desc'),
   }),
   component: CompanyReviewsPage,
});

const sortOptions = createListCollection({
   items: [
      { label: 'Most Recent', value: 'year_desc' },
      { label: 'Highest Rated', value: 'rating_desc' },
      { label: 'Most Critical', value: 'rating_asc' },
   ],
});

const PAGE_SIZE = 15;

function CompanyReviewsPage() {
   const { company_id } = Route.useParams();
   const { sort: sortParam } = Route.useSearch();
   const [sort, setSort] = useState<'year_desc' | 'rating_desc' | 'rating_asc'>(
      sortParam ?? 'year_desc'
   );
   const sentinelRef = useRef<HTMLDivElement>(null);

   const { data: companyData } = useQuery(
      orpc.companies.getCompany.queryOptions({ input: { company_id }, staleTime: 30_000 })
   );
   const companyName = companyData?.company?.company_name;

   const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
      useInfiniteQuery(
         orpc.companies.getCompanyReviews.infiniteOptions({
            input: (p: number) => ({
               company_id,
               sort,
               pageIndex: p,
               pageSize: PAGE_SIZE,
            }),
            initialPageParam: 1,
            getNextPageParam: last => {
               const total = Math.ceil(last.count / last.pageSize);
               return last.pageIndex < total ? last.pageIndex + 1 : undefined;
            },
            staleTime: 30_000,
         })
      );

   useEffect(() => {
      const el = sentinelRef.current;
      if (!el) return;
      const observer = new IntersectionObserver(
         entries => {
            if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
         },
         { threshold: 0.1 }
      );
      observer.observe(el);
      return () => observer.disconnect();
   }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

   const reviews = data?.pages.flatMap(p => p.data) ?? [];
   const total = data?.pages[0]?.count ?? 0;

   return (
      <Container maxW='4xl' py={10}>
         <VStack align='stretch' gap={8}>
            <Breadcrumb
               items={[
                  { type: 'link', label: 'Companies', to: '/companies' },
                  companyName
                     ? { type: 'link', label: companyName, to: '/companies/$company_id', params: { company_id } }
                     : { type: 'loading' },
                  { type: 'current', label: 'All Reviews' },
               ]}
            />

            <Flex justify='space-between' align='center' wrap='wrap' gap={4}>
               <Box>
                  <Text fontSize='2xl' fontWeight='bold'>All Reviews</Text>
                  {total > 0 && (
                     <Text fontSize='sm' color='fg.muted' mt={0.5}>{total} reviews</Text>
                  )}
               </Box>
               <Select.Root
                  collection={sortOptions}
                  width='180px'
                  value={[sort]}
                  onValueChange={({ value }) =>
                     setSort(value[0] as typeof sort)
                  }
               >
                  <Select.HiddenSelect />
                  <Select.Control>
                     <Select.Trigger>
                        <Select.ValueText placeholder='Sort' />
                     </Select.Trigger>
                  </Select.Control>
                  <Select.Positioner>
                     <Select.Content>
                        {sortOptions.items.map(item => (
                           <Select.Item key={item.value} item={item}>
                              {item.label}
                           </Select.Item>
                        ))}
                     </Select.Content>
                  </Select.Positioner>
               </Select.Root>
            </Flex>

            {isLoading ? (
               <VStack gap={4}>
                  {Array.from({ length: 5 }).map((_, i) => (
                     <Skeleton key={i} height='160px' borderRadius='xl' width='100%' />
                  ))}
               </VStack>
            ) : reviews.length === 0 ? (
               <Box textAlign='center' py={16}>
                  <Text fontSize='lg' color='fg.muted'>No written reviews found</Text>
               </Box>
            ) : (
               <VStack gap={4} align='stretch'>
                  {reviews.map(r => (
                     <ReviewCard key={r.id} review={r} truncate={false} />
                  ))}
               </VStack>
            )}

            <Box ref={sentinelRef} py={4} display='flex' justifyContent='center'>
               {isFetchingNextPage && <Spinner size='sm' color='fg.muted' />}
               {!hasNextPage && reviews.length > 0 && (
                  <Text fontSize='sm' color='fg.subtle'>All {total} reviews loaded</Text>
               )}
            </Box>
         </VStack>
      </Container>
   );
}

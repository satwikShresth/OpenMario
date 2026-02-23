import {
   Badge,
   Box,
   Container,
   Flex,
   Grid,
   HStack,
   Separator,
   Skeleton,
   Spinner,
   Stat,
   Text,
   VStack,
} from '@chakra-ui/react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { orpc } from '@/helpers/rpc.ts';
import { omegaHex, ReviewCard } from '@/components/Company/helpers';
import { useEffect, useRef } from 'react';

export const Route = createFileRoute('/companies/$company_id/$position_id')({
   component: PositionReviewsPage,
});

const PAGE_SIZE = 15;

function PositionReviewsPage() {
   const { company_id, position_id } = Route.useParams();
   const sentinelRef = useRef<HTMLDivElement>(null);

   const { data: companyData, isLoading: companyLoading } = useQuery(
      orpc.companies.getCompany.queryOptions({ input: { company_id }, staleTime: 30_000 })
   );

   const { data, isLoading: reviewsLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
      useInfiniteQuery(
         orpc.companies.getCompanyReviews.infiniteOptions({
            input: (p: number) => ({
               company_id,
               position_id,
               sort: 'year_desc' as const,
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

   const companyName = companyData?.company?.company_name;
   const position = companyData?.positions.find(p => p.position_id === position_id);
   const reviews = data?.pages.flatMap(p => p.data) ?? [];
   const totalReviews = data?.pages[0]?.count ?? position?.total_reviews ?? 0;

   const scorePills = position
      ? [
         { label: 'Satisfaction', value: position.satisfaction_score },
         { label: 'Trust', value: position.trust_score },
         { label: 'Integrity', value: position.integrity_score },
         { label: 'Growth', value: position.growth_score },
         { label: 'Work-Life', value: position.work_life_score },
      ].filter(p => p.value !== null)
      : [];

   return (
      <Container maxW='4xl' py={10}>
         <VStack align='stretch' gap={8}>

            {/* Header */}
            {companyLoading || !position ? (
               <VStack align='stretch' gap={3}>
                  <Skeleton height='36px' width='280px' />
                  <Skeleton height='20px' width='160px' />
               </VStack>
            ) : (
               <Flex justify='space-between' align='flex-start' wrap='wrap' gap={5}>
                  <Box>
                     <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight='bold' lineHeight='1.2'>
                        {position.position_name}
                     </Text>
                     <Text fontSize='sm' color='fg.muted' mt={1}>{companyName}</Text>
                     {scorePills.length > 0 && (
                        <HStack gap={2} mt={3} flexWrap='wrap'>
                           {scorePills.map(({ label, value }) => (
                              <Badge key={label} variant='surface' colorPalette='gray' size='sm'>
                                 {label}: {value}%
                              </Badge>
                           ))}
                        </HStack>
                     )}
                  </Box>
                  <Box textAlign='center' px={5} py={4} borderRadius='2xl' borderWidth='thin' minW='100px'>
                     <Text
                        fontSize='3xl'
                        fontWeight='extrabold'
                        color={omegaHex(position.omega_score)}
                        lineHeight='1'
                     >
                        {position.omega_score ?? '—'}
                     </Text>
                     <Text fontSize='xs' color='fg.muted' letterSpacing='widest' mt={1}>OMEGA</Text>
                  </Box>
               </Flex>
            )}

            {/* Stats */}
            {!companyLoading && position && (
               <Grid templateColumns={{ base: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }} gap={4}>
                  {[
                     { label: 'Reviews', value: position.total_reviews },
                     { label: 'Salary Submissions', value: position.total_submissions },
                     {
                        label: 'Avg Rating',
                        value: position.avg_rating_overall != null
                           ? `${Number(position.avg_rating_overall).toFixed(2)} / 4`
                           : 'N/A',
                     },
                     {
                        label: 'Avg Compensation',
                        value: position.avg_compensation != null
                           ? `$${Number(position.avg_compensation).toLocaleString()}`
                           : 'N/A',
                     },
                  ].map(({ label, value }) => (
                     <Box key={label} borderWidth='thin' borderRadius='xl' p={5}>
                        <Stat.Root>
                           <Stat.Label fontSize='sm' color='fg.muted'>{label}</Stat.Label>
                           <Stat.ValueText fontSize='xl' fontWeight='bold' mt={1}>{value}</Stat.ValueText>
                        </Stat.Root>
                     </Box>
                  ))}
               </Grid>
            )}

            <Separator />

            {/* Reviews */}
            <Box>
               <Flex justify='space-between' align='center' mb={5}>
                  <Box>
                     <Text fontWeight='semibold' fontSize='xl'>Student Reviews</Text>
                     {totalReviews > 0 && (
                        <Text fontSize='sm' color='fg.muted' mt={0.5}>{totalReviews} reviews</Text>
                     )}
                  </Box>
               </Flex>

               {reviewsLoading ? (
                  <VStack gap={4}>
                     {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} height='160px' borderRadius='xl' width='100%' />
                     ))}
                  </VStack>
               ) : reviews.length === 0 ? (
                  <Box textAlign='center' py={12}>
                     <Text fontSize='lg' color='fg.muted'>No written reviews for this position</Text>
                  </Box>
               ) : (
                  <VStack gap={4} align='stretch'>
                     {reviews.map(r => (
                        <ReviewCard key={r.id} review={r} showPosition={false} truncate={false} />
                     ))}
                  </VStack>
               )}

               <Box ref={sentinelRef} py={4} display='flex' justifyContent='center'>
                  {isFetchingNextPage && <Spinner size='sm' color='fg.muted' />}
                  {!hasNextPage && reviews.length > 0 && (
                     <Text fontSize='sm' color='fg.subtle'>All {totalReviews} reviews loaded</Text>
                  )}
               </Box>
            </Box>
         </VStack>
      </Container>
   );
}

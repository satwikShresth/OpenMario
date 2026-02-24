import {
   Badge,
   Box,
   Flex,
   Grid,
   HStack,
   Separator,
   Skeleton,
   Spinner,
   Stat,
   Text,
   VStack,
   Image,
} from '@chakra-ui/react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { orpc } from '@/helpers/rpc.ts';
import { omegaHex, ratingColorHex, ratingLabelShort, ReviewCard } from '@/components/Company/helpers';
import { Tooltip } from '@/components/ui/tooltip';
import { WarningIcon } from '@/components/icons';
import { useEffect, useRef } from 'react';
import {
   Bar,
   BarChart,
   CartesianGrid,
   PolarAngleAxis,
   PolarGrid,
   PolarRadiusAxis,
   Radar,
   RadarChart,
   ResponsiveContainer,
   Tooltip as RechartsTooltip,
   XAxis,
   YAxis,
} from 'recharts';

export const Route = createFileRoute('/companies/$company_id/$position_id')({
   beforeLoad: ({ context: { queryClient }, params: { company_id, position_id } }) => ({
      getLabel: () =>
         queryClient
            .ensureQueryData(orpc.companies.getCompany.queryOptions({ input: { params: { company_id } }, staleTime: 30_000 }))
            .then((data: any) => data?.positions?.find((p: any) => p.position_id === position_id)?.position_name ?? position_id),
   }),
   component: PositionReviewsPage,
});

const PAGE_SIZE = 15;

function ScoreTooltip({
   active,
   payload,
   accentColor,
}: {
   active?: boolean;
   payload?: Array<{ payload: { subject: string; value: number } }>;
   accentColor: string;
}) {
   if (!active || !payload?.length) return null;
   const item = payload[0]?.payload;
   if (!item) return null;
   return (
      <Box bg='bg' borderWidth='thin' borderRadius='lg' px={3} py={2} shadow='md' minW='120px'>
         <Text fontSize='xs' color='fg.muted' mb={0.5}>{item.subject}</Text>
         <Text fontSize='md' fontWeight='bold' color={accentColor}>{item.value}</Text>
         <Text fontSize='xs' color='fg.muted'>out of 100</Text>
      </Box>
   );
}

function SalaryTooltip({
   active,
   payload,
   label,
}: {
   active?: boolean;
   payload?: Array<{ name: string; value: number; fill: string }>;
   label?: string;
}) {
   if (!active || !payload?.length) return null;
   return (
      <Box bg='bg' borderWidth='thin' borderRadius='lg' px={3} py={2} shadow='md' minW='140px'>
         <Text fontSize='xs' color='fg.muted' mb={1} fontWeight='semibold'>{label}</Text>
         {payload.map(p => (
            <Flex key={p.name} justify='space-between' gap={4}>
               <Text fontSize='xs' color='fg.muted'>{p.name}</Text>
               <Text fontSize='xs' fontWeight='bold'>${Number(p.value).toLocaleString()}</Text>
            </Flex>
         ))}
      </Box>
   );
}

function PositionReviewsPage() {
   const { company_id, position_id } = Route.useParams();
   const sentinelRef = useRef<HTMLDivElement>(null);

   const { data: companyData, isLoading: companyLoading } = useQuery(
      orpc.companies.getCompany.queryOptions({
         input: { params: { company_id } },
         staleTime: 30_000,
      })
   );

   const { data: reviewPages, isLoading: reviewsLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
      useInfiniteQuery(
         orpc.companies.getPositionReviews.infiniteOptions({
            input: (pageIndex: number) => ({
               params: { company_id, position_id },
               query: { sort: 'year_desc' as const, pageIndex, pageSize: PAGE_SIZE },
            }),
            initialPageParam: 1,
            getNextPageParam: (last) => {
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

   const companyName = companyData?.company.company_name;
   const position = companyData?.positions.find(p => p.position_id === position_id);
   const reviewItems = reviewPages?.pages.flatMap(p => p.data) ?? [];
   const totalReviews = reviewPages?.pages[0]?.count ?? position?.total_reviews ?? 0;
   const accentColor = omegaHex(position?.omega_score ?? null);

   const radarData = position ? [
      { subject: 'Satisfaction', value: position.satisfaction_score ?? 0 },
      { subject: 'Trust', value: position.trust_score ?? 0 },
      { subject: 'Integrity', value: position.integrity_score ?? 0 },
      { subject: 'Growth', value: position.growth_score ?? 0 },
      { subject: 'Work-Life', value: position.work_life_score ?? 0 },
   ] : [];

   const ratingsData = position ? [
      { name: 'Collaboration', value: position.avg_rating_collaboration ?? 0 },
      { name: 'Work Variety', value: position.avg_rating_work_variety ?? 0 },
      { name: 'Relationships', value: position.avg_rating_relationships ?? 0 },
      { name: 'Supervisor', value: position.avg_rating_supervisor_access ?? 0 },
      { name: 'Training', value: position.avg_rating_training ?? 0 },
   ] : [];

   const hasSalary = position && (position.avg_compensation != null || position.median_compensation != null);
   const salaryBarData = hasSalary ? [
      { name: 'Avg', value: position.avg_compensation ?? 0 },
      { name: 'Median', value: position.median_compensation ?? 0 },
   ] : [];

   return (
      <Box maxW={{ base: 'full', md: '5xl', xl: '6xl', '2xl': '7xl' }} w='full' mx='auto' py={{ base: 6, md: 10, xl: 12 }}>
         <VStack align='stretch' gap={{ base: 8, md: 10, xl: 12 }}>

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
                  </Box>
                  <Box textAlign='center' px={5} py={4} borderRadius='2xl' borderWidth='thin' minW='100px' position='relative'>
                     {position.total_reviews < 5 && (
                        <Tooltip content='Limited data — omΩ score is based on fewer than 5 reviews and may not be representative'>
                           <Box position='absolute' top='8px' right='10px' color='orange.400' cursor='help'>
                              <WarningIcon size={14} />
                           </Box>
                        </Tooltip>
                     )}
                     <Text
                        fontSize='3xl'
                        fontWeight='extrabold'
                        color={accentColor}
                        lineHeight='1'
                     >
                        {position.omega_score ?? '—'}
                     </Text>
                     <Flex align='center' justify='center' gap={1} mt={2}>
                        <Image src='/omegascore-logo.png' alt='omΩ' h='18px' />
                     </Flex>
                  </Box>
               </Flex>
            )}

            {/* Stats */}
            {!companyLoading && position && (
               <Grid templateColumns={{ base: 'repeat(2,1fr)', md: 'repeat(3,1fr)', lg: 'repeat(5,1fr)' }} gap={{ base: 4, md: 5, xl: 6 }}>
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
                     {
                        label: 'Median Compensation',
                        value: position.median_compensation != null
                           ? `$${Number(position.median_compensation).toLocaleString()}`
                           : 'N/A',
                     },
                  ].map(({ label, value }) => (
                     <Box key={label} borderWidth='thin' borderRadius='xl' p={{ base: 5, md: 6 }}>
                        <Stat.Root>
                           <Stat.Label fontSize='sm' color='fg.muted'>{label}</Stat.Label>
                           <Stat.ValueText fontSize='xl' fontWeight='bold' mt={1}>{value}</Stat.ValueText>
                        </Stat.Root>
                     </Box>
                  ))}
               </Grid>
            )}

            {/* Charts */}
            {!companyLoading && position && (
               <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={{ base: 6, md: 8, xl: 10 }}>

                  {/* Score Breakdown */}
                  <Box borderWidth='thin' borderRadius='xl' p={{ base: 5, md: 6, xl: 8 }}>
                     <Flex align='center' gap={2} mb={4}>
                        <Image src='/omegascore-logo.png' alt='OMΩ' h='20px' />
                        <Text fontWeight='semibold'>Score Breakdown</Text>
                     </Flex>
                     <ResponsiveContainer width='100%' height={240}>
                        <RadarChart data={radarData}>
                           <PolarGrid />
                           <PolarAngleAxis dataKey='subject' tick={{ fontSize: 11 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                           <Radar
                              name='Score'
                              dataKey='value'
                              stroke={accentColor}
                              fill={accentColor}
                              fillOpacity={0.25}
                              strokeWidth={2}
                           />
                           <RechartsTooltip content={<ScoreTooltip accentColor={accentColor} />} />
                        </RadarChart>
                     </ResponsiveContainer>
                     <HStack gap={2} mt={2} flexWrap='wrap' justify='center'>
                        {radarData.map(({ subject, value }) => (
                           value > 0 && (
                              <Badge key={subject} variant='surface' colorPalette='gray' size='sm'>
                                 {subject}: {value}
                              </Badge>
                           )
                        ))}
                     </HStack>
                  </Box>

                  {/* Rating Breakdown */}
                  <Box borderWidth='thin' borderRadius='xl' p={{ base: 5, md: 6, xl: 8 }}>
                     <Text fontWeight='semibold' mb={5}>Rating Breakdown (out of 4)</Text>
                     <VStack gap={4} align='stretch'>
                        {ratingsData.map(({ name, value }) => {
                           const color = ratingColorHex(value);
                           const pct = Math.round((value / 4) * 100);
                           const sentiment = ratingLabelShort(value);
                           return (
                              <Box key={name}>
                                 <Flex justify='space-between' align='center' mb={1.5}>
                                    <Text fontSize='sm' fontWeight='medium' color='fg'>{name}</Text>
                                    <HStack gap={2}>
                                       <Text fontSize='sm' fontWeight='semibold' color={color}>
                                          {value > 0 ? `${Number(value).toFixed(2)} / 4` : 'N/A'}
                                       </Text>
                                       {value > 0 && <Text fontSize='xs' color='fg.muted'>{sentiment}</Text>}
                                    </HStack>
                                 </Flex>
                                 <Box position='relative' h='8px' bg='bg.subtle' borderRadius='full' overflow='hidden'>
                                    <Box
                                       position='absolute' left={0} top={0} h='100%' w={`${pct}%`}
                                       bg={color} borderRadius='full' transition='width 0.4s ease'
                                    />
                                 </Box>
                              </Box>
                           );
                        })}
                     </VStack>
                  </Box>

                  {/* Salary Chart */}
                  {hasSalary && salaryBarData.length > 0 && (
                     <Box borderWidth='thin' borderRadius='xl' p={{ base: 5, md: 6, xl: 8 }} gridColumn={{ md: 'span 2' }}>
                        <Text fontWeight='semibold' mb={5}>Compensation</Text>
                        <ResponsiveContainer width='100%' height={160}>
                           <BarChart data={salaryBarData} margin={{ left: 16, right: 24, top: 4, bottom: 4 }} barSize={40}>
                              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='var(--chakra-colors-border)' />
                              <XAxis
                                 dataKey='name'
                                 tick={{ fontSize: 12 }}
                                 axisLine={false}
                                 tickLine={false}
                              />
                              <YAxis
                                 tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                                 tick={{ fontSize: 11 }}
                                 axisLine={false}
                                 tickLine={false}
                              />
                              <RechartsTooltip content={<SalaryTooltip />} cursor={{ fill: 'var(--chakra-colors-bg-subtle)' }} />
                              <Bar
                                 dataKey='value'
                                 name='Amount'
                                 radius={[4, 4, 0, 0]}
                                 shape={(props: any) => (
                                    <rect
                                       x={props.x}
                                       y={props.y}
                                       width={props.width}
                                       height={props.height}
                                       rx={4}
                                       ry={4}
                                       fill={accentColor}
                                       fillOpacity={props.name === 'Avg' ? 0.85 : 0.45}
                                    />
                                 )}
                              />
                           </BarChart>
                        </ResponsiveContainer>
                     </Box>
                  )}
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
               ) : reviewItems.length === 0 ? (
                  <Box textAlign='center' py={12}>
                     <Text fontSize='lg' color='fg.muted'>No written reviews for this position</Text>
                  </Box>
               ) : (
                  <VStack gap={4} align='stretch'>
                     {reviewItems.map((r: any) => (
                        <ReviewCard key={r.id} review={r} showPosition={false} truncate={false} />
                     ))}
                  </VStack>
               )}

               <Box ref={sentinelRef} py={4} display='flex' justifyContent='center'>
                  {isFetchingNextPage && <Spinner size='sm' color='fg.muted' />}
                  {!hasNextPage && reviewItems.length > 0 && (
                     <Text fontSize='sm' color='fg.subtle'>All {totalReviews} reviews loaded</Text>
                  )}
               </Box>
            </Box>
         </VStack>
      </Box>
   );
}

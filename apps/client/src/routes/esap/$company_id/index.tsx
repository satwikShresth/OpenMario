import {
   Badge,
   Box,
   Button,
   Container,
   Flex,
   Grid,
   HStack,
   Separator,
   Skeleton,
   Stat,
   Text,
   VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { orpc } from '@/helpers/rpc.ts';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { omegaColorPalette, omegaHex, ratingColorHex, ratingLabelShort, ReviewCard } from '../-helpers';
import {
   PolarAngleAxis,
   PolarGrid,
   PolarRadiusAxis,
   Radar,
   RadarChart,
   ResponsiveContainer,
   Tooltip,
} from 'recharts';
import { FiArrowRight, FiChevronRight } from 'react-icons/fi';

export const Route = createFileRoute('/esap/$company_id/')({
   component: EsapCompanyOverview,
});

function HighlightReview({
   sort,
   label,
   company_id,
}: {
   sort: 'rating_desc' | 'rating_asc' | 'year_desc';
   label: string;
   company_id: string;
}) {
   const { data, isLoading } = useQuery(
      orpc.esap.getCompanyReviews.queryOptions({
         input: { company_id, sort, pageSize: 1, pageIndex: 1 },
         staleTime: 60_000,
      })
   );
   const review = data?.data[0];
   if (isLoading) return <Skeleton height='160px' borderRadius='xl' />;
   if (!review || (!review.best_features && !review.challenges)) return null;
   return (
      <Box>
         <Text fontSize='xs' fontWeight='semibold' color='fg.muted' mb={2} letterSpacing='wide'>
            {label}
         </Text>
         <ReviewCard review={review} truncate />
      </Box>
   );
}

type OmegaTooltipProps = {
   active?: boolean;
   payload?: Array<{ payload: { subject: string; value: number } }>;
   accentColor: string;
};

function OmegaTooltip({ active, payload, accentColor }: OmegaTooltipProps) {
   if (!active || !payload?.length) return null;
   const { subject, value } = payload[0]?.payload!;
   return (
      <Box
         bg='bg'
         borderWidth='thin'
         borderRadius='lg'
         px={3}
         py={2}
         shadow='md'
         minW='120px'
      >
         <Text fontSize='xs' color='fg.muted' mb={0.5}>{subject}</Text>
         <Text fontSize='md' fontWeight='bold' color={accentColor}>{value}</Text>
         <Text fontSize='xs' color='fg.muted'>out of 100</Text>
      </Box>
   );
}

function EsapCompanyOverview() {
   const { company_id } = Route.useParams();
   const navigate = useNavigate();

   const { data: companyData, isLoading } = useQuery(
      orpc.esap.getCompany.queryOptions({ input: { company_id }, staleTime: 30_000 })
   );

   const { company, positions } = companyData ?? { company: null, positions: [] };

   const radarData = company
      ? [
         { subject: 'Satisfaction', value: company.satisfaction_score ?? 0 },
         { subject: 'Trust', value: company.trust_score ?? 0 },
         { subject: 'Integrity', value: company.integrity_score ?? 0 },
         { subject: 'Growth', value: company.growth_score ?? 0 },
         { subject: 'Work-Life', value: company.work_life_score ?? 0 },
      ]
      : [];

   const ratingsData = company
      ? [
         { name: 'Collaboration', value: company.avg_rating_collaboration ?? 0 },
         { name: 'Work Variety', value: company.avg_rating_work_variety ?? 0 },
         { name: 'Relationships', value: company.avg_rating_relationships ?? 0 },
         { name: 'Supervisor', value: company.avg_rating_supervisor_access ?? 0 },
         { name: 'Training', value: company.avg_rating_training ?? 0 },
      ]
      : [];

   return (
      <Container maxW='5xl' py={10}>
         <VStack align='stretch' gap={8}>
            <Breadcrumb
               items={[
                  { type: 'link', label: 'ESAP', to: '/esap' },
                  company?.company_name
                     ? { type: 'current', label: company.company_name }
                     : { type: 'loading' },
               ]}
            />

            {/* Header */}
            {isLoading || !company ? (
               <VStack align='stretch' gap={3}>
                  <Skeleton height='40px' width='320px' />
                  <Skeleton height='22px' width='200px' />
               </VStack>
            ) : (
               <Flex justify='space-between' align='flex-start' wrap='wrap' gap={5}>
                  <Box>
                     <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight='bold' lineHeight='1.2'>
                        {company.company_name}
                     </Text>
                     <HStack gap={2} mt={3} flexWrap='wrap'>
                        <Badge colorPalette='gray' variant='surface'>
                           {company.total_reviews} reviews
                        </Badge>
                        <Badge colorPalette='gray' variant='surface'>
                           {company.positions_reviewed} positions reviewed
                        </Badge>
                        {company.pct_would_recommend != null && (
                           <Badge colorPalette='green' variant='surface'>
                              {company.pct_would_recommend}% recommend
                           </Badge>
                        )}
                     </HStack>
                  </Box>
                  <Box textAlign='center' px={6} py={4} borderRadius='2xl' borderWidth='thin' minW='110px'>
                     <Text
                        fontSize='4xl'
                        fontWeight='extrabold'
                        color={omegaHex(company.omega_score)}
                        lineHeight='1'
                     >
                        {company.omega_score ?? '—'}
                     </Text>
                     <Text fontSize='xs' color='fg.muted' letterSpacing='widest' mt={1.5}>
                        OMEGA SCORE
                     </Text>
                  </Box>
               </Flex>
            )}

            <Separator />

            {/* Stats */}
            {isLoading || !company ? (
               <Grid templateColumns={{ base: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }} gap={4}>
                  {Array.from({ length: 4 }).map((_, i) => (
                     <Skeleton key={i} height='96px' borderRadius='xl' />
                  ))}
               </Grid>
            ) : (
               <Grid templateColumns={{ base: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }} gap={4}>
                  {[
                     {
                        label: 'Avg Rating',
                        value: company.avg_rating_overall != null
                           ? `${Number(company.avg_rating_overall).toFixed(2)} / 4`
                           : 'N/A',
                     },
                     {
                        label: 'Would Recommend',
                        value: company.pct_would_recommend != null
                           ? `${company.pct_would_recommend}%`
                           : 'N/A',
                     },
                     {
                        label: 'Avg Days / Week',
                        value: company.avg_days_per_week ?? 'N/A',
                     },
                     {
                        label: 'Overtime Required',
                        value: company.pct_overtime_required != null
                           ? `${company.pct_overtime_required}%`
                           : 'N/A',
                     },
                  ].map(({ label, value }) => (
                     <Box key={label} borderWidth='thin' borderRadius='xl' p={5}>
                        <Stat.Root>
                           <Stat.Label fontSize='sm' color='fg.muted'>
                              {label}
                           </Stat.Label>
                           <Stat.ValueText fontSize='2xl' fontWeight='bold' mt={1}>
                              {value}
                           </Stat.ValueText>
                        </Stat.Root>
                     </Box>
                  ))}
               </Grid>
            )}

            {/* Charts */}
            {!isLoading && company && (
               <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                  <Box borderWidth='thin' borderRadius='xl' p={5}>
                     <Text fontWeight='semibold' mb={4}>Omega Score Breakdown</Text>
                     <ResponsiveContainer width='100%' height={260}>
                        <RadarChart data={radarData}>
                           <PolarGrid />
                           <PolarAngleAxis dataKey='subject' tick={{ fontSize: 12 }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                           <Radar
                              name='Score'
                              dataKey='value'
                              stroke={omegaHex(company.omega_score)}
                              fill={omegaHex(company.omega_score)}
                              fillOpacity={0.25}
                              strokeWidth={2}
                           />
                           <Tooltip content={<OmegaTooltip accentColor={omegaHex(company.omega_score)} />} />
                        </RadarChart>
                     </ResponsiveContainer>
                  </Box>

                  <Box borderWidth='thin' borderRadius='xl' p={5}>
                     <Text fontWeight='semibold' mb={5}>Rating Breakdown (out of 4)</Text>
                     <VStack gap={4} align='stretch'>
                        {ratingsData.map(({ name, value }) => {
                           const color = ratingColorHex(value);
                           const pct = Math.round((value / 4) * 100);
                           const sentiment = ratingLabelShort(value);
                           return (
                              <Box key={name}>
                                 <Flex justify='space-between' align='center' mb={1.5}>
                                    <Text fontSize='sm' fontWeight='medium' color='fg'>
                                       {name}
                                    </Text>
                                    <HStack gap={2}>
                                       <Text fontSize='sm' fontWeight='semibold' color={color}>
                                          {Number(value).toFixed(2)} / 4
                                       </Text>
                                       <Text fontSize='xs' color='fg.muted'>
                                          {sentiment}
                                       </Text>
                                    </HStack>
                                 </Flex>
                                 <Box position='relative' h='8px' bg='bg.subtle' borderRadius='full' overflow='hidden'>
                                    <Box
                                       position='absolute'
                                       left={0}
                                       top={0}
                                       h='100%'
                                       w={`${pct}%`}
                                       bg={color}
                                       borderRadius='full'
                                       transition='width 0.4s ease'
                                    />
                                 </Box>
                              </Box>
                           );
                        })}
                     </VStack>
                  </Box>
               </Grid>
            )}

            <Separator />

            {/* Positions */}
            {!isLoading && (
               <Box>
                  <Flex justify='space-between' align='center' mb={4}>
                     <Box>
                        <Text fontWeight='semibold' fontSize='xl'>Positions</Text>
                        <Text fontSize='sm' color='fg.muted' mt={0.5}>{positions.length} total</Text>
                     </Box>
                     {positions.length > 5 && (
                        <Link to='/esap/$company_id/positions' params={{ company_id }}>
                           <Button variant='outline' size='sm'>
                              <HStack gap={2}>
                                 <Text>View all {positions.length}</Text>
                                 <FiArrowRight size={14} />
                              </HStack>
                           </Button>
                        </Link>
                     )}
                  </Flex>
                  {positions.length === 0 ? (
                     <Text color='fg.muted'>No positions found</Text>
                  ) : (
                     <VStack gap={3} align='stretch'>
                        {positions.slice(0, 5).map(pos => (
                           <Box
                              key={pos.position_id}
                              borderWidth='thin'
                              borderRadius='xl'
                              p={5}
                              cursor='pointer'
                              _hover={{ shadow: 'md', borderColor: 'colorPalette.300' }}
                              transition='all 0.15s'
                              onClick={() =>
                                 navigate({
                                    to: '/esap/$company_id/$position_id',
                                    params: { company_id, position_id: pos.position_id },
                                 })
                              }
                           >
                              <Flex justify='space-between' align='center' gap={4}>
                                 <HStack gap={3} flex={1} minW={0}>
                                    <Badge
                                       colorPalette={omegaColorPalette(pos.omega_score)}
                                       variant='subtle'
                                       fontSize='sm'
                                       px={3}
                                       py={1}
                                       borderRadius='lg'
                                       flexShrink={0}
                                    >
                                       Ω {pos.omega_score ?? '—'}
                                    </Badge>
                                    <Box flex={1} minW={0}>
                                       <Text fontWeight='semibold' fontSize='md' lineClamp={1}>
                                          {pos.position_name}
                                       </Text>
                                       <HStack gap={3} mt={0.5} flexWrap='wrap'>
                                          <Text fontSize='sm' color='fg.muted'>
                                             {pos.total_reviews} review{pos.total_reviews !== 1 ? 's' : ''}
                                          </Text>
                                          {pos.avg_compensation != null && (
                                             <Text fontSize='sm' color='fg.muted'>
                                                ${Number(pos.avg_compensation).toLocaleString()} avg comp
                                             </Text>
                                          )}
                                          {pos.most_recent_posting_year != null && (
                                             <Text fontSize='sm' color='fg.muted'>
                                                Last posted {pos.most_recent_posting_year}
                                             </Text>
                                          )}
                                       </HStack>
                                    </Box>
                                 </HStack>
                                 <FiChevronRight size={18} color='var(--chakra-colors-fg-muted)' />
                              </Flex>
                           </Box>
                        ))}
                        {positions.length > 5 && (
                           <Link to='/esap/$company_id/positions' params={{ company_id }}>
                              <Box
                                 borderWidth='thin'
                                 borderRadius='xl'
                                 p={4}
                                 textAlign='center'
                                 _hover={{ bg: 'bg.subtle' }}
                                 transition='background 0.15s'
                              >
                                 <Text fontSize='sm' color='fg.muted'>
                                    +{positions.length - 5} more positions — View all
                                 </Text>
                              </Box>
                           </Link>
                        )}
                     </VStack>
                  )}
               </Box>
            )}

            <Separator />

            {/* Review Highlights */}
            {!isLoading && company && (
               <Box>
                  <Flex justify='space-between' align='center' mb={5}>
                     <Box>
                        <Text fontWeight='semibold' fontSize='xl'>Review Highlights</Text>
                        <Text fontSize='sm' color='fg.muted' mt={0.5}>
                           {company.total_reviews} total reviews
                        </Text>
                     </Box>
                     <Link to='/esap/$company_id/reviews' params={{ company_id }}>
                        <Button variant='outline' size='sm'>
                           <HStack gap={2}>
                              <Text>View all reviews</Text>
                              <FiArrowRight size={14} />
                           </HStack>
                        </Button>
                     </Link>
                  </Flex>

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(3,1fr)' }} gap={4}>
                     <HighlightReview sort='rating_desc' label='⭐ TOP RATED' company_id={company_id} />
                     <HighlightReview sort='year_desc' label='🕐 MOST RECENT' company_id={company_id} />
                     <HighlightReview sort='rating_asc' label='⚡ MOST CRITICAL' company_id={company_id} />
                  </Grid>
               </Box>
            )}
         </VStack>
      </Container>
   );
}

import { Image, Box, Flex, Grid, HStack, Text, VStack } from '@chakra-ui/react';
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
   Tooltip,
   XAxis,
   YAxis,
} from 'recharts';
import { omegaHex, ratingColorHex, ratingLabelShort } from './helpers';
import { useCompanyDetail } from './detailStore';

function OmegaTooltip({
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
   payload?: Array<{ name: string; value: number; color: string }>;
   label?: string;
}) {
   if (!active || !payload?.length) return null;
   return (
      <Box bg='bg' borderWidth='thin' borderRadius='lg' px={3} py={2} shadow='md' minW='160px'>
         <Text fontSize='xs' color='fg.muted' mb={1} fontWeight='semibold'>{label}</Text>
         {payload.map(p => (
            <Flex key={p.name} justify='space-between' gap={4}>
               <Text fontSize='xs' color='fg.muted'>{p.name}</Text>
               <Text fontSize='xs' fontWeight='bold' color={p.color}>
                  ${Number(p.value).toLocaleString()}
               </Text>
            </Flex>
         ))}
      </Box>
   );
}

export function Charts() {
   const company = useCompanyDetail(s => s.company);
   const positions = useCompanyDetail(s => s.positions);
   const isLoading = useCompanyDetail(s => s.isLoading);

   if (isLoading || !company) return null;

   const radarData = [
      { subject: 'Satisfaction', value: company.satisfaction_score ?? 0 },
      { subject: 'Trust', value: company.trust_score ?? 0 },
      { subject: 'Integrity', value: company.integrity_score ?? 0 },
      { subject: 'Growth', value: company.growth_score ?? 0 },
      { subject: 'Work-Life', value: company.work_life_score ?? 0 },
   ];

   const ratingsData = [
      { name: 'Collaboration', value: company.avg_rating_collaboration ?? 0 },
      { name: 'Work Variety', value: company.avg_rating_work_variety ?? 0 },
      { name: 'Relationships', value: company.avg_rating_relationships ?? 0 },
      { name: 'Supervisor', value: company.avg_rating_supervisor_access ?? 0 },
      { name: 'Training', value: company.avg_rating_training ?? 0 },
   ];

   const salaryData = positions
      .filter(p => p.avg_compensation != null || p.median_compensation != null)
      .sort((a, b) => (b.avg_compensation ?? 0) - (a.avg_compensation ?? 0))
      .slice(0, 12)
      .map(p => ({
         name: p.position_name.length > 22 ? `${p.position_name.slice(0, 20)}…` : p.position_name,
         fullName: p.position_name,
         avg: p.avg_compensation ?? 0,
         median: p.median_compensation ?? 0,
      }));

   const accentColor = omegaHex(company.omega_score);

   return (
      <VStack gap={6} align='stretch'>
         <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
            {/* Score Breakdown */}
            <Box borderWidth='thin' borderRadius='xl' p={5}>
               <Flex align='center' gap={2} mb={4}>
                  <Image src='/omegascore-logo.png' alt='OMΩ' h='22px' />
                  <Text fontWeight='semibold'>Score Breakdown</Text>
               </Flex>
               <ResponsiveContainer width='100%' height={260}>
                  <RadarChart data={radarData}>
                     <PolarGrid />
                     <PolarAngleAxis dataKey='subject' tick={{ fontSize: 12 }} />
                     <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                     <Radar
                        name='Score'
                        dataKey='value'
                        stroke={accentColor}
                        fill={accentColor}
                        fillOpacity={0.25}
                        strokeWidth={2}
                     />
                     <Tooltip content={<OmegaTooltip accentColor={accentColor} />} />
                  </RadarChart>
               </ResponsiveContainer>
            </Box>

            {/* Rating Breakdown */}
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
                              <Text fontSize='sm' fontWeight='medium' color='fg'>{name}</Text>
                              <HStack gap={2}>
                                 <Text fontSize='sm' fontWeight='semibold' color={color}>
                                    {Number(value).toFixed(2)} / 4
                                 </Text>
                                 <Text fontSize='xs' color='fg.muted'>{sentiment}</Text>
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
         </Grid>

         {/* Salary by Position */}
         {salaryData.length > 0 && (
            <Box borderWidth='thin' borderRadius='xl' p={5}>
               <Text fontWeight='semibold' mb={5}>Compensation by Position</Text>
               <ResponsiveContainer width='100%' height={Math.max(200, salaryData.length * 42)}>
                  <BarChart
                     data={salaryData}
                     layout='vertical'
                     margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
                     barCategoryGap='30%'
                     barGap={4}
                  >
                     <CartesianGrid strokeDasharray='3 3' horizontal={false} stroke='var(--chakra-colors-border)' />
                     <XAxis
                        type='number'
                        tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                     />
                     <YAxis
                        type='category'
                        dataKey='name'
                        width={148}
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                     />
                     <Tooltip content={<SalaryTooltip />} cursor={{ fill: 'var(--chakra-colors-bg-subtle)' }} />
                     <Bar dataKey='avg' name='Avg' radius={[0, 4, 4, 0]} fill={accentColor} fillOpacity={0.85} />
                     <Bar dataKey='median' name='Median' radius={[0, 4, 4, 0]} fill={accentColor} fillOpacity={0.4} />
                  </BarChart>
               </ResponsiveContainer>
               <HStack gap={4} mt={3} justify='center'>
                  <HStack gap={1.5}>
                     <Box w='10px' h='10px' borderRadius='sm' bg={accentColor} opacity={0.85} />
                     <Text fontSize='xs' color='fg.muted'>Avg</Text>
                  </HStack>
                  <HStack gap={1.5}>
                     <Box w='10px' h='10px' borderRadius='sm' bg={accentColor} opacity={0.4} />
                     <Text fontSize='xs' color='fg.muted'>Median</Text>
                  </HStack>
               </HStack>
            </Box>
         )}
      </VStack>
   );
}

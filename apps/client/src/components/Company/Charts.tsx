import { Box, Flex, Grid, HStack, Text, VStack } from '@chakra-ui/react';
import {
   PolarAngleAxis,
   PolarGrid,
   PolarRadiusAxis,
   Radar,
   RadarChart,
   ResponsiveContainer,
   Tooltip,
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
   const { subject, value } = item;
   return (
      <Box bg='bg' borderWidth='thin' borderRadius='lg' px={3} py={2} shadow='md' minW='120px'>
         <Text fontSize='xs' color='fg.muted' mb={0.5}>{subject}</Text>
         <Text fontSize='md' fontWeight='bold' color={accentColor}>{value}</Text>
         <Text fontSize='xs' color='fg.muted'>out of 100</Text>
      </Box>
   );
}

export function Charts() {
   const company = useCompanyDetail(s => s.company);
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
   return (
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
   );
}

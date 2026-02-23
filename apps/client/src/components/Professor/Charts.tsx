import { Box, Grid, Text } from '@chakra-ui/react';
import {
   Bar,
   BarChart,
   CartesianGrid,
   Rectangle,
   ResponsiveContainer,
   Tooltip,
   XAxis,
   YAxis,
} from 'recharts';
import { useProfessorDetail } from './detailStore';

function ChartTooltip({
   active,
   payload,
   label,
   labelKey,
}: {
   active?: boolean;
   payload?: { value: number; name: string }[];
   label?: string | number;
   labelKey?: string;
}) {
   if (!active || !payload?.length) return null;
   return (
      <Box bg='bg' borderWidth='thin' borderRadius='lg' px={3} py={2} shadow='md' minW='100px'>
         <Text fontSize='xs' color='fg.muted' mb={1}>{labelKey ?? 'Year'}: {label}</Text>
         {payload.map((entry, i) => (
            <Text key={i} fontSize='sm' fontWeight='semibold'>{entry.value} Sections</Text>
         ))}
      </Box>
   );
}

export function Charts() {
   const sections = useProfessorDetail(s => s.allSections);
   const isLoading = useProfessorDetail(s => s.isLoading);

   if (isLoading || sections.length === 0) return null;

   const sectionsPerYear = Object.entries(
      sections.reduce<Record<number, number>>((acc, s) => {
         const year = Math.floor(s.term_id / 100);
         acc[year] = (acc[year] ?? 0) + 1;
         return acc;
      }, {})
   )
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => a.year - b.year);

   const sectionsPerSubject = Object.entries(
      sections.reduce<Record<string, number>>((acc, s) => {
         acc[s.subject_code] = (acc[s.subject_code] ?? 0) + 1;
         return acc;
      }, {})
   )
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

   if (sectionsPerYear.length <= 1 && sectionsPerSubject.length === 0) return null;

   return (
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
         {sectionsPerYear.length > 1 && (
            <Box borderWidth='thin' borderRadius='xl' p={4}>
               <Text fontWeight='semibold' mb={4}>Sections per Year</Text>
               <ResponsiveContainer width='100%' height={220}>
                  <BarChart data={sectionsPerYear} margin={{ left: -10 }}>
                     <CartesianGrid strokeDasharray='3 3' vertical={false} />
                     <XAxis dataKey='year' tick={{ fontSize: 11 }} />
                     <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                     <Tooltip content={<ChartTooltip labelKey='Year' />} />
                     <Bar dataKey='count' fill='#3B82F6' radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </Box>
         )}
         {sectionsPerSubject.length > 0 && (
            <Box borderWidth='thin' borderRadius='xl' p={4}>
               <Text fontWeight='semibold' mb={4}>Sections by Subject</Text>
               <ResponsiveContainer width='100%' height={220}>
                  <BarChart data={sectionsPerSubject} layout='vertical' margin={{ left: 0, right: 16 }}>
                     <CartesianGrid strokeDasharray='3 3' horizontal={false} />
                     <XAxis type='number' tick={{ fontSize: 11 }} allowDecimals={false} />
                     <YAxis type='category' dataKey='subject' width={60} tick={{ fontSize: 11 }} />
                     <Tooltip content={<ChartTooltip labelKey='Subject' />} />
                     <Bar
                        dataKey='count'
                        maxBarSize={22}
                        shape={(props: any) => (
                           <Rectangle
                              {...props}
                              radius={[0, 4, 4, 0]}
                              fill={`hsl(${(props.index * 37) % 360}, 65%, 55%)`}
                           />
                        )}
                     />
                  </BarChart>
               </ResponsiveContainer>
            </Box>
         )}
      </Grid>
   );
}

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
import { CHART_COLORS, chartTick } from '@/lib/chartTheme';
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
      <Box bg='bg' borderWidth='thin' borderRadius='lg' px={3} py={2.5} shadow='md' minW='110px'>
         <Text fontSize='sm' color='fg.muted' mb={1}>
            {labelKey ?? 'Year'}: {label}
         </Text>
         {payload.map((entry, i) => (
            <Text key={i} fontSize='md' fontWeight='semibold'>
               {entry.value} Sections
            </Text>
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
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={{ base: 5, md: 6 }}>
         {sectionsPerYear.length > 1 && (
            <Box borderWidth='thin' borderRadius='xl' p={{ base: 4, md: 5 }}>
               <Text fontWeight='semibold' fontSize={{ base: 'md', md: 'lg' }} mb={4}>
                  Sections per Year
               </Text>
               <ResponsiveContainer width='100%' height={240}>
                  <BarChart data={sectionsPerYear} margin={{ left: -10 }}>
                     <CartesianGrid strokeDasharray='3 3' vertical={false} stroke={CHART_COLORS.grid} />
                     <XAxis dataKey='year' tick={chartTick(12)} axisLine={false} tickLine={false} />
                     <YAxis tick={chartTick(12)} allowDecimals={false} axisLine={false} tickLine={false} />
                     <Tooltip content={<ChartTooltip labelKey='Year' />} cursor={{ fill: CHART_COLORS.cursor }} />
                     <Bar dataKey='count' fill='var(--chakra-colors-blue-500)' radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </Box>
         )}
         {sectionsPerSubject.length > 0 && (
            <Box borderWidth='thin' borderRadius='xl' p={{ base: 4, md: 5 }}>
               <Text fontWeight='semibold' fontSize={{ base: 'md', md: 'lg' }} mb={4}>
                  Sections by Subject
               </Text>
               <ResponsiveContainer width='100%' height={240}>
                  <BarChart data={sectionsPerSubject} layout='vertical' margin={{ left: 0, right: 16 }}>
                     <CartesianGrid strokeDasharray='3 3' horizontal={false} stroke={CHART_COLORS.grid} />
                     <XAxis type='number' tick={chartTick(12)} allowDecimals={false} axisLine={false} tickLine={false} />
                     <YAxis type='category' dataKey='subject' width={68} tick={chartTick(12)} axisLine={false} tickLine={false} />
                     <Tooltip content={<ChartTooltip labelKey='Subject' />} cursor={{ fill: CHART_COLORS.cursor }} />
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

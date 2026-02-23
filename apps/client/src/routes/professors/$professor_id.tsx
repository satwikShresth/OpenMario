import {
   Badge,
   Box,
   Card,
   Container,
   Flex,
   Grid,
   HStack,
   Separator,
   Skeleton,
   Stat,
   Table,
   Tabs,
   Text,
   VStack,
} from '@chakra-ui/react';
import { useQueries } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { orpc } from '@/helpers/rpc.ts';
import {
   Bar,
   BarChart,
   CartesianGrid,
   Cell,
   ResponsiveContainer,
   Tooltip,
   XAxis,
   YAxis,
} from 'recharts';
import { FiExternalLink, FiStar } from 'react-icons/fi';

export const Route = createFileRoute('/professors/$professor_id')({
   component: ProfessorPage,
});

function currentTermId(): number {
   const now = new Date();
   const year = now.getFullYear();
   const month = now.getMonth() + 1;
   let term: number;
   if (month <= 3) term = 10;
   else if (month <= 6) term = 20;
   else if (month <= 9) term = 30;
   else term = 40;
   return year * 100 + term;
}

const termLabel = (termId: number) => {
   const year = Math.floor(termId / 100);
   const code = termId % 100;
   const seasonMap: Record<number, string> = { 10: 'Winter', 20: 'Spring', 30: 'Summer', 40: 'Fall' };
   return `${seasonMap[code] ?? 'Unknown'} ${year}`;
};

const ratingColor = (rating: number | null) => {
   if (rating === null) return 'gray';
   if (rating >= 4) return 'green';
   if (rating >= 3) return 'yellow';
   return 'red';
};

const ratingHex = (rating: number | null) => {
   if (rating === null) return '#9CA3AF';
   if (rating >= 4) return '#22C55E';
   if (rating >= 3) return '#EAB308';
   return '#EF4444';
};

const difficultyColor = (diff: number | null) => {
   if (diff === null) return 'gray';
   if (diff <= 2.5) return 'green';
   if (diff <= 3.5) return 'yellow';
   return 'red';
};

type Section = {
   section_crn: number;
   term_id: number;
   subject_code: string;
   course_number: string;
   course_title: string;
   section_code: string;
   instruction_method: string | null;
   instruction_type: string | null;
};

type ProfessorProfile = {
   instructor_id: number;
   instructor_name: string;
   department: string | null;
   avg_rating: number | null;
   avg_difficulty: number | null;
   num_ratings: number | null;
   rmp_id: string | null;
   total_sections_taught: number;
   total_courses_taught: number;
   total_terms_active: number;
   most_recent_term: number | null;
   subjects_taught: string[] | null;
   instruction_methods: string[] | null;
};


function SectionsTable({ sections, emptyMsg }: { sections: Section[]; emptyMsg: string }) {
   if (sections.length === 0) {
      return (
         <Box textAlign='center' py={8}>
            <Text color='fg.muted'>{emptyMsg}</Text>
         </Box>
      );
   }
   return (
      <Box overflowX='auto' maxH='400px' overflowY='auto'>
         <Table.Root size='sm'>
            <Table.Header position='sticky' top={0} bg='bg' zIndex={1}>
               <Table.Row>
                  <Table.ColumnHeader>Term</Table.ColumnHeader>
                  <Table.ColumnHeader>Course</Table.ColumnHeader>
                  <Table.ColumnHeader>Title</Table.ColumnHeader>
                  <Table.ColumnHeader>Section</Table.ColumnHeader>
                  <Table.ColumnHeader>Method</Table.ColumnHeader>
               </Table.Row>
            </Table.Header>
            <Table.Body>
               {sections.map(s => (
                  <Table.Row key={`${s.section_crn}-${s.term_id}`}>
                     <Table.Cell whiteSpace='nowrap'>{termLabel(s.term_id)}</Table.Cell>
                     <Table.Cell whiteSpace='nowrap'>
                        {s.subject_code} {s.course_number}
                     </Table.Cell>
                     <Table.Cell maxW='220px'>
                        <Text lineClamp={2} title={s.course_title} fontSize='sm'>
                           {s.course_title}
                        </Text>
                     </Table.Cell>
                     <Table.Cell>{s.section_code}</Table.Cell>
                     <Table.Cell>
                        {s.instruction_method ? (
                           <Badge size='sm' variant='surface' colorPalette='purple'>
                              {s.instruction_method}
                           </Badge>
                        ) : (
                           <Text color='fg.muted'>—</Text>
                        )}
                     </Table.Cell>
                  </Table.Row>
               ))}
            </Table.Body>
         </Table.Root>
      </Box>
   );
}

function ProfessorPage() {
   const { professor_id } = Route.useParams();
   const profIdNum = Number(professor_id);

   const [profileQuery, sectionsQuery] = useQueries({
      queries: [
         orpc.professor.get.queryOptions({
            input: { professor_id: profIdNum },
            staleTime: 30_000,
         }),
         orpc.professor.sections.queryOptions({
            input: { professor_id: profIdNum },
            staleTime: 30_000,
         }),
      ],
   });

   const cutoff = currentTermId();
   const allSections = (sectionsQuery.data as Section[] | undefined) ?? [];
   const pastSections = allSections.filter(s => s.term_id < cutoff);
   const upcomingSections = allSections.filter(s => s.term_id >= cutoff);

   const isLoading = profileQuery.isLoading || sectionsQuery.isLoading;
   const prof = profileQuery.data as ProfessorProfile | undefined;

   // Sections-per-year chart data
   const sectionsPerYear = Object.entries(
      allSections.reduce<Record<number, number>>((acc, s) => {
         const year = Math.floor(s.term_id / 100);
         acc[year] = (acc[year] ?? 0) + 1;
         return acc;
      }, {})
   )
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => a.year - b.year);

   // Sections per subject chart data
   const sectionsPerSubject = Object.entries(
      allSections.reduce<Record<string, number>>((acc, s) => {
         acc[s.subject_code] = (acc[s.subject_code] ?? 0) + 1;
         return acc;
      }, {})
   )
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

   // Instruction method breakdown
   const methodBreakdown = Object.entries(
      allSections.reduce<Record<string, number>>((acc, s) => {
         const method = s.instruction_method ?? 'Unknown';
         acc[method] = (acc[method] ?? 0) + 1;
         return acc;
      }, {})
   )
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count);

   return (
      <Container maxW='5xl' py={8}>
         <VStack align='stretch' gap={6}>
            <Breadcrumb items={[
            { type: 'link', label: 'Professors', to: '/professors' },
            prof?.instructor_name
               ? { type: 'current', label: prof.instructor_name }
               : { type: 'loading' },
         ]} />

            {/* Header */}
            {isLoading || !prof ? (
               <VStack align='stretch' gap={3}>
                  <Skeleton height='36px' width='300px' />
                  <Skeleton height='20px' width='200px' />
               </VStack>
            ) : (
               <Flex justify='space-between' align='flex-start' wrap='wrap' gap={4}>
                  <Box>
                     <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight='bold' lineHeight='1.2'>
                        {prof.instructor_name}
                     </Text>
                     <Text fontSize='md' color='fg.muted' mt={1}>
                        {prof.department ?? 'Unknown Department'}
                     </Text>
                     <HStack gap={2} mt={3} flexWrap='wrap'>
                        {prof.avg_rating != null && (
                           <Badge colorPalette={ratingColor(prof.avg_rating)} variant='subtle' px={3} py={1}>
                              <HStack gap={1}>
                                 <FiStar />
                                 <Text>{prof.avg_rating} / 5 rating</Text>
                              </HStack>
                           </Badge>
                        )}
                        {prof.avg_difficulty != null && (
                           <Badge colorPalette={difficultyColor(prof.avg_difficulty)} variant='subtle' px={3} py={1}>
                              Difficulty: {prof.avg_difficulty} / 5
                           </Badge>
                        )}
                        {prof.rmp_id != null && (
                           <a
                              href={`https://www.ratemyprofessors.com/professor/${prof.rmp_id}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              style={{ textDecoration: 'none' }}
                           >
                              <Badge variant='outline' px={3} py={1} cursor='pointer'>
                                 <HStack gap={1}>
                                    <Text>Rate My Professors</Text>
                                    <FiExternalLink />
                                 </HStack>
                              </Badge>
                           </a>
                        )}
                     </HStack>
                  </Box>
                  {prof.avg_rating != null && (
                     <Box textAlign='center' p={4} borderRadius='xl' borderWidth='thin' minW='100px'>
                        <Text
                           fontSize='3xl'
                           fontWeight='extrabold'
                           color={ratingHex(prof.avg_rating)}
                           lineHeight='1'
                        >
                           {prof.avg_rating}
                        </Text>
                        <Text fontSize='xs' color='fg.muted' letterSpacing='widest' mt={1}>/ 5 RATING</Text>
                     </Box>
                  )}
               </Flex>
            )}

            <Separator />

            {/* Stats Grid */}
            {isLoading || !prof ? (
               <Grid templateColumns={{ base: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }} gap={3}>
                  {Array.from({ length: 4 }).map((_, i) => (
                     <Skeleton key={i} height='80px' borderRadius='lg' />
                  ))}
               </Grid>
            ) : (
               <Grid templateColumns={{ base: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }} gap={3}>
                  {[
                     { label: 'No of Ratings', value: prof.num_ratings ?? 0 },
                     { label: 'Sections Taught', value: prof.total_sections_taught },
                     { label: 'Courses Taught', value: prof.total_courses_taught },
                     { label: 'Terms Active', value: prof.total_terms_active },
                  ].map(({ label, value }) => (
                     <Box key={label} borderWidth='thin' borderRadius='lg' p={4}>
                        <Stat.Root>
                           <Stat.Label fontSize='xs'>{label}</Stat.Label>
                           <Stat.ValueText fontSize='xl'>{value}</Stat.ValueText>
                        </Stat.Root>
                     </Box>
                  ))}
               </Grid>
            )}

            {/* Subjects Taught */}
            {!isLoading && prof?.subjects_taught && prof.subjects_taught.length > 0 && (
               <Box>
                  <Text fontSize='sm' color='fg.muted' mb={2}>Subjects Taught</Text>
                  <HStack gap={2} wrap='wrap'>
                     {prof.subjects_taught.map(s => (
                        <Badge key={s} variant='surface' colorPalette='blue'>{s}</Badge>
                     ))}
                  </HStack>
               </Box>
            )}

            {/* Charts */}
            {!isLoading && allSections.length > 0 && (
               <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                  {/* Sections per Year */}
                  {sectionsPerYear.length > 1 && (
                     <Box borderWidth='thin' borderRadius='xl' p={4}>
                        <Text fontWeight='semibold' mb={4}>Sections per Year</Text>
                        <ResponsiveContainer width='100%' height={220}>
                           <BarChart data={sectionsPerYear} margin={{ left: -10 }}>
                              <CartesianGrid strokeDasharray='3 3' vertical={false} />
                              <XAxis dataKey='year' tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                              <Tooltip formatter={(v: number | undefined) => [v ?? 0, 'Sections']} />
                              <Bar dataKey='count' fill='#3B82F6' radius={[4, 4, 0, 0]} maxBarSize={40} />
                           </BarChart>
                        </ResponsiveContainer>
                     </Box>
                  )}

                  {/* Sections per Subject */}
                  {sectionsPerSubject.length > 0 && (
                     <Box borderWidth='thin' borderRadius='xl' p={4}>
                        <Text fontWeight='semibold' mb={4}>Sections by Subject</Text>
                        <ResponsiveContainer width='100%' height={220}>
                           <BarChart data={sectionsPerSubject} layout='vertical' margin={{ left: 0, right: 16 }}>
                              <CartesianGrid strokeDasharray='3 3' horizontal={false} />
                              <XAxis type='number' tick={{ fontSize: 11 }} allowDecimals={false} />
                              <YAxis type='category' dataKey='subject' width={60} tick={{ fontSize: 11 }} />
                              <Tooltip formatter={(v: number | undefined) => [v ?? 0, 'Sections']} />
                              <Bar dataKey='count' radius={[0, 4, 4, 0]} maxBarSize={22}>
                                 {sectionsPerSubject.map((_, i) => (
                                    <Cell
                                       key={i}
                                       fill={`hsl(${(i * 37) % 360}, 65%, 55%)`}
                                    />
                                 ))}
                              </Bar>
                           </BarChart>
                        </ResponsiveContainer>
                     </Box>
                  )}
               </Grid>
            )}

            {/* Instruction Methods */}
            {!isLoading && methodBreakdown.length > 1 && (
               <Box borderWidth='thin' borderRadius='xl' p={4}>
                  <Text fontWeight='semibold' mb={3}>Instruction Methods</Text>
                  <HStack gap={3} wrap='wrap'>
                     {methodBreakdown.map(({ method, count }) => (
                        <Card.Root key={method} variant='outline' size='sm' borderRadius='lg' minW='120px'>
                           <Card.Body p={3} textAlign='center'>
                              <Text fontWeight='semibold' fontSize='lg'>{count}</Text>
                              <Text fontSize='xs' color='fg.muted'>{method}</Text>
                           </Card.Body>
                        </Card.Root>
                     ))}
                  </HStack>
               </Box>
            )}

            {/* Sections Tabs */}
            {!isLoading && (
               <Box>
                  <Text fontWeight='semibold' fontSize='lg' mb={3}>Sections</Text>
                  <Tabs.Root defaultValue='upcoming' variant='line'>
                     <Tabs.List>
                        <Tabs.Trigger value='upcoming'>
                           Upcoming / Current
                           {upcomingSections.length > 0 && (
                              <Badge ml={2} size='sm' colorPalette='green' variant='subtle'>
                                 {upcomingSections.length}
                              </Badge>
                           )}
                        </Tabs.Trigger>
                        <Tabs.Trigger value='past'>
                           Past Sections
                           {pastSections.length > 0 && (
                              <Badge ml={2} size='sm' colorPalette='gray' variant='subtle'>
                                 {pastSections.length}
                              </Badge>
                           )}
                        </Tabs.Trigger>
                     </Tabs.List>
                     <Tabs.Content value='upcoming'>
                        <SectionsTable sections={upcomingSections} emptyMsg='No upcoming sections found' />
                     </Tabs.Content>
                     <Tabs.Content value='past'>
                        <SectionsTable sections={pastSections} emptyMsg='No past sections found' />
                     </Tabs.Content>
                  </Tabs.Root>
               </Box>
            )}
         </VStack>
      </Container>
   );
}

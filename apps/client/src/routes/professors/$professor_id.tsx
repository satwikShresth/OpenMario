import {
   Badge,
   Box,
   Card,
   CloseButton,
   Dialog,
   Flex,
   Grid,
   HStack,
   Link as ChakraLink,
   Portal,
   Separator,
   Skeleton,
   Stat,
   Table,
   Tabs,
   Text,
   VStack,
} from '@chakra-ui/react';
import { useQueries } from '@tanstack/react-query';
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { orpc } from '@/helpers/rpc.ts';
import { FiExternalLink, FiStar } from 'react-icons/fi';

export const Route = createFileRoute('/professors/$professor_id')({
   component: ProfessorDialogPage,
});

/**
 * Computes a Drexel-style term ID (YYYYTT) for the current date.
 * Term codes: 10 = Winter (Jan–Mar), 20 = Spring (Apr–Jun),
 *             30 = Summer (Jul–Sep), 40 = Fall (Oct–Dec)
 */
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

const difficultyColor = (diff: number | null) => {
   if (diff === null) return 'gray';
   if (diff <= 2.5) return 'green';
   if (diff <= 3.5) return 'yellow';
   return 'red';
};

function ProfessorDialogPage() {
   const navigate = useNavigate();
   const professor_id = useParams({ strict: false, select: s => s?.professor_id ?? '' });
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
   const pastSections = (sectionsQuery.data ?? []).filter(s => s.term_id < cutoff);
   const upcomingSections = (sectionsQuery.data ?? []).filter(s => s.term_id >= cutoff);

   const isLoading = profileQuery.isLoading || sectionsQuery.isLoading;
   const prof = profileQuery.data;

   return (
      <Dialog.Root
         open
         onOpenChange={() => navigate({
            to: `..`,
            reloadDocument: false,
            resetScroll: false,
            replace: true,
         })}
         size='xl'
         placement='top'
         motionPreset='slide-in-bottom'
      >
         <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
               <Dialog.Content p={{ base: 4, md: 6 }} maxWidth='4xl' maxH='90vh' overflow='hidden' display='flex' flexDir='column'>
                  <Dialog.Header pb={2} flexShrink={0}>
                     {isLoading || !prof ? (
                        <Skeleton height='28px' width='280px' />
                     ) : (
                        <Dialog.Title>
                           <Flex justify='space-between' align='center' wrap='wrap' gap={2}>
                              <VStack align='flex-start' gap={0}>
                                 <Text fontSize='xs' color='fg.muted' mb={1}>Professor</Text>
                                 <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight='semibold' lineHeight='1.2'>
                                    {prof.instructor_name}
                                 </Text>
                                 <Text fontSize='sm' color='fg.muted'>
                                    {prof.department ?? 'Unknown Department'}
                                 </Text>
                              </VStack>
                              <HStack gap={2} flexWrap='wrap'>
                                 {prof.avg_rating != null && (
                                    <Badge colorPalette={ratingColor(prof.avg_rating)} variant='subtle' px={3} py={1}>
                                       <HStack gap={1}>
                                          <FiStar />
                                          <Text>{prof.avg_rating} / 5</Text>
                                       </HStack>
                                    </Badge>
                                 )}
                                 {prof.avg_difficulty != null && (
                                    <Badge colorPalette={difficultyColor(prof.avg_difficulty)} variant='subtle' px={3} py={1}>
                                       Difficulty: {prof.avg_difficulty} / 5
                                    </Badge>
                                 )}
                                 {prof.rmp_id != null && (
                                    <ChakraLink
                                       href={`https://www.ratemyprofessors.com/professor/${prof.rmp_id}`}
                                       target='_blank'
                                       rel='noopener noreferrer'
                                    >
                                       <Badge variant='outline' px={3} py={1} cursor='pointer'>
                                          <HStack gap={1}>
                                             <Text>RMP</Text>
                                             <FiExternalLink />
                                          </HStack>
                                       </Badge>
                                    </ChakraLink>
                                 )}
                              </HStack>
                           </Flex>
                        </Dialog.Title>
                     )}
                     <Dialog.CloseTrigger m={4} asChild>
                        <CloseButton size='sm' variant='outline' />
                     </Dialog.CloseTrigger>
                  </Dialog.Header>

               <Dialog.Body overflowY='auto' flex='1'>
                  {isLoading || !prof ? (
                     <VStack gap={4}>
                        <Skeleton height='100px' />
                        <Skeleton height='300px' />
                     </VStack>
                  ) : (
                     <VStack align='stretch' gap={5}>
                        <Separator />

                        {/* Stats Row */}
                        <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={3}>
                           <Card.Root variant='outline' size='sm'>
                              <Card.Body>
                                 <Stat.Root>
                                    <Stat.Label>No of Ratings</Stat.Label>
                                    <Stat.ValueText>{prof.num_ratings ?? 0}</Stat.ValueText>
                                 </Stat.Root>
                              </Card.Body>
                           </Card.Root>
                           <Card.Root variant='outline' size='sm'>
                              <Card.Body>
                                 <Stat.Root>
                                    <Stat.Label>Sections Taught</Stat.Label>
                                    <Stat.ValueText>{prof.total_sections_taught}</Stat.ValueText>
                                 </Stat.Root>
                              </Card.Body>
                           </Card.Root>
                           <Card.Root variant='outline' size='sm'>
                              <Card.Body>
                                 <Stat.Root>
                                    <Stat.Label>Courses Taught</Stat.Label>
                                    <Stat.ValueText>{prof.total_courses_taught}</Stat.ValueText>
                                 </Stat.Root>
                              </Card.Body>
                           </Card.Root>
                           <Card.Root variant='outline' size='sm'>
                              <Card.Body>
                                 <Stat.Root>
                                    <Stat.Label>Terms Active</Stat.Label>
                                    <Stat.ValueText>{prof.total_terms_active}</Stat.ValueText>
                                 </Stat.Root>
                              </Card.Body>
                           </Card.Root>
                        </Grid>

                        {/* Subjects */}
                        {prof.subjects_taught && prof.subjects_taught.length > 0 && (
                           <Box>
                              <Text fontSize='sm' color='fg.muted' mb={2}>Subjects</Text>
                              <HStack gap={2} wrap='wrap'>
                                 {prof.subjects_taught.map(s => (
                                    <Badge key={s} variant='surface' colorPalette='blue'>
                                       {s}
                                    </Badge>
                                 ))}
                              </HStack>
                           </Box>
                        )}

                        {/* Sections Tabs */}
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
                     </VStack>
                  )}
               </Dialog.Body>
               </Dialog.Content>
            </Dialog.Positioner>
         </Portal>
      </Dialog.Root>
   );
}

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

function SectionsTable({ sections, emptyMsg }: { sections: Section[]; emptyMsg: string }) {
   if (sections.length === 0) {
      return (
         <Box textAlign='center' py={8}>
            <Text color='fg.muted'>{emptyMsg}</Text>
         </Box>
      );
   }

   return (
      <Box overflowX='auto' maxH='360px' overflowY='auto'>
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
                     <Table.Cell maxW='200px'>
                        <Text lineClamp={2} title={s.course_title}>
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

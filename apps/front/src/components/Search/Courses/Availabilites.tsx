import { For, HoverCard, Portal, Table, Text, VStack } from '@chakra-ui/react';
import { getV1GraphCoursesAvailabilitiesByCourseIdOptions } from '@/client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tag } from '@/components/ui';

type AvailabilitesProps = {
   course_id: string;
};

export default ({ course_id }: AvailabilitesProps) => {
   const { data: courseAvailRaw } = useQuery(
      getV1GraphCoursesAvailabilitiesByCourseIdOptions({ path: { course_id } }),
   );
   const courseAvailInfo = courseAvailRaw ?? [];

   const availabilityTableData = useMemo(() => {
      if (!courseAvailInfo || courseAvailInfo.length === 0) {
         return [];
      }

      const parseTermInfo = (termCode: number): { year: string; termSuffix: string } => {
         const year = String(termCode).substring(0, 4);
         const termSuffix = String(termCode).substring(4); // Get "15", "25", "35", "45"
         return { year, termSuffix };
      };

      // Group data by year
      const yearGroups: Record<
         string,
         Record<string, Array<{ name: string; crn: string[]; instructor: Instructor | null }>>
      > = {};

      courseAvailInfo.forEach((item: CourseAvailabilityItem) => {
         const { year, termSuffix } = parseTermInfo(item.term);

         if (!yearGroups[year]) {
            yearGroups[year] = {
               '15': [], // Fall
               '25': [], // Winter
               '35': [], // Spring
               '45': [], // Summer
            };
         }

         const instructorName = item.instructor?.name || 'TBA';
         const crnString = String(item.crn);

         // Check if instructor already exists in this term
         const existingSection = yearGroups[year][termSuffix].find(
            (section) => section.name === instructorName,
         );

         if (existingSection) {
            // Add CRN to existing instructor's CRN array
            existingSection.crn.push(crnString);
         } else {
            // Create new entry for this instructor
            yearGroups[year][termSuffix].push({
               name: instructorName,
               crn: [crnString],
               instructor: item.instructor,
            });
         }
      });

      // Convert to desired array format
      const result = Object.keys(yearGroups)
         .sort()
         .map((year) => ({
            Year: year,
            15: yearGroups[year]['15'], // Fall
            25: yearGroups[year]['25'], // Winter
            35: yearGroups[year]['35'], // Spring
            45: yearGroups[year]['45'], // Summer
         }));

      return result;
   }, [courseAvailInfo]);

   if (availabilityTableData.length < 1) return null;

   return (
      <Table.Root
         size='sm'
         showColumnBorder
         variant='outline'
         colorPalette='bg'
      >
         <Table.Header>
            <Table.Row>
               <Table.ColumnHeader bgColor='Background'>
                  Year
               </Table.ColumnHeader>
               <For each={['Fall', 'Winter', 'Spring', 'Summer']}>
                  {(term: string) => (
                     <Table.ColumnHeader
                        key={term}
                        bgColor='Background'
                        width='25%'
                     >
                        {term}
                     </Table.ColumnHeader>
                  )}
               </For>
            </Table.Row>
         </Table.Header>
         <Table.Body>
            <For each={availabilityTableData}>
               {(yearData: any) => (
                  <Table.Row key={yearData.Year}>
                     <Table.Cell>{yearData.Year}</Table.Cell>
                     <For each={['15', '25', '35', '45']}>
                        {(termSuffix: string) => {
                           const sections = yearData[termSuffix] || [];

                           return (
                              <Table.Cell
                                 key={`${yearData.Year}-${termSuffix}`}
                                 textJustify='left'
                                 width='25%'
                              >
                                 {sections.length > 0
                                    ? (
                                       <VStack align='start' gap={2}>
                                          <For each={sections}>
                                             {(section: Section) => (
                                                <HoverCard.Root
                                                   key={`${section.name}-${section.crn.join('-')}`}
                                                >
                                                   <HoverCard.Trigger asChild>
                                                      <Tag
                                                         size='10px'
                                                         cursor='pointer'
                                                      >
                                                         {section.name} ({section.crn.join(', ')})
                                                      </Tag>
                                                   </HoverCard.Trigger>

                                                   <Portal>
                                                      <HoverCard.Positioner>
                                                         <HoverCard.Content maxWidth='280px'>
                                                            <HoverCard.Arrow />
                                                            <VStack
                                                               align='start'
                                                               gap={2}
                                                            >
                                                               <Text
                                                                  fontWeight='semibold'
                                                                  fontSize='sm'
                                                               >
                                                                  {section
                                                                        .instructor
                                                                     ? section
                                                                        .instructor
                                                                        .name
                                                                     : 'TBA'}
                                                               </Text>

                                                               <VStack
                                                                  align='start'
                                                                  gap={1}
                                                               >
                                                                  <Text fontSize='sm'>
                                                                     CRN{section.crn.length > 1
                                                                        ? 's'
                                                                        : ''}:{' '}
                                                                     {section.crn.join(', ')}
                                                                  </Text>

                                                                  {section
                                                                        .instructor
                                                                     ? (
                                                                        <>
                                                                           <Text fontSize='sm'>
                                                                              Rating:{' '}
                                                                              {section.instructor
                                                                                 .avg_rating}
                                                                              <Text
                                                                                 as='span'
                                                                                 color='gray.500'
                                                                                 ml={1}
                                                                              >
                                                                                 ({section
                                                                                    .instructor
                                                                                    .num_ratings}
                                                                                 {' '}
                                                                                 reviews)
                                                                              </Text>
                                                                           </Text>
                                                                           <Text fontSize='sm'>
                                                                              Difficulty: {section
                                                                                 .instructor
                                                                                 .avg_difficulty}
                                                                           </Text>
                                                                        </>
                                                                     )
                                                                     : (
                                                                        <Text
                                                                           fontSize='sm'
                                                                           color='gray.500'
                                                                        >
                                                                           Instructor not yet
                                                                           assigned
                                                                        </Text>
                                                                     )}
                                                               </VStack>
                                                            </VStack>
                                                         </HoverCard.Content>
                                                      </HoverCard.Positioner>
                                                   </Portal>
                                                </HoverCard.Root>
                                             )}
                                          </For>
                                       </VStack>
                                    )
                                    : (
                                       <Text color='gray.400'>
                                          No sections
                                       </Text>
                                    )}
                              </Table.Cell>
                           );
                        }}
                     </For>
                  </Table.Row>
               )}
            </For>
         </Table.Body>
      </Table.Root>
   );
};

interface Instructor {
   id: number;
   name: string;
   avg_difficulty: number;
   avg_rating: number;
   num_ratings: number;
}

interface CourseAvailabilityItem {
   term: number;
   crn: number;
   instructor: Instructor | null;
}

type Section = { name: string; crn: string[]; instructor?: Instructor | null };

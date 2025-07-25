import {
   Box,
   Card as CCard,
   Flex,
   For,
   HStack,
   Icon,
   Separator,
   Text,
   VStack,
} from '@chakra-ui/react';
import type { Section } from '@/types';
import { Tag, Tooltip } from '@/components/ui';
import { BiLinkExternal } from 'react-icons/bi';
import { Link, linkOptions } from '@tanstack/react-router';
import { getDifficultyColor, getRatingColor, weekItems } from './helpers';
import { formatTime } from '@/helpers';
import { useHits } from 'react-instantsearch';

export const Cards = () => {
   const infiniteHits = useHits<Section>();
   return (
      <For each={infiniteHits.items}>
         {(section) => <Card section={section} />}
      </For>
   );
};

export const Card = ({ section }: { section: Section }) => (
   <CCard.Root flex='content' p={2} width='full'>
      <CCard.Header>
         <Text fontSize='sm'>{section.college_name}</Text>
         <HStack>
            <Text fontSize='xl' fontWeight='semibold'>
               {section.course}: {section.title}
            </Text>
            <Text fontSize='sm'>({section.subject_name})</Text>
         </HStack>
         <Flex wrap='wrap' gap={3}>
            {section.credits ? <Tag size='lg'>Credits: {section.credits}</Tag> : null}
            <Tag size='lg'>{section.instruction_method}</Tag>
            <Tag size='lg'>{section.instruction_type}</Tag>
         </Flex>
      </CCard.Header>
      <CCard.Body>
         <Box borderRadius='lg' borderWidth='thin' p={2}>
            <Flex wrap='wrap' gap={3}>
               {section.days
                  ? (
                     <Tag size='xl'>
                        <HStack gap={.8} borderRadius='none'>
                           {weekItems.map((item) => (
                              <>
                                 <Tooltip content={item.value}>
                                    <Icon
                                       key={item.label}
                                       size='lg'
                                       as={section?.days.includes(item?.value)
                                          ? item.filledIcon
                                          : item.icon}
                                    />
                                 </Tooltip>
                              </>
                           ))}
                        </HStack>
                     </Tag>
                  )
                  : null}
               {section?.start_time
                  ? (
                     <Tag size='xl'>
                        Time:{' '}
                        {`${formatTime(section?.start_time)} - ${formatTime(section?.end_time)}`}
                     </Tag>
                  )
                  : null}
               <Tag size='xl'>Term: {section.term}</Tag>
               <Tag size='xl'>Section: {section.section}</Tag>
               <Tag size='xl'>CRN: {section.crn}</Tag>
            </Flex>
         </Box>
      </CCard.Body>
      <CCard.Footer>
         <Box width='full'>
            <Text fontSize='lg' fontWeight='semibold'>
               Instructors
            </Text>
            <Separator width='full' mb={2} />
            {section?.instructors?.length > 0
               ? (
                  <VStack align='start'>
                     <For each={section.instructors}>
                        {(instructor) => (
                           <HStack justify='space-between' width='full'>
                              <Text fontSize='md'>
                                 {instructor.name}
                              </Text>
                              <HStack>
                                 {instructor.avg_difficulty && (
                                    <Tag
                                       size='xl'
                                       colorPalette={getDifficultyColor(
                                          instructor.avg_difficulty,
                                       )}
                                    >
                                       Difficulty: {instructor.avg_difficulty.toFixed(1)}
                                    </Tag>
                                 )}

                                 {instructor.avg_rating && (
                                    <Tag
                                       size='xl'
                                       colorPalette={getRatingColor(
                                          instructor.avg_rating,
                                       )}
                                    >
                                       Rating: {instructor.avg_rating.toFixed(1)}
                                       {instructor.num_ratings &&
                                          ` (${instructor.num_ratings})`}
                                    </Tag>
                                 )}
                                 {instructor.rmp_id && (
                                    <Tag
                                       colorPalette='blue'
                                       as={Link}
                                       {...linkOptions({
                                          //@ts-ignore: shuuup
                                          to: `https://www.ratemyprofessors.com/professor/${instructor.rmp_id}`,
                                       })}
                                       size='xl'
                                    >
                                       <HStack>
                                          RMP<BiLinkExternal />
                                       </HStack>
                                    </Tag>
                                 )}
                              </HStack>
                           </HStack>
                        )}
                     </For>
                  </VStack>
               )
               : (
                  <Text fontSize='md'>
                     TBD
                  </Text>
               )}
         </Box>
      </CCard.Footer>
   </CCard.Root>
);

import { useHits, useHitsPerPage, usePagination } from 'react-instantsearch';
import {
   Box,
   ButtonGroup,
   Card,
   createListCollection,
   Flex,
   For,
   HStack,
   Icon,
   IconButton,
   Pagination,
   Portal,
   Select,
   Separator,
   Text,
   VStack,
} from '@chakra-ui/react';
import { Tag } from '@/components/ui';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import type { Section } from '@/types';
import { BiLinkExternal } from 'react-icons/bi';
import {
   TbSquareLetterF,
   TbSquareLetterFFilled,
   TbSquareLetterM,
   TbSquareLetterMFilled,
   TbSquareLetterT,
   TbSquareLetterTFilled,
   TbSquareLetterW,
   TbSquareLetterWFilled,
} from 'react-icons/tb';
import { Tooltip } from '@/components/ui';
import { formatTime } from '@/helpers';
import { Link } from '@tanstack/react-router';
import { linkOptions } from '@tanstack/react-router';
import { useMemo } from 'react';

const items = [
   { label: 'M', icon: TbSquareLetterM, filledIcon: TbSquareLetterMFilled, value: 'Monday' },
   { label: 'T', icon: TbSquareLetterT, filledIcon: TbSquareLetterTFilled, value: 'Tuesday' },
   { label: 'W', icon: TbSquareLetterW, filledIcon: TbSquareLetterWFilled, value: 'Wednesday' },
   { label: 'Th', icon: TbSquareLetterT, filledIcon: TbSquareLetterTFilled, value: 'Thrusday' },
   { label: 'F', icon: TbSquareLetterF, filledIcon: TbSquareLetterFFilled, value: 'Friday' },
];

function getRatingColor(rating: number, opacity: number = 1) {
   // Special case for 5.0 rating - must be exactly 5.0
   if (Math.abs(rating - 5.0) < 0.01) {
      return opacity < 1 ? 'yellow.600' : 'yellow.400';
   }
   // Scale: 1-2 (red), 2-3 (orange), 3-4 (yellow), 4-5 (green)
   if (rating >= 4) return opacity < 1 ? 'green' : 'green';
   if (rating >= 3) return opacity < 1 ? 'yellow' : 'yellow';
   if (rating >= 2) return opacity < 1 ? 'orange' : 'orange';
   return opacity < 1 ? 'red' : 'red';
}

// Helper function to get difficulty color
function getDifficultyColor(difficulty: number, opacity: number = 1) {
   // Scale: 1-2 (green/easy), 2-3 (blue/medium), 3-4 (purple/challenging), 4-5 (red/hard)
   if (difficulty >= 4) {
      return opacity < 1 ? 'red' : 'red';
   }
   if (difficulty >= 3) {
      return opacity < 1 ? 'purple' : 'purple';
   }
   if (difficulty >= 2) {
      return opacity < 1 ? 'blue' : 'blue';
   }
   return opacity < 1 ? 'green' : 'green';
}

export default () => {
   const infiniteHits = useHits<Section>();
   const instantPagination = usePagination();
   const hitsPerPage = useHitsPerPage({ items: pageSizes.items });
   const currentValue = useMemo(
      () => hitsPerPage.items.find(({ isRefined }) => isRefined)?.label!,
      [hitsPerPage.items],
   );
   console.log(currentValue);
   return (
      <VStack gap={5} align='start'>
         <For each={infiniteHits.items}>
            {(section) => (
               <Card.Root flex='content' p={2} width='full'>
                  <Card.Header>
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
                  </Card.Header>
                  <Card.Body>
                     <Box borderRadius='lg' borderWidth='thin' p={2}>
                        <Flex wrap='wrap' gap={3}>
                           {section.days
                              ? (
                                 <Tag size='xl'>
                                    <HStack gap={.8} borderRadius='none'>
                                       {items.map((item) => (
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
                                    {`${formatTime(section?.start_time)} - ${
                                       formatTime(section?.end_time)
                                    }`}
                                 </Tag>
                              )
                              : null}
                           <Tag size='xl'>Term: {section.term}</Tag>
                           <Tag size='xl'>Section: {section.section}</Tag>
                           <Tag size='xl'>CRN: {section.crn}</Tag>
                        </Flex>
                     </Box>
                  </Card.Body>
                  <Card.Footer>
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
                                                   Difficulty:{' '}
                                                   {instructor.avg_difficulty.toFixed(1)}
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
                  </Card.Footer>
               </Card.Root>
            )}
         </For>
         <HStack mt='3' justifySelf='center'>
            <Select.Root
               collection={pageSizes}
               defaultValue={['5']}
               value={[currentValue]}
               onValueChange={({ value }) => hitsPerPage.refine(parseInt(value[0]))}
               width='80px'
            >
               <Select.HiddenSelect />
               <Select.Control>
                  <Select.Trigger>
                     <Select.ValueText>
                        <Text ml={2}>{currentValue}</Text>
                     </Select.ValueText>
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                     <Select.Indicator />
                  </Select.IndicatorGroup>
               </Select.Control>
               <Portal>
                  <Select.Positioner>
                     <Select.Content>
                        {pageSizes.items.map((page) => (
                           <Select.Item item={page} key={page.value}>
                              {page.label}
                              <Select.ItemIndicator />
                           </Select.Item>
                        ))}
                     </Select.Content>
                  </Select.Positioner>
               </Portal>
            </Select.Root>
            <Pagination.Root
               page={instantPagination.currentRefinement}
               count={instantPagination.nbHits}
               pageSize={parseInt(currentValue)}
               onPageChange={({ page }) => instantPagination.refine(page)}
               siblingCount={3}
            >
               <ButtonGroup variant='ghost' size='sm'>
                  <Pagination.PrevTrigger asChild>
                     <IconButton>
                        <LuChevronLeft />
                     </IconButton>
                  </Pagination.PrevTrigger>

                  <Pagination.Items
                     render={(page) => (
                        <IconButton variant={{ base: 'ghost', _selected: 'outline' }}>
                           {page.value}
                        </IconButton>
                     )}
                  />

                  <Pagination.NextTrigger asChild>
                     <IconButton>
                        <LuChevronRight />
                     </IconButton>
                  </Pagination.NextTrigger>
               </ButtonGroup>
            </Pagination.Root>
         </HStack>
      </VStack>
   );
};

const pageSizes = createListCollection({
   items: [5, 10, 15, 20, 25, 30].map((value) => ({
      default: value === 10,
      label: String(value),
      value,
   })),
});

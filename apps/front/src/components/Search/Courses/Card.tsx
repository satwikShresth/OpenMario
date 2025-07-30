import {
   Box,
   Card as CCard,
   Flex,
   For,
   HoverCard,
   HStack,
   Icon,
   Portal,
   Separator,
   SkeletonText,
   Stack,
   Text,
   VStack,
} from '@chakra-ui/react';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import type { Section } from '@/types';
import { Tag, Tooltip } from '@/components/ui';
import { BiLinkExternal } from 'react-icons/bi';
import { Link, linkOptions } from '@tanstack/react-router';
import { getDifficultyColor, getRatingColor, weekItems } from './helpers';
import { formatTime } from '@/helpers';
import { useHits } from 'react-instantsearch';
import { useMobile } from '@/hooks';
import { useQuery } from '@tanstack/react-query';
import { getV1GraphPrereqByCourseIdOptions } from '@/client';

export const Cards = () => {
   const infiniteHits = useHits<Section>();
   return (
      <Flex
         direction='column'
         gap={5}
         width='full'
      >
         <For each={infiniteHits.items}>
            {(section) => (
               <Card
                  key={`${section.crn}-${section.instruction_method}-${section.instruction_type}`}
                  section={section}
               />
            )}
         </For>
      </Flex>
   );
};

export const Card = ({ section }: { section: Section }) => {
   const isMobile = useMobile();
   const { data, isPending } = useQuery(
      getV1GraphPrereqByCourseIdOptions({ path: { course_id: section.course_id } }),
   );

   const { data: preReqInfo } = data ?? {};
   return (
      <CCard.Root
         flex='1'
         p={{ base: 0, md: 3 }}
         width='full'
         maxWidth='full'
         overflow='hidden'
      >
         <CCard.Header pb={3}>
            <Stack
               direction={{ base: 'column', sm: 'row' }}
               width='full'
               gap={4}
               justify='space-between'
            >
               <Box>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} color='gray.600' mb={1}>
                     {section.college_name} ({section.subject_name})
                  </Text>
                  <VStack align='start' gap={2}>
                     <Flex
                        direction={{ base: 'column', sm: 'row' }}
                        align={{ base: 'start', sm: 'center' }}
                        gap={{ base: 1, sm: 2 }}
                        width='full'
                     >
                        <Text
                           fontSize={{ base: 'lg', md: 'xl' }}
                           fontWeight='semibold'
                           lineHeight='1.2'
                        >
                           {section.course}: {section.title}
                        </Text>
                     </Flex>
                  </VStack>
                  <Flex
                     wrap='wrap'
                     gap={{ base: 2, md: 3 }}
                     mt={3}
                  >
                     {section.credits
                        ? (
                           <Tag size={{ base: 'md', md: 'lg' }}>
                              Credits: {section.credits}
                           </Tag>
                        )
                        : null}
                     <Tag size={{ base: 'md', md: 'lg' }}>
                        {section.instruction_method}
                     </Tag>
                     <Tag size={{ base: 'md', md: 'lg' }}>
                        {section.instruction_type}
                     </Tag>
                  </Flex>
               </Box>

               {section.days && section.days.length > 0
                  ? (
                     <Tag
                        size='xl'
                        width={isMobile ? 'full' : 'fit-content'}
                        minWidth='fit-content'
                        display='flex'
                        justifyContent='center'
                        alignItems='center'
                        px={4}
                        py={2}
                        maxH='24'
                     >
                        <VStack>
                           <HStack
                              gap={4}
                              justify='center'
                              align='center'
                              width='auto'
                           >
                              {weekItems.map((item) => (
                                 <Tooltip key={item.label} content={item.value}>
                                    <Icon
                                       size='lg'
                                       as={section?.days.includes(item?.value)
                                          ? item.filledIcon
                                          : item.icon}
                                    />
                                 </Tooltip>
                              ))}
                           </HStack>

                           {section?.start_time
                              ? (
                                 <Text fontSize='sm'>
                                    {`${formatTime(section?.start_time)} - ${
                                       formatTime(section?.end_time)
                                    }`}
                                 </Text>
                              )
                              : null}
                        </VStack>
                     </Tag>
                  )
                  : null}
            </Stack>
         </CCard.Header>

         <CCard.Body py={3} gap={3}>
            <Box
               borderRadius='lg'
               borderWidth='thin'
               p={{ base: 2, md: 3 }}
               overflow='hidden'
            >
               <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  wrap='wrap'
                  gap={{ base: 2, md: 3 }}
               >
                  <Tag size='xl'>
                     Term: {section.term}
                  </Tag>
                  <Tag size={{ base: 'lg', md: 'xl' }}>
                     Section: {section.section}
                  </Tag>
                  <Tag size={{ base: 'lg', md: 'xl' }}>
                     CRN: {section.crn}
                  </Tag>
               </Flex>
            </Box>
            <Flex
               width='full'
               borderRadius='lg'
               borderWidth='thin'
               p={{ base: 2, md: 3 }}
               align='center'
               gap={3}
            >
               <Text
                  fontSize={{ base: 'md', md: 'lg' }}
                  fontWeight='medium'
               >
                  Prerequisite:
               </Text>
               {!isPending
                  ? (
                     (preReqInfo?.prerequisites.length! > 0)
                        ? (
                           <HStack align='start' gap={3} wrap='wrap'>
                              <For each={preReqInfo?.prerequisites}>
                                 {(preReqGroup, idx) => (
                                    <>
                                       {(idx === 0) ? null : <Text>and</Text>}
                                       <For each={preReqGroup}>
                                          {(preReq, courseIdx) => (
                                             <Flex>
                                                <HoverCard.Root size='md'>
                                                   <HoverCard.Trigger asChild>
                                                      <HStack gap={2}>
                                                         {(courseIdx === 0)
                                                            ? preReqGroup.length > 1 ? '(' : null
                                                            : 'or'}
                                                         <Tag
                                                            as={Link}
                                                            {...linkOptions({
                                                               //@ts-ignore: hsupp
                                                               to: `/courses/${preReq?.id!}`,
                                                               reloadDocument: false,
                                                               resetScroll: false,
                                                               replace: true,
                                                            })}
                                                            minHeight='7'
                                                            size='lg'
                                                            colorScheme='blue'
                                                            cursor='pointer'
                                                            _hover={{ bg: 'blue.100' }}
                                                            endElement={
                                                               <IoIosInformationCircleOutline />
                                                            }
                                                         >
                                                            {`${preReq.subjectId} ${preReq.courseNumber}`}
                                                         </Tag>
                                                         {(preReqGroup.length > 1 &&
                                                               preReqGroup.length - 1 === courseIdx)
                                                            ? ')'
                                                            : null}
                                                      </HStack>
                                                   </HoverCard.Trigger>

                                                   <Portal>
                                                      <HoverCard.Positioner>
                                                         <HoverCard.Content maxWidth='280px'>
                                                            <HoverCard.Arrow />
                                                            <VStack align='start' gap={2}>
                                                               <Text
                                                                  fontWeight='semibold'
                                                                  fontSize='sm'
                                                               >
                                                                  {`${preReq.subjectId} ${preReq.courseNumber}: ${preReq.name}`}
                                                               </Text>

                                                               <VStack
                                                                  align='start'
                                                                  gap={1}
                                                               >
                                                                  <Text>
                                                                     {'Minimum Grade: '}
                                                                     {preReq.minimumGrade}
                                                                  </Text>

                                                                  {preReq.canTakeConcurrent && (
                                                                     <Text color='green.600'>
                                                                        ✓ Can take concurrently
                                                                     </Text>
                                                                  )}
                                                               </VStack>
                                                            </VStack>
                                                         </HoverCard.Content>
                                                      </HoverCard.Positioner>
                                                   </Portal>
                                                </HoverCard.Root>
                                             </Flex>
                                          )}
                                       </For>
                                    </>
                                 )}
                              </For>
                           </HStack>
                        )
                        : <Text>None</Text>
                  )
                  : <SkeletonText noOfLines={1} gap='4' />}
            </Flex>
         </CCard.Body>

         <CCard.Footer pt={3}>
            <Box width='full'>
               <Text
                  fontSize={{ base: 'md', md: 'lg' }}
                  fontWeight='semibold'
                  mb={2}
               >
                  Instructors
               </Text>
               <Separator width='full' mb={3} />

               {section?.instructors?.length > 0
                  ? (
                     <VStack align='start' gap={3}>
                        <For each={section.instructors}>
                           {(instructor) => (
                              <Flex
                                 key={`${section.crn}-${instructor.id}`}
                                 borderRadius='lg'
                                 borderWidth={isMobile ? 1 : 0}
                                 direction={{ base: 'column', md: 'row' }}
                                 justify={{ base: 'start', md: 'space-between' }}
                                 align={{ base: 'start', md: 'center' }}
                                 width='full'
                                 height='fit-content'
                                 p={isMobile ? 2 : undefined}
                              >
                                 <Text
                                    fontSize='md'
                                    fontWeight='medium'
                                    p={1}
                                    mb={{ base: 2, md: 0 }}
                                 >
                                    {instructor.name}
                                 </Text>

                                 <Flex
                                    wrap='wrap'
                                    gap={2}
                                    align='center'
                                 >
                                    {instructor.avg_difficulty && (
                                       <Tag
                                          size={{ base: 'md', md: 'lg' }}
                                          colorPalette={getDifficultyColor(
                                             instructor.avg_difficulty,
                                          )}
                                       >
                                          <Text fontSize={{ base: 'xs', md: 'sm' }}>
                                             Difficulty: {instructor.avg_difficulty.toFixed(1)}
                                          </Text>
                                       </Tag>
                                    )}

                                    {instructor.avg_rating && (
                                       <Tag
                                          size={{ base: 'md', md: 'lg' }}
                                          colorPalette={getRatingColor(
                                             instructor.avg_rating,
                                          )}
                                       >
                                          <Text fontSize={{ base: 'xs', md: 'sm' }}>
                                             Rating: {instructor.avg_rating.toFixed(1)}
                                             {instructor.num_ratings &&
                                                ` (${instructor.num_ratings})`}
                                          </Text>
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
                                          size={{ base: 'md', md: 'lg' }}
                                          cursor='pointer'
                                          _hover={{ opacity: 0.8 }}
                                       >
                                          <HStack gap={1}>
                                             <Text fontSize={{ base: 'xs', md: 'sm' }}>
                                                RMP
                                             </Text>
                                             <BiLinkExternal size={14} />
                                          </HStack>
                                       </Tag>
                                    )}
                                 </Flex>
                              </Flex>
                           )}
                        </For>
                     </VStack>
                  )
                  : (
                     <Text fontSize={{ base: 'sm', md: 'md' }} color='gray.500'>
                        TBD
                     </Text>
                  )}
            </Box>
         </CCard.Footer>
      </CCard.Root>
   );
};

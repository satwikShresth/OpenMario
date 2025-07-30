import { createFileRoute } from '@tanstack/react-router';
import {
   Box,
   CloseButton,
   Dialog,
   Flex,
   For,
   HoverCard,
   HStack,
   Portal,
   SkeletonText,
   Text,
   VStack,
} from '@chakra-ui/react';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { getV1CoursesByCourseIdOptions, getV1PrereqByCourseIdOptions } from '@/client';
import { useQuery } from '@tanstack/react-query';
import { Tag } from '@/components/ui';

export const Route = createFileRoute('/_search/courses/$course_id')({
   component: () => {
      const { course_id } = Route.useParams();
      const navigate = Route.useNavigate();
      const { data: preReqRaw, isPending: preReqPending } = useQuery(
         getV1PrereqByCourseIdOptions({ path: { course_id } }),
      );
      const { data: preReqInfo } = preReqRaw ?? {};

      const { data: courseRaw } = useQuery(getV1CoursesByCourseIdOptions({ path: { course_id } }));
      const { data: courseInfo } = courseRaw ?? {};

      if (!courseInfo) return null;

      return (
         <Dialog.Root
            open
            onOpenChange={() => navigate({ to: `/courses` })}
            size='xl'
            placement='top'
            motionPreset='slide-in-bottom'
         >
            <Portal>
               <Dialog.Backdrop />
               <Dialog.Positioner>
                  <Dialog.Content p={{ base: 4, md: 6 }} maxWidth='4xl' overflow='hidden'>
                     <Dialog.Header pb={4}>
                        <Dialog.Title>
                           <Box>
                              <Text fontSize='sm' color='gray.600' mb={1}>
                                 Course Information
                              </Text>
                              <VStack align='start' gap={2}>
                                 <Text
                                    fontSize={{ base: 'xl', md: '2xl' }}
                                    fontWeight='semibold'
                                    lineHeight='1.2'
                                 >
                                    {courseInfo.subject_id} {courseInfo.course_number}:{' '}
                                    {courseInfo.title}
                                 </Text>
                              </VStack>
                              <Flex
                                 wrap='wrap'
                                 gap={{ base: 2, md: 3 }}
                                 mt={3}
                              >
                                 <Tag size={{ base: 'md', md: 'lg' }}>
                                    Credits: {courseInfo.credits}
                                 </Tag>
                                 {courseInfo.writing_intensive && (
                                    <Tag size={{ base: 'md', md: 'lg' }} colorPalette='green'>
                                       Writing Intensive
                                    </Tag>
                                 )}
                              </Flex>
                           </Box>
                        </Dialog.Title>
                        <Dialog.CloseTrigger m={4} asChild>
                           <CloseButton size='sm' variant='outline' />
                        </Dialog.CloseTrigger>
                     </Dialog.Header>

                     <Dialog.Body py={4}>
                        <VStack align='stretch' gap={4}>
                           {/* Description */}
                           <Box
                              borderRadius='lg'
                              borderWidth='thin'
                              p={{ base: 3, md: 4 }}
                              overflow='hidden'
                           >
                              <Text
                                 fontSize={{ base: 'md', md: 'lg' }}
                                 fontWeight='medium'
                                 mb={2}
                              >
                                 Description
                              </Text>
                              <Text
                                 fontSize={{ base: 'sm', md: 'md' }}
                                 color='gray.700'
                                 lineHeight='1.6'
                              >
                                 {courseInfo.description}
                              </Text>
                           </Box>

                           {/* Course Details */}
                           <Box
                              borderRadius='lg'
                              borderWidth='thin'
                              p={{ base: 3, md: 4 }}
                              overflow='hidden'
                           >
                              <Text
                                 fontSize={{ base: 'md', md: 'lg' }}
                                 fontWeight='medium'
                                 mb={3}
                              >
                                 Course Details
                              </Text>
                              <Flex
                                 direction={{ base: 'column', sm: 'row' }}
                                 wrap='wrap'
                                 gap={{ base: 2, md: 3 }}
                              >
                                 {(courseInfo.writing_intensive)
                                    ? (
                                       <Tag size={{ base: 'lg', md: 'xl' }}>
                                          Writing Intensive
                                       </Tag>
                                    )
                                    : null}
                                 <Tag size={{ base: 'lg', md: 'xl' }}>
                                    {courseInfo.repeat_status}
                                 </Tag>
                              </Flex>
                           </Box>

                           {/* Prerequisites */}
                           <Box
                              borderRadius='lg'
                              borderWidth='thin'
                              p={{ base: 3, md: 4 }}
                              overflow='hidden'
                           >
                              <Text
                                 fontSize={{ base: 'md', md: 'lg' }}
                                 fontWeight='medium'
                                 mb={3}
                              >
                                 Prerequisites
                              </Text>
                              {!preReqPending
                                 ? (
                                    (preReqInfo?.prerequisites?.length! > 0)
                                       ? (
                                          <HStack align='start' gap={3} wrap='wrap'>
                                             <For each={preReqInfo?.prerequisites}>
                                                {(preReqGroup, idx) => (
                                                   <>
                                                      {(idx === 0) ? null : <Text>and</Text>}
                                                      <For each={preReqGroup}>
                                                         {(preReq, courseIdx) => (
                                                            <Flex
                                                               key={`${preReq.subjectId}-${preReq.courseNumber}`}
                                                            >
                                                               <HoverCard.Root size='md'>
                                                                  <HoverCard.Trigger asChild>
                                                                     <HStack gap={2}>
                                                                        {(courseIdx === 0)
                                                                           ? preReqGroup.length > 1
                                                                              ? '('
                                                                              : null
                                                                           : 'or'}
                                                                        <Tag
                                                                           minHeight='7'
                                                                           size='lg'
                                                                           colorPalette='blue'
                                                                           cursor='pointer'
                                                                           _hover={{
                                                                              bg: 'blue.100',
                                                                           }}
                                                                           endElement={
                                                                              <IoIosInformationCircleOutline />
                                                                           }
                                                                        >
                                                                           {`${preReq.subjectId} ${preReq.courseNumber}`}
                                                                        </Tag>
                                                                        {(preReqGroup.length > 1 &&
                                                                              preReqGroup.length -
                                                                                       1 ===
                                                                                 courseIdx)
                                                                           ? ')'
                                                                           : null}
                                                                     </HStack>
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
                                                                                 {`${preReq.subjectId} ${preReq.courseNumber}: ${preReq.name}`}
                                                                              </Text>

                                                                              <VStack
                                                                                 align='start'
                                                                                 gap={1}
                                                                              >
                                                                                 <Text fontSize='sm'>
                                                                                    {'Minimum Grade: '}
                                                                                    {preReq
                                                                                       .minimumGrade}
                                                                                 </Text>

                                                                                 {preReq
                                                                                    .canTakeConcurrent &&
                                                                                    (
                                                                                       <Text
                                                                                          color='green.600'
                                                                                          fontSize='sm'
                                                                                       >
                                                                                          ✓ Can take
                                                                                          concurrently
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
                                       : <Text color='gray.500'>None</Text>
                                 )
                                 : <SkeletonText noOfLines={1} gap='4' />}
                           </Box>
                        </VStack>
                     </Dialog.Body>
                  </Dialog.Content>
               </Dialog.Positioner>
            </Portal>
         </Dialog.Root>
      );
   },
});

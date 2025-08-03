import { createFileRoute } from '@tanstack/react-router';
import { Box, CloseButton, Dialog, Flex, Portal, Text, VStack } from '@chakra-ui/react';
import { getV1GraphCoursesByCourseIdOptions } from '@/client';
import { useQuery } from '@tanstack/react-query';
import { Tag } from '@/components/ui';
import { Search } from '@/components/Search';

export const Route = createFileRoute('/_search/courses/$course_id')({
   component: () => {
      const { course_id } = Route.useParams();
      const navigate = Route.useNavigate();

      const { data: courseRaw } = useQuery(
         getV1GraphCoursesByCourseIdOptions({ path: { course_id } }),
      );
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
                                 fontWeight='semibold'
                                 mb={2}
                              >
                                 Description:
                              </Text>
                              <Text
                                 fontSize={{ base: 'sm', md: 'md' }}
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
                                 fontWeight='semibold'
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
                              <Search.Courses.PreReq course_id={course_id} />
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

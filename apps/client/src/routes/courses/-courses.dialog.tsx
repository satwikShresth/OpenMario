import { Box, Flex, Separator, Skeleton, Text, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Tag } from '@/components/ui';
import { Search } from '@/components/Search';
import { orpc } from '@/helpers';
import { useParams } from '@tanstack/react-router';
import CourseInstructorHistory from '@/components/Search/Courses/CourseInstructorHistory';

export function CourseDialogPage() {
   const course_id = useParams({ strict: false, select: (s) => s?.course_id! });

   const { data: courseInfo, isLoading } = useQuery(
      orpc.course.course.queryOptions({
         input: { params: { course_id } },
         select: (s) => s.data!
      })
   );

   return (
      <Box maxW='4xl' mx='auto' py={4}>
         {isLoading || !courseInfo
            ? (
               <VStack align='stretch' gap={4}>
                  <Skeleton height='10' />
                  <Skeleton height='6' width='60%' />
                  <Skeleton height='40' />
               </VStack>
            )
            : (
               <VStack align='stretch' gap={5}>
                  {/* Header */}
                  <Box>
                     <Text fontSize='sm' color='gray.500' mb={1}>
                        {courseInfo.subject_id} {courseInfo.course_number}
                     </Text>
                     <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight='semibold' lineHeight='1.3' mb={3}>
                        {courseInfo.title}
                     </Text>
                     <Flex wrap='wrap' gap={2}>
                        <Tag size={{ base: 'md', md: 'lg' }}>Credits: {courseInfo.credits}</Tag>
                        {courseInfo.instruction_method && (
                           <Tag size={{ base: 'md', md: 'lg' }}>{courseInfo.instruction_method}</Tag>
                        )}
                        {courseInfo.instruction_type && (
                           <Tag size={{ base: 'md', md: 'lg' }}>{courseInfo.instruction_type}</Tag>
                        )}
                        {courseInfo.writing_intensive && (
                           <Tag size={{ base: 'md', md: 'lg' }} colorPalette='blue'>Writing Intensive</Tag>
                        )}
                        {courseInfo.repeat_status && (
                           <Tag size={{ base: 'md', md: 'lg' }}>{courseInfo.repeat_status}</Tag>
                        )}
                     </Flex>
                  </Box>

                  <Separator />

                  {/* Description */}
                  {courseInfo.description && (
                     <Box>
                        <Text fontSize='md' fontWeight='semibold' mb={2}>Description</Text>
                        <Text fontSize='sm' lineHeight='1.7' color='gray.600'>
                           {courseInfo.description}
                        </Text>
                     </Box>
                  )}

                  {/* Prereqs / Coreqs */}
                  <Search.Courses.Req course_id={course_id} />

                  <Separator />

                  {/* Offering history + instructor breakdown */}
                  <CourseInstructorHistory course_id={course_id} />
               </VStack>
            )}
      </Box>
   );
}

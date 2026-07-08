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
      <Box maxW='5xl' mx='auto' py={{ base: 6, md: 8 }} px={{ base: 3, md: 4 }}>
         {isLoading || !courseInfo
            ? (
               <VStack align='stretch' gap={5}>
                  <Skeleton height='12' borderRadius='md' />
                  <Skeleton height='8' width='65%' borderRadius='md' />
                  <Skeleton height='48' borderRadius='lg' />
               </VStack>
            )
            : (
               <VStack align='stretch' gap={{ base: 6, md: 8 }}>
                  <Box>
                     <Text fontSize={{ base: 'md', md: 'lg' }} color='fg' mb={2}>
                        {courseInfo.subject_id} {courseInfo.course_number}
                     </Text>
                     <Text
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight='semibold'
                        lineHeight='1.25'
                        mb={4}
                     >
                        {courseInfo.title}
                     </Text>
                     <Flex wrap='wrap' gap={3}>
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

                  {courseInfo.description && (
                     <Box>
                        <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight='semibold' mb={3}>
                           Description
                        </Text>
                        <Text fontSize={{ base: 'md', md: 'lg' }} lineHeight='1.75' color='fg'>
                           {courseInfo.description}
                        </Text>
                     </Box>
                  )}

                  <Search.Courses.ReqSection course_id={course_id} />

                  <Separator />

                  <CourseInstructorHistory course_id={course_id} />
               </VStack>
            )}
      </Box>
   );
}

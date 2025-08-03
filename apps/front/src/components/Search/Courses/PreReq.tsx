import {
   Box,
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
import { getV1GraphPrereqByCourseIdOptions } from '@/client';
import { useQuery } from '@tanstack/react-query';
import { Tag } from '@/components/ui';
import { Link } from '@tanstack/react-router';
import { linkOptions } from '@tanstack/react-router';

type PreReqProps = {
   course_id: string;
};
export default ({ course_id }: PreReqProps) => {
   const { data: preReqRaw, isPending } = useQuery(
      getV1GraphPrereqByCourseIdOptions({ path: { course_id } }),
   );
   const { data: preReqInfo } = preReqRaw ?? {};

   return (
      <>
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
                                                      endElement={<IoIosInformationCircleOutline />}
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
      </>
   );
};

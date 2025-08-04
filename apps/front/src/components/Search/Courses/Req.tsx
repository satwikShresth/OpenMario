import { Flex, For, HoverCard, HStack, Portal, Text, VStack } from '@chakra-ui/react';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { getV1GraphReqByCourseIdOptions } from '@/client';
import { useQuery } from '@tanstack/react-query';
import { Tag } from '@/components/ui';
import { Link } from '@tanstack/react-router';
import { linkOptions } from '@tanstack/react-router';

type PreReqProps = {
   course_id: string;
};

export default ({ course_id }: PreReqProps) => {
   const { data: preReqRaw, isPending } = useQuery(
      getV1GraphReqByCourseIdOptions({ path: { course_id } }),
   );
   const { data: reqInfo } = preReqRaw ?? {};

   if (isPending) return null;

   return (
      <VStack width='full' gap={4} align='stretch'>
         {/* Prerequisites Section */}
         {(reqInfo?.prerequisites?.length! > 0)
            ? (
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
                  <HStack align='start' gap={3} wrap='wrap'>
                     <For each={reqInfo?.prerequisites}>
                        {(preReqGroup, idx) => (
                           <>
                              {idx === 0 ? null : <Text>and</Text>}
                              <HStack>
                                 <For each={preReqGroup}>
                                    {(preReq, courseIdx) => (
                                       <Flex>
                                          <HoverCard.Root size='md'>
                                             <HoverCard.Trigger asChild>
                                                <HStack gap={2}>
                                                   {courseIdx === 0
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
                                                   {preReqGroup.length > 1 &&
                                                         preReqGroup.length - 1 === courseIdx
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

                                                         <VStack align='start' gap={1}>
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
                              </HStack>
                           </>
                        )}
                     </For>
                  </HStack>
               </Flex>
            )
            : null}

         {/* Corequisites Section */}
         {(reqInfo?.corequisites?.length! > 0)
            ? (
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
                     Corequisite:
                  </Text>
                  <HStack align='start' gap={3} wrap='wrap'>
                     <For each={reqInfo?.corequisites}>
                        {(coreq) => (
                           <Flex>
                              <Tag
                                 as={Link}
                                 {...linkOptions({
                                    //@ts-ignore: hsupp
                                    to: `/courses/${coreq?.id!}`,
                                    reloadDocument: false,
                                    resetScroll: false,
                                    replace: true,
                                 })}
                                 minHeight='7'
                                 size='lg'
                                 colorScheme='green'
                                 cursor='pointer'
                                 _hover={{ bg: 'green.100' }}
                              >
                                 {`${coreq?.subjectId} ${coreq?.courseNumber}`}
                              </Tag>
                           </Flex>
                        )}
                     </For>
                  </HStack>
               </Flex>
            )
            : null}
      </VStack>
   );
};

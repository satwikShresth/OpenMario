import {
   Box,
   Card as CCard,
   Clipboard,
   Flex,
   For,
   HStack,
   Icon,
   IconButton,
   Separator,
   Stack,
   Text,
   VStack,
} from '@chakra-ui/react';
import type { Section } from '@/types';
import { Tag, Tooltip } from '@/components/ui';
import { BiLinkExternal } from 'react-icons/bi';
import { Link, linkOptions, useMatch } from '@tanstack/react-router';
import { getDifficultyColor, getRatingColor, weekItems } from './helpers';
import { formatTime, orpc } from '@/helpers';
import { useHits } from 'react-instantsearch';
import { useMobile } from '@/hooks';
import Req from './Req.tsx';
import { useQuery } from '@tanstack/react-query';
import Availabilites from './Availabilites.tsx';
import { RiHeartFill, RiHeartLine } from 'react-icons/ri';
import { sectionsCollection, termsCollection, coursesCollection } from '@/helpers/collections';
import { eq, and, useLiveQuery } from '@tanstack/react-db';
import { toaster } from '@/components/ui/toaster';

export const Cards = () => {
   const infiniteHits = useHits<Section>();
   return (
      <Flex
         direction='column'
         gap={5}
         width='full'
      >
         <For each={infiniteHits.items}
         >
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
   const match = useMatch({ strict: false });
   const { data: courseRaw } = useQuery(
      orpc.graph.course.queryOptions({ input: { course_id: section.course_id } })
   );
   const { data: courseInfo } = courseRaw ?? {};

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
                           _hover={{ textDecoration: 'underline' }}
                           as={Link}
                           {...linkOptions({
                              //@ts-ignore: hsupp
                              to: `${match.fullPath}/${section?.course_id!}`,
                              reloadDocument: false,
                              resetScroll: false,
                              replace: true,
                           })}
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
                     {courseInfo?.writing_intensive && (
                        <Tag size={{ base: 'md', md: 'lg' }} colorPalette='blue'>
                           Writing Intensive
                        </Tag>
                     )}
                  </Flex>
               </Box>
               <Flex>
                  {section.days && section.days.length > 0
                     ? (
                        <HStack align='normal'>
                           <Tag
                              size='xl'
                              width={isMobile ? 'full' : 'fit-content'}
                              minWidth='fit-content'
                              display='flex'
                              justifyContent='center'
                              alignItems='center'
                              px={4}
                              py={2}
                              maxW='64'
                              maxH='28'
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
                                          {`${formatTime(section?.start_time)} - ${formatTime(section?.end_time)
                                             }`}
                                       </Text>
                                    )
                                    : null}
                              </VStack>
                           </Tag>
                           <CardButtons section={section} />
                        </HStack>
                     )
                     : <CardButtons section={section} noSection />}
               </Flex>
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
            {!isMobile ? <Availabilites course_id={section.course_id} /> : null}
            <Req course_id={section.course_id} />
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
                        <For each={section.instructors} >
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

const CardButtons = (
   { section, noSection = false }: { section: Section; noSection?: boolean },
) => {
   const isMobile = useMobile();

   // Parse term and year from section.term (e.g., "Fall 2024")
   const [termName = '', yearStr = ''] = section.term.split(' ');
   const year = Number.parseInt(yearStr);

   // Query for the term
   const { data: termData } = useLiveQuery(
      (q) => q
         .from({ term: termsCollection })
         .select(({ term }) => ({ ...term }))
         .where(({ term }) =>
            and(
               eq(term.term, termName),
               eq(term.year, year)
            )
         )
         .findOne(),
      [termName, year]
   )

   // Query for the section with a join to terms to filter by term/year
   const { data: likedSection } = useLiveQuery(
      (q) => q
         .from({ sec: sectionsCollection })
         .innerJoin({ term: termsCollection }, ({ sec, term }) => eq(sec.termId, term.id))
         .select(({ sec }) => ({ ...sec }))
         .where(({ sec, term }) =>
            and(
               eq(sec.crn, section.crn.toString()),
               eq(term.term, termName),
               eq(term.year, year)
            )
         )
         .findOne(),
      [section.crn, termName, year]
   )

   const toggleFavorite = () => {
      try {
         // Get or create term
         let termId = termData?.id
         if (!termId) {
            termId = crypto.randomUUID()
            termsCollection.insert({
               id: termId,
               term: termName,
               year: year,
               isActive: false,
               createdAt: new Date(),
               updatedAt: new Date()
            })
         }

      // Get or create course
      const existingCourse = coursesCollection.get(section.course_id)
      if (!existingCourse) {
         coursesCollection.insert({
            id: section.course_id,
            course: section.course,
            title: section.title,
            completed: false,
            credits: section.credits || null,
            createdAt: new Date(),
            updatedAt: new Date()
         })
      }

         // Toggle section like
         const existingSection = sectionsCollection.get(section.crn.toString())
         if (existingSection) {
            // Section exists, toggle the liked status
            sectionsCollection.update(section.crn.toString(), (draft) => {
               draft.liked = !draft.liked
               draft.updatedAt = new Date()
            })
            
            toaster.create({
               title: existingSection.liked ? 'Removed from favorites' : 'Added to favorites',
               type: 'success',
               duration: 2000,
            })
         } else {
            // Section doesn't exist, create it with liked = true
            sectionsCollection.insert({
         crn: section.crn.toString(),
               termId,
               courseId: section.course_id,
               status: null,
               liked: true,
               grade: null,
               createdAt: new Date(),
               updatedAt: new Date()
            })
            
            toaster.create({
               title: 'Added to favorites',
               type: 'success',
               duration: 2000,
            })
         }
      } catch (error) {
         console.error('Error toggling favorite:', error)
         toaster.create({
            title: 'Error',
            description: 'Failed to toggle favorite',
            type: 'error',
            duration: 3000,
         })
      }
   }

   return (
      <Stack
         direction={isMobile && noSection ? 'row' : 'column'}
         align='normal'
         justify='space-between'
      >
         {
            /*
         <Menu.Root onSelect={handleMenuSelect} positioning={{ placement: 'bottom' }}>
            <Menu.Trigger asChild>
               <IconButton variant='outline' size='sm'>
                  <Icon as={CiMenuKebab} size='md' />
               </IconButton>
            </Menu.Trigger>
            <Portal>
               <Menu.Positioner>
                  <Menu.Content>
                     <Menu.Item value='share' p={2}>
                        <MdShare />
                        Share
                     </Menu.Item>
                  </Menu.Content>
               </Menu.Positioner>
            </Portal>
         </Menu.Root>
         */
         }
         <IconButton
            variant='surface'
            size='sm'
            onClick={toggleFavorite}
            color={likedSection?.liked ? 'pink.500' : 'gray.500'}
            _hover={{
               color: likedSection?.liked ? 'pink.600' : 'pink.400',
               borderColor: likedSection?.liked ? 'pink.600' : 'pink.400',
            }}
         >
            <Icon as={likedSection?.liked ? RiHeartFill : RiHeartLine} size='lg' />
         </IconButton>
         <Clipboard.Root
            value={globalThis.location.origin + globalThis.location.pathname +
               `/${section.crn}` + globalThis.location.search}
         >
            <Clipboard.Trigger asChild>
               <IconButton variant='surface' size='sm'>
                  <Clipboard.Indicator />
               </IconButton>
            </Clipboard.Trigger>
         </Clipboard.Root>
      </Stack>
   );
};

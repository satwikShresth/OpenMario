import {
   Box,
   Card as CCard,
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
import { ExternalLinkIcon, HeartFilledIcon, HeartIcon } from '@/components/icons';
import { Link, linkOptions, useMatch } from '@tanstack/react-router';
import { getDifficultyColor, getRatingColor, weekItems } from './helpers';
import { formatTime, orpc } from '@/helpers';
import { useInfiniteHits } from 'react-instantsearch';
import { useCallback, useRef } from 'react';
import { useMobile } from '@/hooks';
import Req from './Req.tsx';
import { useQuery } from '@tanstack/react-query';
import Availabilites from './Availabilites.tsx';
import { upsertTerm, upsertCourse, upsertSection, updateSection } from '@/db/mutations';
import { useSectionData } from '@/db/stores/sections';
import { toaster } from '@/components/ui/toaster';

export const Cards = () => {
   const { items, showMore, isLastPage } = useInfiniteHits<Section>();

   // Mirror lastRenderArgs from the Algolia docs — refs always hold latest values
   const showMoreRef = useRef(showMore);
   const isLastPageRef = useRef(isLastPage);
   showMoreRef.current = showMore;
   isLastPageRef.current = isLastPage;

   const observerRef = useRef<IntersectionObserver | null>(null);

   // Callback ref = isFirstRender equivalent: fires once when the element mounts
   const sentinelCallbackRef = useCallback((el: HTMLDivElement | null) => {
      if (el) {
         observerRef.current = new IntersectionObserver(entries => {
            entries.forEach(entry => {
               if (entry.isIntersecting && !isLastPageRef.current) {
                  showMoreRef.current();
               }
            });
         });
         observerRef.current.observe(el);
      } else {
         observerRef.current?.disconnect();
         observerRef.current = null;
      }
   }, []);

   return (
      <Flex direction='column' gap={5} width='full'>
         <For each={items}>
            {(section) => (
               <Card
                  key={`${section.crn}-${section.instruction_method}-${section.instruction_type}`}
                  section={section}
               />
            )}
         </For>
         <Box ref={sentinelCallbackRef} />
      </Flex>
   );
};

export const Card = ({ section }: { section: Section }) => {
   const isMobile = useMobile();
   const match = useMatch({ strict: false });
   const { termName: sectionTermName, year: sectionYear } = parseDrexelTerm(section.term);
   const termLabel = sectionTermName && sectionYear ? `${sectionTermName} ${sectionYear}` : section.term;
   const { data: courseRaw } = useQuery(
      orpc.course.course.queryOptions({ input: { params: { course_id: section.course_id } } })
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
                        <Link
                           to={`${(match.fullPath) as '/courses/explore'}/$course_id`}
                           params={{ course_id: section?.course_id ?? '' }}
                           reloadDocument={false}
                           resetScroll={false}
                           replace={true}
                        >
                           <Text
                              _hover={{ textDecoration: 'underline' }}
                              fontSize={{ base: 'lg', md: 'xl' }}
                              fontWeight='semibold'
                              lineHeight='1.2'
                           >
                              {section.course}: {section.title}
                           </Text>
                        </Link>
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
                        <HStack align='center'>
                           <Tag
                              size='xl'
                              width={isMobile ? 'full' : 'fit-content'}
                              minWidth='fit-content'
                              display='flex'
                              justifyContent='center'
                              alignItems='center'
                              px={4}
                              py={3}
                              maxW='64'
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
                     Term: {termLabel}
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
                                             <ExternalLinkIcon size={14} />
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

/** Drexel term codes: YYYYTT where TT ∈ {15=Fall, 25=Winter, 35=Spring, 45=Summer} */
const TERM_CODE_MAP: Record<string, string> = {
   '15': 'Fall',
   '25': 'Winter',
   '35': 'Spring',
   '45': 'Summer',
};

/** Parse a raw Drexel term id string (e.g. "202515") into { termName, year }. */
function parseDrexelTerm(raw: string): { termName: string; year: number | null } {
   if (raw.length < 3) return { termName: '', year: null };
   const code = raw.slice(-2);          // "15"
   const yearStr = raw.slice(0, -2);    // "2025"
   const year = Number.parseInt(yearStr, 10);
   const termName = TERM_CODE_MAP[code] ?? '';
   return { termName, year: Number.isFinite(year) && termName ? year : null };
}

const CardButtons = (
   { section, noSection = false }: { section: Section; noSection?: boolean },
) => {
   const isMobile = useMobile();

   const { termName, year: validYear } = parseDrexelTerm(section.term);


   const sectionData = useSectionData(section.crn.toString());
   const liked = sectionData?.liked ?? false;

   const toggleFavorite = async () => {
      if (!validYear) {
         console.error('[CardButtons] Could not parse term year from section.term:', JSON.stringify(section.term));
         toaster.create({ title: 'Error', description: 'Could not parse term year', type: 'error', duration: 3000 });
         return;
      }
      try {
         const credits = section.credits != null ? Math.round(Number(section.credits)) : null;
         const crn = section.crn.toString();
         const termId = await upsertTerm(termName, validYear);
         await upsertCourse({ id: section.course_id, course: section.course, title: section.title, credits });
         const existing = sectionData;
         if (existing) {
            const nowLiked = !existing.liked;
            await updateSection(crn, { liked: nowLiked });
            toaster.create({
               title: nowLiked ? 'Added to favorites' : 'Removed from favorites',
               type: 'success', duration: 2000,
            });
         } else {
            await upsertSection({ crn, term_id: termId, course_id: section.course_id, liked: true });
            toaster.create({ title: 'Added to favorites', type: 'success', duration: 2000 });
         }
      } catch (error) {
         console.error('Error toggling favorite:', error);
         toaster.create({
            title: 'Error',
            description: 'Failed to toggle favorite',
            type: 'error',
            duration: 3000,
         });
      }
   };

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
            color={liked ? 'pink.500' : 'gray.500'}
            _hover={{
               color: liked ? 'pink.600' : 'pink.400',
               borderColor: liked ? 'pink.600' : 'pink.400',
            }}
         >
            <Icon as={liked ? HeartFilledIcon : HeartIcon} size='lg' />
         </IconButton>

      </Stack>
   );
};

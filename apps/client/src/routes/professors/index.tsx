import {
   Badge,
   Box,
   Card,
   Container,
   Flex,
   HStack,
   Input,
   Select,
   Separator,
   Skeleton,
   Spinner,
   Stack,
   Text,
   VStack,
   createListCollection,
} from '@chakra-ui/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { orpc } from '@/helpers/rpc.ts';
import { z } from 'zod';
import { useCallback, useEffect, useRef } from 'react';
import { FiSearch, FiStar } from 'react-icons/fi';

const professorsSearchSchema = z.object({
   search: z.string().optional().catch(undefined),
   department: z.string().optional().catch(undefined),
   sort_by: z
      .enum(['avg_rating', 'avg_difficulty', 'num_ratings', 'total_sections_taught', 'instructor_name'])
      .optional()
      .catch('num_ratings'),
   order: z.enum(['asc', 'desc']).optional().catch('desc'),
});

type ProfessorsSearchSchema = z.infer<typeof professorsSearchSchema>;

const ratingMeta = (rating: number | null) => {
   if (rating === null) return { color: 'gray.400', label: '—' };
   if (rating >= 4) return { color: 'green.500', label: `${rating}` };
   if (rating >= 3) return { color: 'yellow.500', label: `${rating}` };
   return { color: 'red.500', label: `${rating}` };
};

const sortOptions = createListCollection({
   items: [
      { label: 'Most Rated', value: 'num_ratings' },
      { label: 'Avg Rating', value: 'avg_rating' },
      { label: 'Difficulty', value: 'avg_difficulty' },
      { label: 'Sections Taught', value: 'total_sections_taught' },
      { label: 'Name', value: 'instructor_name' },
   ],
});

const orderOptions = createListCollection({
   items: [
      { label: 'Descending', value: 'desc' },
      { label: 'Ascending', value: 'asc' },
   ],
});

export const Route = createFileRoute('/professors/')({
   validateSearch: professorsSearchSchema,
   component: ProfessorsPage,
});

const PAGE_SIZE = 20;

function ProfessorsPage() {
   const query = Route.useSearch();
   const navigate = useNavigate({ from: Route.fullPath });

   const searchInputRef = useRef<HTMLInputElement>(null);
   const deptInputRef = useRef<HTMLInputElement>(null);
   const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
   const deptDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
   const sentinelRef = useRef<HTMLDivElement>(null);

   const sortBy = query.sort_by ?? 'num_ratings';
   const order = query.order ?? 'desc';

   const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
      useInfiniteQuery(
         orpc.professor.list.infiniteOptions({
            input: (pageParam: number) => ({
               search: query.search,
               department: query.department,
               sort_by: sortBy,
               order,
               pageIndex: pageParam,
               pageSize: PAGE_SIZE,
            }),
            initialPageParam: 1,
            getNextPageParam: lastPage => {
               const totalPages = Math.ceil(lastPage.count / lastPage.pageSize);
               return lastPage.pageIndex < totalPages ? lastPage.pageIndex + 1 : undefined;
            },
            staleTime: 30_000,
         })
      );

   const professors = data?.pages.flatMap(p => p.data) ?? [];
   const totalCount = data?.pages[0]?.count ?? 0;

   const updateSearch = useCallback(
      (updates: Partial<ProfessorsSearchSchema>) =>
         navigate({ search: (prev: ProfessorsSearchSchema) => ({ ...prev, ...updates }) }),
      [navigate]
   );

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => updateSearch({ search: val || undefined }), 300);
   };

   const handleDeptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      clearTimeout(deptDebounceRef.current);
      deptDebounceRef.current = setTimeout(() => updateSearch({ department: val || undefined }), 300);
   };

   useEffect(() => {
      if (searchInputRef.current && query.search)
         searchInputRef.current.value = query.search;
      if (deptInputRef.current && query.department)
         deptInputRef.current.value = query.department;
   }, []);

   useEffect(() => {
      const el = sentinelRef.current;
      if (!el) return;
      const observer = new IntersectionObserver(
         entries => {
            if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage)
               fetchNextPage();
         },
         { threshold: 0.1 }
      );
      observer.observe(el);
      return () => observer.disconnect();
   }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

   return (
      <Container maxW='4xl'>
         <VStack align='stretch' gap={6} mt={10}>
            <Flex justify='space-between' align='center' wrap='wrap' gap={3}>
               <Text fontSize='3xl' fontWeight='bolder'>Professors</Text>
               <Text color='fg.muted' fontSize='sm'>{totalCount} instructors</Text>
            </Flex>

            <Separator />

            <Flex gap={3} wrap='wrap' align='center'>
               <Box flex='1' minW='180px' position='relative'>
                  <Input
                     ref={searchInputRef}
                     placeholder='Search by name...'
                     defaultValue={query.search ?? ''}
                     onChange={handleSearchChange}
                     pl={9}
                  />
                  <Box position='absolute' left={3} top='50%' transform='translateY(-50%)' color='fg.muted'>
                     <FiSearch />
                  </Box>
               </Box>

               <Box minW='160px'>
                  <Input
                     ref={deptInputRef}
                     placeholder='Filter by department...'
                     defaultValue={query.department ?? ''}
                     onChange={handleDeptChange}
                  />
               </Box>

               <Select.Root
                  collection={sortOptions}
                  width='180px'
                  value={[sortBy]}
                  onValueChange={({ value }) =>
                     updateSearch({ sort_by: value[0] as ProfessorsSearchSchema['sort_by'] })
                  }
               >
                  <Select.HiddenSelect />
                  <Select.Control>
                     <Select.Trigger><Select.ValueText placeholder='Sort by' /></Select.Trigger>
                  </Select.Control>
                  <Select.Positioner>
                     <Select.Content>
                        {sortOptions.items.map(item => (
                           <Select.Item key={item.value} item={item}>{item.label}</Select.Item>
                        ))}
                     </Select.Content>
                  </Select.Positioner>
               </Select.Root>

               <Select.Root
                  collection={orderOptions}
                  width='150px'
                  value={[order]}
                  onValueChange={({ value }) =>
                     updateSearch({ order: value[0] as 'asc' | 'desc' })
                  }
               >
                  <Select.HiddenSelect />
                  <Select.Control>
                     <Select.Trigger><Select.ValueText placeholder='Order' /></Select.Trigger>
                  </Select.Control>
                  <Select.Positioner>
                     <Select.Content>
                        {orderOptions.items.map(item => (
                           <Select.Item key={item.value} item={item}>{item.label}</Select.Item>
                        ))}
                     </Select.Content>
                  </Select.Positioner>
               </Select.Root>
            </Flex>

            {isLoading ? (
               <VStack gap={3}>
                  {Array.from({ length: 5 }).map((_, i) => (
                     <Skeleton key={i} height='100px' borderRadius='lg' width='100%' />
                  ))}
               </VStack>
            ) : professors.length === 0 ? (
               <Box textAlign='center' py={16}>
                  <Text fontSize='lg' color='fg.muted'>No professors found</Text>
               </Box>
            ) : (
               <VStack gap={3} align='stretch'>
                  {professors.map(prof => {
                     const rating = ratingMeta(prof.avg_rating);
                     return (
                        <Card.Root
                           key={prof.instructor_id}
                           variant='outline'
                           borderRadius='xl'
                           _hover={{ shadow: 'md', borderColor: 'colorPalette.400' }}
                           cursor='pointer'
                           transition='all 0.15s'
                           onClick={() =>
                              navigate({
                                 to: '/professors/$professor_id',
                                 params: { professor_id: String(prof.instructor_id) },
                              })
                           }
                        >
                           <Card.Body py={5} px={6}>
                              <Stack
                                 direction={{ base: 'column', md: 'row' }}
                                 align={{ base: 'stretch', md: 'center' }}
                                 gap={5}
                              >
                                 <Flex direction='column' align='center' justify='center' minW='64px' gap={0.5}>
                                    <HStack gap={1} align='baseline'>
                                       <Text fontSize='2xl' fontWeight='bold' color={rating.color} lineHeight='1'>
                                          {rating.label}
                                       </Text>
                                       {prof.avg_rating != null && <FiStar size={12} color={rating.color} />}
                                    </HStack>
                                    <Text fontSize='xs' color='fg.muted' letterSpacing='wide'>RATING</Text>
                                 </Flex>

                                 <Separator orientation='vertical' height='56px' display={{ base: 'none', md: 'block' }} />

                                 <Box flex={1} minW={0}>
                                    <Text fontSize='lg' fontWeight='semibold' lineClamp={1}>
                                       {prof.instructor_name}
                                    </Text>
                                    <Text fontSize='sm' color='fg.muted' mb={1}>
                                       {prof.department ?? 'Unknown Department'}
                                    </Text>
                                    {prof.subjects_taught && prof.subjects_taught.length > 0 && (
                                       <HStack gap={1} wrap='wrap'>
                                          {prof.subjects_taught.slice(0, 5).map(s => (
                                             <Badge key={s} size='sm' variant='surface' colorPalette='blue'>{s}</Badge>
                                          ))}
                                          {prof.subjects_taught.length > 5 && (
                                             <Badge size='sm' variant='surface' colorPalette='gray'>
                                                +{prof.subjects_taught.length - 5}
                                             </Badge>
                                          )}
                                       </HStack>
                                    )}
                                 </Box>

                                 <Separator orientation='vertical' height='56px' display={{ base: 'none', md: 'block' }} />

                                 <Flex gap={5} wrap='wrap' justify={{ base: 'flex-start', md: 'flex-end' }}>
                                    {[
                                       { label: 'Difficulty', value: prof.avg_difficulty != null ? prof.avg_difficulty : '—' },
                                       { label: 'Ratings', value: prof.num_ratings ?? 0 },
                                       { label: 'Sections', value: prof.total_sections_taught },
                                       { label: 'Courses', value: prof.total_courses_taught },
                                    ].map(({ label, value }) => (
                                       <Box key={label} textAlign='center' minW='56px'>
                                          <Text fontSize='sm' fontWeight='semibold'>{value}</Text>
                                          <Text fontSize='xs' color='fg.muted'>{label}</Text>
                                       </Box>
                                    ))}
                                 </Flex>
                              </Stack>
                           </Card.Body>
                        </Card.Root>
                     );
                  })}
               </VStack>
            )}

            <Box ref={sentinelRef} py={4} display='flex' justifyContent='center'>
               {isFetchingNextPage && <Spinner size='sm' color='fg.muted' />}
               {!hasNextPage && professors.length > 0 && (
                  <Text fontSize='sm' color='fg.subtle'>All {totalCount} professors loaded</Text>
               )}
            </Box>
         </VStack>
      </Container>
   );
}

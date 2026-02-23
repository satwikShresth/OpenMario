import {
   Box,
   Button,
   Clipboard,
   Container,
   Flex,
   HStack,
   Icon,
   IconButton,
   Separator,
   Spinner,
   Text,
   useDisclosure,
   VStack,
} from '@chakra-ui/react';
import { HiFilter } from 'react-icons/hi';
import { Salary } from '@/components/Salary';
import { useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { salarySearchSchema } from './-validator.ts';
import { useMobile } from '@/hooks';
import { orpc } from '@/helpers/rpc.ts';
import z from 'zod';
import { useEffect, useRef } from 'react';

const PAGE_SIZE = 20;

export const Route = createFileRoute('/salary')({
   validateSearch: z.optional(salarySearchSchema),
   component: () => {
      const query = Route.useSearch();
      const isMobile = useMobile();
      const { open: isFilterOpen, onOpen: openFilter, onClose: closeFilter } = useDisclosure();
      const sentinelRef = useRef<HTMLDivElement>(null);

      const { data, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery(
         orpc.submission.list.infiniteOptions({
            input: (pageParam: number) => ({
               ...query!,
               pageIndex: pageParam,
               pageSize: PAGE_SIZE,
            }),
            initialPageParam: 1,
            getNextPageParam: lastPage => {
               const totalPages = Math.ceil(lastPage.count / lastPage.pageSize);
               return lastPage.pageIndex < totalPages ? lastPage.pageIndex + 1 : undefined;
            },
            staleTime: 3000,
            refetchOnWindowFocus: true,
         })
      );

      const rows = data?.pages.flatMap(p => p.data) ?? [];
      const totalCount = data?.pages[0]?.count ?? 0;

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
         <Container>
            <VStack align='center'>
               <Salary.Root>
                  <Box>
                     <Flex justify='space-between' mb={2} mt={10}>
                        {isMobile
                           ? (
                              <Button onClick={openFilter} variant='solid'>
                                 <Icon as={HiFilter} />
                                 <Text>Filters</Text>
                              </Button>
                           )
                           : <Text fontSize='3xl' fontWeight='bolder'>Self Reported Salaries</Text>}

                        <HStack>
                           <Salary.ReportSalaryMenu />

                           {isMobile
                              ? null
                              : (
                                 <Clipboard.Root value={globalThis.location.href} timeout={1000}>
                                    <Clipboard.Trigger asChild>
                                       <IconButton variant='solid'>
                                          <Clipboard.Indicator />
                                       </IconButton>
                                    </Clipboard.Trigger>
                                 </Clipboard.Root>
                              )}
                        </HStack>
                     </Flex>

                     {isMobile ? null : <Separator mb={5} />}
                     <Salary.DataTable.Filters
                        open={isFilterOpen}
                        onClose={closeFilter}
                     />
                     <Box m={2} />
                     <Salary.DataTable.Body
                        data={rows}
                        count={rows.length}
                     />
                     <Flex ref={sentinelRef} justify='center' py={4}>
                        {isFetchingNextPage && <Spinner size='sm' color='fg.muted' />}
                        {!hasNextPage && rows.length > 0 && (
                           <Text fontSize='sm' color='fg.subtle'>
                              All {totalCount} entries loaded
                           </Text>
                        )}
                     </Flex>
                     <Salary.DataTable.Footer />
                     <Outlet />
                  </Box>
               </Salary.Root>
            </VStack>
         </Container>
      );
   },
});

export type SalaryRoute = typeof Route;

import {
   Box,
   Button,
   Clipboard,
   Flex,
   HStack,
   Icon,
   IconButton,
   Separator,
   Spinner,
   Text,
   useDisclosure,
} from '@chakra-ui/react';
import { FilterIcon } from '@/components/icons';
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
   beforeLoad: () => ({ getLabel: () => 'Salary' }),
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

      const compensations = rows.map(r => r.compensation).filter((c): c is number => c != null);
      const avgComp = compensations.length > 0
         ? compensations.reduce((a, b) => a + b, 0) / compensations.length
         : null;
      const medianComp = compensations.length > 0
         ? (() => {
              const sorted = [...compensations].sort((a, b) => a - b);
              const mid = Math.floor(sorted.length / 2);
              return sorted.length % 2 !== 0 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
           })()
         : null;

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
         <Salary.Root>
            <Flex justify='space-between' align='center' mb={4} pt={4}>
               {isMobile
                  ? (
                     <Button onClick={openFilter} variant='solid' size='sm'>
                        <Icon as={FilterIcon} />
                        <Text>Filters</Text>
                     </Button>
                  )
                  : <Text fontSize='2xl' fontWeight='bold'>Self Reported Salaries</Text>}

               <HStack>
                  <Salary.ReportSalaryMenu />
                  {!isMobile && (
                     <Clipboard.Root value={globalThis.location.href} timeout={1000}>
                        <Clipboard.Trigger asChild>
                           <IconButton variant='solid' size='sm'>
                              <Clipboard.Indicator />
                           </IconButton>
                        </Clipboard.Trigger>
                     </Clipboard.Root>
                  )}
               </HStack>
            </Flex>

            {!isMobile && <Separator mb={4} />}

            <Salary.DataTable.Filters open={isFilterOpen} onClose={closeFilter} />

            <Box overflowX='auto'>
               <Salary.DataTable.Body data={rows} count={rows.length} />
            </Box>

            <Flex ref={sentinelRef} justify='center' py={4}>
               {isFetchingNextPage && <Spinner size='sm' color='fg.muted' />}
               {!hasNextPage && rows.length > 0 && (
                  <Text fontSize='sm' color='fg.subtle'>
                     All {totalCount} entries loaded
                  </Text>
               )}
            </Flex>

            <Salary.DataTable.Footer avg={avgComp} median={medianComp} />
            <Outlet />
         </Salary.Root>
      );
   },
});

export type SalaryRoute = typeof Route;

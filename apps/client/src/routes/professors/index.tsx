import { Separator } from '@chakra-ui/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useLayoutEffect } from 'react';
import { z } from 'zod';
import { orpc } from '@/helpers/rpc.ts';
import { Professor, professorListStore, type ProfessorListItem } from '@/components/Professor';

const professorsSearchSchema = z.object({
   search: z.string().optional().catch(undefined),
   department: z.string().optional().catch(undefined),
   sort_by: z
      .enum(['avg_rating', 'avg_difficulty', 'num_ratings', 'total_sections_taught', 'instructor_name'])
      .optional()
      .catch('num_ratings'),
   order: z.enum(['asc', 'desc']).optional().catch('desc'),
});

export const Route = createFileRoute('/professors/')({
   validateSearch: professorsSearchSchema,
   component: ProfessorsPage,
});

const PAGE_SIZE = 20;

function ProfessorsPage() {
   const { search, department, sort_by, order } = Route.useSearch();
   const sortBy = sort_by ?? 'num_ratings';
   const sortOrder = order ?? 'desc';

   const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
      useInfiniteQuery(
         orpc.professor.list.infiniteOptions({
            input: (pageParam: number) => ({
               search,
               department,
               sort_by: sortBy,
               order: sortOrder,
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

   useLayoutEffect(() => {
      professorListStore.setState(() => ({
         professors: (data?.pages.flatMap(p => (p as any).data) ?? []) as ProfessorListItem[],
         totalCount: (data?.pages[0] as any)?.count ?? 0,
         isLoading,
         isFetchingNextPage,
         hasNextPage: !!hasNextPage,
         fetchNextPage,
      }));
   }, [data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

   return (
      <Professor.Root>
         <Professor.PageHeader />
         <Separator />
         <Professor.Toolbar />
         <Professor.List />
         <Professor.InfiniteScrollSentinel />
      </Professor.Root>
   );
}

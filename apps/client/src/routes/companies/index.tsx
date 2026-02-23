import { Separator } from '@chakra-ui/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useLayoutEffect } from 'react';
import { z } from 'zod';
import { orpc } from '@/helpers/rpc.ts';
import { Company, companyListStore, type CompanyListItem } from '@/components/Company';

const companiesSearchSchema = z.object({
   search: z.string().optional().catch(undefined),
   sort_by: z
      .enum(['omega_score', 'total_reviews', 'avg_rating_overall', 'company_name'])
      .optional()
      .catch('total_reviews'),
   order: z.enum(['asc', 'desc']).optional().catch('desc'),
});

export const Route = createFileRoute('/companies/')({
   validateSearch: companiesSearchSchema,
   component: CompaniesPage,
});

const PAGE_SIZE = 20;

function CompaniesPage() {
   const { search, sort_by, order } = Route.useSearch();
   const sortBy = sort_by ?? 'total_reviews';
   const sortOrder = order ?? 'desc';

   const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
      useInfiniteQuery(
         orpc.companies.listCompanies.infiniteOptions({
            input: (pageParam: number) => ({
               search,
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
      companyListStore.setState(() => ({
         companies: (data?.pages.flatMap(p => p.data) ?? []) as CompanyListItem[],
         totalCount: data?.pages[0]?.count ?? 0,
         isLoading,
         isFetchingNextPage,
         hasNextPage: !!hasNextPage,
         fetchNextPage,
      }));
   }, [data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

   return (
      <Company.Root>
         <Company.PageHeader />
         <Separator />
         <Company.Toolbar />
         <Company.List />
         <Company.InfiniteScrollSentinel />
      </Company.Root>
   );
}

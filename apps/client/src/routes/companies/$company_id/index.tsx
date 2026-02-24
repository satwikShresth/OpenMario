import { Separator } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useLayoutEffect } from 'react';
import { orpc } from '@/helpers/rpc.ts';
import { Company, companyDetailStore } from '@/components/Company';

export const Route = createFileRoute('/companies/$company_id/')({
   component: CompanyOverviewPage,
});

function CompanyOverviewPage() {
   const { company_id } = Route.useParams();

   const { data, isLoading } = useQuery(
      orpc.companies.getCompany.queryOptions({ input: { params: { company_id } }, staleTime: 30_000 })
   );

   useLayoutEffect(() => {
      companyDetailStore.setState(() => ({
         company_id,
         company: data?.company ?? null,
         positions: data?.positions ?? [],
         isLoading,
      }));
   }, [company_id, data, isLoading]);

   return (
      <Company.Root maxW={{ base: 'full', md: '5xl', xl: '6xl', '2xl': '7xl' }} gap={{ base: 6, md: 8, xl: 10, '2xl': 12 }}>
         <Company.Header />
         <Separator />
         <Company.StatsGrid />
         <Company.Charts />
         <Separator />
         <Company.Positions />
         <Separator />
         <Company.ReviewHighlights />
      </Company.Root>
   );
}

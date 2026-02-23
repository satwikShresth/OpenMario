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
      <Company.Root maxW='5xl' py={10} gap={8}>
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

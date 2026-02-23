import { createFileRoute, Outlet } from '@tanstack/react-router';
import { orpc } from '@/helpers/rpc';

export const Route = createFileRoute('/companies/$company_id')({
   beforeLoad: ({ context: { queryClient }, params: { company_id } }) => ({
      getLabel: () =>
         queryClient
            .ensureQueryData(orpc.companies.getCompany.queryOptions({ input: { company_id }, staleTime: 30_000 }))
            .then(data => data?.company?.company_name ?? company_id),
   }),
   component: () => <Outlet />,
});

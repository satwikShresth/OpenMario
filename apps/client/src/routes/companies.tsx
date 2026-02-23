import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/companies')({
   beforeLoad: () => ({
      getLabel: () => 'Companies',
   }),
   component: () => <Outlet />,
});

import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/professors')({
   beforeLoad: () => ({
      getLabel: () => 'Professors',
   }),
   component: () => <Outlet />,
});

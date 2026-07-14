import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/courses/plan/schedule')({
   beforeLoad: () => ({ getLabel: () => 'Quarter Schedule' }),
   component: () => <Outlet />,
})

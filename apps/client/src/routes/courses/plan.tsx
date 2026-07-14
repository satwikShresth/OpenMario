import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/courses/plan')({
  beforeLoad: () => ({ getLabel: () => 'Plan' }),
  component: () => <Outlet />,
})

import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_search/courses/plan')({
  beforeLoad: () => ({ getLabel: () => 'Plan Term' }),
  component: () => <Outlet />,
})

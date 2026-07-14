import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/salary/_dialog/_form/_form')({
  component: () => <Outlet />,
})

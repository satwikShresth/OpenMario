import { FilterProvider } from '#/stores'
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/home')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <FilterProvider>
      <Outlet />
    </ FilterProvider>
  )
}

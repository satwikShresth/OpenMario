import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Index } from 'react-instantsearch'

export const Route = createFileRoute('/_search/courses')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Index indexName='sections'>
      <Outlet />
    </Index>
  )
}

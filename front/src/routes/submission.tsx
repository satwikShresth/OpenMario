import { JobSubmissionProvider } from '#/stores'
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/submission')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <JobSubmissionProvider>
      <Outlet />
    </JobSubmissionProvider>
  )
}


import { createFileRoute, redirect } from '@tanstack/react-router'

/** Legacy URL → nested under Plan */
export const Route = createFileRoute('/courses/profile')({
   beforeLoad: () => {
      throw redirect({
         to: '/courses/plan/profile',
         replace: true,
      })
   },
})

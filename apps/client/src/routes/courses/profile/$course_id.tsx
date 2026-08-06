import { createFileRoute, redirect } from '@tanstack/react-router'

/** Legacy URL → nested under Plan */
export const Route = createFileRoute('/courses/profile/$course_id')({
   beforeLoad: ({ params }) => {
      throw redirect({
         to: '/courses/plan/profile/$course_id',
         params: { course_id: params.course_id },
         replace: true,
      })
   },
})

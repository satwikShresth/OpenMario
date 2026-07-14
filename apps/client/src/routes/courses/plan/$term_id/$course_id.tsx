import { createFileRoute, redirect } from '@tanstack/react-router'

/** Legacy URL → nested under Quarter Schedule */
export const Route = createFileRoute('/courses/plan/$term_id/$course_id')({
   beforeLoad: ({ params }) => {
      throw redirect({
         to: '/courses/plan/schedule/$term_id/$course_id',
         params: {
            term_id: params.term_id,
            course_id: params.course_id,
         },
         replace: true,
      })
   },
})

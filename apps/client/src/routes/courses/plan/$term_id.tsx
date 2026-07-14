import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

/** Legacy URL → nested under Quarter Schedule */
export const Route = createFileRoute('/courses/plan/$term_id')({
   validateSearch: z.object({
      search: z.string().optional(),
   }),
   beforeLoad: ({ params, search }) => {
      throw redirect({
         to: '/courses/plan/schedule/$term_id',
         params: { term_id: params.term_id },
         search,
         replace: true,
      })
   },
})

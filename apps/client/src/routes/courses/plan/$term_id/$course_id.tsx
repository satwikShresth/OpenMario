import { createFileRoute } from '@tanstack/react-router'
import { CourseDialogPage } from '../../-courses.dialog'
import { orpc } from '@/helpers'

export const Route = createFileRoute('/courses/plan/$term_id/$course_id')({
  beforeLoad: ({ context: { queryClient }, params: { course_id } }) => ({
    getLabel: () =>
      queryClient
        .ensureQueryData(orpc.course.course.queryOptions({ input: { params: { course_id } }, staleTime: 30_000 }))
        .then(data => data?.data ? `${data.data.subject_id} ${data.data.course_number}` : 'Course'),
  }),
  component: CourseDialogPage,
})

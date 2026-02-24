import { createFileRoute } from '@tanstack/react-router'
import { CourseDialogPage } from '../../-courses.dialog'

export const Route = createFileRoute('/courses/plan/$term_id/$course_id')({
  component: CourseDialogPage,
})

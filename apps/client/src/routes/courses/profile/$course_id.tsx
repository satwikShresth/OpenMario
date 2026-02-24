import { createFileRoute } from '@tanstack/react-router'
import { CourseDialogPage } from '../-courses.dialog'

export const Route = createFileRoute('/courses/profile/$course_id')({
  component: CourseDialogPage,
})

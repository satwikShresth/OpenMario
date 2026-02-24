import { createFileRoute } from '@tanstack/react-router'
import { CourseDialogPage } from './-courses.dialog'

export const Route = createFileRoute('/_search/courses/profile/$course_id')({
  component: CourseDialogPage,
})


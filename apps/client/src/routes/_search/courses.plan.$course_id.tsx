import { createFileRoute } from '@tanstack/react-router'
import { CourseDialogPage } from './-course.dialog'

export const Route = createFileRoute('/_search/courses/plan/$course_id')({
  component: CourseDialogPage,
})

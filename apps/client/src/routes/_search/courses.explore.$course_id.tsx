import { createFileRoute } from '@tanstack/react-router'
import { CourseDialogPage } from './-course.dialog'

export const Route = createFileRoute('/_search/courses/explore/$course_id')({
  component: CourseDialogPage,
})


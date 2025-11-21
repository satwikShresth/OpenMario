import { createFileRoute } from '@tanstack/react-router';
import { CourseDialogPage } from './-course_id.dialogPage';

export const Route = createFileRoute('/_search/plan/$course_id')({
  component: CourseDialogPage,
})


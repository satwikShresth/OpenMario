import type { ReactNode } from 'react'
import { Index } from 'react-instantsearch';
import { PlanCalendar } from './Calendar'
import { PlanCourses } from './Courses'

type CoursesProps = { index: string; children?: ReactNode };
export const Plan = {
  Root: ({ index, children }: CoursesProps) => (
    <Index indexName={index}>
      {children}
    </Index>
  ),
  Calendar: PlanCalendar,
  Courses: PlanCourses,
}

export * from './Calendar'
export * from './Courses'
export * from './ConflictsIndicator'


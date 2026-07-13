import type { MeiliSearch } from 'meilisearch'
import { eq, sql } from 'drizzle-orm'
import { course, subject, college, course_prerequisites, course_corequisites } from '@openmario/db'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '../db'
import { waitForTask } from '../lib/tasks'
import type { CourseDocument } from '@/types'

const BATCH_SIZE = 500
const prereqCourse = alias(course, 'prereq_course')
const coreqCourse = alias(course, 'coreq_course')

export default async function seedCourses(
   meilisearch: MeiliSearch,
   indexName: string
): Promise<void> {
   console.log(`[courses] Loading course catalog…`)

   const rows = await db
      .select({
         id: course.id,
         subject_id: course.subject_id,
         course_number: course.course_number,
         title: course.title,
         description: course.description,
         credits: course.credits,
         credit_range: course.credit_range,
         repeat_status: course.repeat_status,
         restrictions: course.restrictions,
         writing_intensive: course.writing_intensive,
         subject_name: subject.name,
         college_id: college.id,
         college_name: college.name,
      })
      .from(course)
      .innerJoin(subject, eq(subject.id, course.subject_id))
      .innerJoin(college, eq(college.id, subject.college_id))

   const prereqRows = await db
      .select({
         course_id: course_prerequisites.course_id,
         code: sql<string>`${prereqCourse.subject_id} || ' ' || ${prereqCourse.course_number}`.as(
            'code'
         ),
      })
      .from(course_prerequisites)
      .innerJoin(
         prereqCourse,
         eq(prereqCourse.id, course_prerequisites.prerequisite_course_id)
      )

   const coreqRows = await db
      .select({
         course_id: course_corequisites.course_id,
         code: sql<string>`${coreqCourse.subject_id} || ' ' || ${coreqCourse.course_number}`.as(
            'code'
         ),
      })
      .from(course_corequisites)
      .innerJoin(
         coreqCourse,
         eq(coreqCourse.id, course_corequisites.corequisite_course_id)
      )

   const prereqsByCourse = new Map<string, string[]>()
   for (const row of prereqRows) {
      const list = prereqsByCourse.get(row.course_id) ?? []
      list.push(row.code)
      prereqsByCourse.set(row.course_id, list)
   }
   const coreqsByCourse = new Map<string, string[]>()
   for (const row of coreqRows) {
      const list = coreqsByCourse.get(row.course_id) ?? []
      list.push(row.code)
      coreqsByCourse.set(row.course_id, list)
   }

   const documents: CourseDocument[] = rows.map(row => {
      const courseCode = `${row.subject_id} ${row.course_number}`
      const prerequisites = prereqsByCourse.get(row.id) ?? []
      const corequisites = coreqsByCourse.get(row.id) ?? []
      return {
         id: row.id,
         subject_id: row.subject_id,
         course_number: row.course_number,
         title: row.title,
         description: row.description,
         credits: row.credits != null ? Number(row.credits) : null,
         credit_range: row.credit_range,
         course: courseCode,
         repeat_status: row.repeat_status,
         restrictions: row.restrictions,
         writing_intensive: row.writing_intensive,
         subject_name: row.subject_name,
         college_id: row.college_id,
         college_name: row.college_name,
         prerequisites,
         corequisites,
         searchableText: [
            courseCode,
            row.title,
            row.description,
            row.subject_name,
            ...prerequisites,
            ...corequisites,
         ]
            .filter(Boolean)
            .join(' '),
      }
   })

   console.log(`[courses] Indexing ${documents.length} courses…`)
   const index = meilisearch.index<CourseDocument>(indexName)

   // Full replace for catalog index
   const deleteTask = await index.deleteAllDocuments()
   await waitForTask(meilisearch, deleteTask.taskUid)

   for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch = documents.slice(i, i + BATCH_SIZE)
      const task = await index.addDocuments(batch)
      await waitForTask(meilisearch, task.taskUid)
      console.log(
         `[courses] Batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(documents.length / BATCH_SIZE)}`
      )
   }

   console.log(`[courses] Done (${documents.length} documents).`)
}

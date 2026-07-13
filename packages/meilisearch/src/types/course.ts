export type CourseDocument = {
   id: string
   subject_id: string
   course_number: string
   title: string
   description: string | null
   credits: number | null
   credit_range: string | null
   course: string
   repeat_status: string | null
   restrictions: string | null
   writing_intensive: boolean
   subject_name: string
   college_id: string
   college_name: string
   searchableText: string
   prerequisites: string[]
   corequisites: string[]
}

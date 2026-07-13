import { HStack, IconButton, Stack, Text } from '@chakra-ui/react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { LuX } from 'react-icons/lu'
import { orpc } from '@/helpers'
import { upsertTerm } from '@/db/mutations'
import { toDrexelTermId } from '@/components/Search/Courses/helpers'
import { toaster } from '@/components/ui/toaster'
import {
   removeCourseFromQuarter,
   type PlannedCourse,
   type TermName,
} from '@/lib/plan-of-study'
import { courseDragId, type CourseDragData } from './PlanCourseDnd'

type CourseChipProps = {
   course: PlannedCourse
   term: TermName
   academicYear: number
   yearIndex: number
}

export function CourseChip({ course, term, academicYear, yearIndex }: CourseChipProps) {
   const navigate = useNavigate()
   const queryClient = useQueryClient()
   const [checking, setChecking] = useState(false)
   const suppressClick = useRef(false)

   const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: courseDragId(yearIndex, term, course.id),
      data: {
         type: 'course',
         yearIndex,
         term,
         course,
      } satisfies CourseDragData,
   })

   const handleOpen = async () => {
      if (suppressClick.current) {
         suppressClick.current = false
         return
      }
      setChecking(true)
      try {
         const data = await queryClient.fetchQuery(
            orpc.course.availabilities.queryOptions({
               input: { params: { course_id: course.id } },
            }),
         )
         const drexelId = toDrexelTermId(term, academicYear)
         const hasSections = data.some(row => String(row.term) === drexelId)
         if (!hasSections) {
            toaster.create({
               title: 'No sections for this term',
               description: `${course.code} has no sections listed for ${term} ${academicYear}.`,
               type: 'info',
            })
            return
         }

         const termId = await upsertTerm(term, academicYear)
         await navigate({
            to: '/courses/plan/$term_id',
            params: { term_id: termId },
            search: { search: course.code },
         })
      } catch {
         toaster.create({
            title: 'Could not check sections',
            type: 'error',
         })
      } finally {
         setChecking(false)
      }
   }

   return (
      <HStack
         ref={setNodeRef}
         gap='1'
         minW='0'
         px='2'
         py='1.5'
         borderRadius='md'
         bg='bg.muted'
         cursor={checking ? 'wait' : isDragging ? 'grabbing' : 'grab'}
         opacity={isDragging ? 0.4 : 1}
         transform={CSS.Translate.toString(transform)}
         title='Drag to another quarter, or click to schedule'
         _hover={{ bg: 'bg.emphasized' }}
         onClick={handleOpen}
         onPointerUp={() => {
            if (isDragging) suppressClick.current = true
         }}
         {...listeners}
         {...attributes}
      >
         <Stack gap='0' flex='1' minW='0'>
            <HStack gap='1.5' minW='0' w='full'>
               <Text textStyle='xs' fontWeight='semibold' truncate>
                  {course.code}
               </Text>
               {course.credits != null && (
                  <Text textStyle='2xs' color='fg.muted' flexShrink={0}>
                     {course.credits}
                  </Text>
               )}
            </HStack>
            {course.title && (
               <Text textStyle='2xs' color='fg.muted' truncate>
                  {course.title}
               </Text>
            )}
         </Stack>
         <IconButton
            size='2xs'
            variant='ghost'
            aria-label={`Remove ${course.code}`}
            flexShrink={0}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => {
               e.stopPropagation()
               removeCourseFromQuarter(yearIndex, term, course.id)
            }}
         >
            <LuX />
         </IconButton>
      </HStack>
   )
}

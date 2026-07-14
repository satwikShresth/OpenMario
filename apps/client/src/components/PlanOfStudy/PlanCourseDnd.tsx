import {
   DndContext,
   DragOverlay,
   PointerSensor,
   closestCenter,
   useSensor,
   useSensors,
   type DragEndEvent,
   type DragStartEvent,
} from '@dnd-kit/core'
import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { orpc } from '@/helpers'
import {
   moveCourseToQuarter,
   seasonsFromAvailabilities,
   type PlannedCourse,
   type QuarterMode,
   type TermName,
} from '@/lib/plan-of-study'

export type CourseDragData = {
   type: 'course'
   yearIndex: number
   term: TermName
   course: PlannedCourse
}

export type QuarterDropData = {
   type: 'quarter'
   yearIndex: number
   term: TermName
   mode: QuarterMode
}

type PlanDragState = {
   usualTerms: TermName[] | null
   activeCourse: PlannedCourse | null
}

const PlanDragContext = createContext<PlanDragState>({
   usualTerms: null,
   activeCourse: null,
})

export function usePlanDrag() {
   return useContext(PlanDragContext)
}

export function courseDragId(yearIndex: number, term: TermName, courseId: string) {
   return `course:${yearIndex}:${term}:${courseId}`
}

export function quarterDropId(yearIndex: number, term: TermName) {
   return `quarter:${yearIndex}:${term}`
}

export function PlanCourseDndProvider({ children }: { children: ReactNode }) {
   const queryClient = useQueryClient()
   const [active, setActive] = useState<CourseDragData | null>(null)
   const [usualTerms, setUsualTerms] = useState<TermName[] | null>(null)
   const activeCourseIdRef = useRef<string | null>(null)

   const sensors = useSensors(
      useSensor(PointerSensor, {
         activationConstraint: { distance: 8 },
      }),
   )

   const value = useMemo<PlanDragState>(
      () => ({
         usualTerms,
         activeCourse: active?.course ?? null,
      }),
      [usualTerms, active],
   )

   const handleDragStart = (event: DragStartEvent) => {
      const data = event.active.data.current as CourseDragData | undefined
      if (!data || data.type !== 'course') return
      const courseId = data.course.id
      activeCourseIdRef.current = courseId
      setActive(data)
      setUsualTerms(null)

      void queryClient
         .fetchQuery(
            orpc.course.availabilities.queryOptions({
               input: { params: { course_id: courseId } },
               staleTime: 60_000,
            }),
         )
         .then(rows => {
            if (activeCourseIdRef.current !== courseId) return
            setUsualTerms(seasonsFromAvailabilities(rows))
         })
         .catch(() => {
            if (activeCourseIdRef.current === courseId) setUsualTerms([])
         })
   }

   const clearDrag = () => {
      activeCourseIdRef.current = null
      setActive(null)
      setUsualTerms(null)
   }

   const handleDragEnd = (event: DragEndEvent) => {
      const from = event.active.data.current as CourseDragData | undefined
      const over = event.over?.data.current as QuarterDropData | undefined
      clearDrag()
      if (!from || from.type !== 'course' || !over || over.type !== 'quarter') return
      if (over.mode === 'break') return
      moveCourseToQuarter(from.yearIndex, from.term, over.yearIndex, over.term, from.course.id)
   }

   return (
      <PlanDragContext.Provider value={value}>
         <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={clearDrag}
         >
            {children}
            <DragOverlay dropAnimation={null}>
               {active ? (
                  <Box
                     px='2'
                     py='1.5'
                     borderRadius='md'
                     bg='bg.panel'
                     borderWidth='1px'
                     borderColor='border.emphasized'
                     boxShadow='lg'
                     cursor='grabbing'
                     minW='8rem'
                     maxW='14rem'
                  >
                     <Stack gap='0'>
                        <HStack gap='1.5'>
                           <Text textStyle='xs' fontWeight='semibold'>
                              {active.course.code}
                           </Text>
                           {active.course.credits != null && (
                              <Text textStyle='2xs' color='fg.muted'>
                                 {active.course.credits}
                              </Text>
                           )}
                        </HStack>
                        {active.course.title && (
                           <Text textStyle='2xs' color='fg.muted' lineClamp={1}>
                              {active.course.title}
                           </Text>
                        )}
                     </Stack>
                  </Box>
               ) : null}
            </DragOverlay>
         </DndContext>
      </PlanDragContext.Provider>
   )
}

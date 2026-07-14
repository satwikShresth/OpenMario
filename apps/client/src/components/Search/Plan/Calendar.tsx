import { Box } from '@chakra-ui/react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { DateSelectArg, EventClickArg, DateInput } from '@fullcalendar/core'
import { upsertTerm, insertPlanEvent, updatePlanEvent, deletePlanEvent, deletePlanEventsByCrn, deleteSection } from '@/db/mutations'
import { useTermByNameYear } from '@/db/stores/terms'
import { sectionsStore } from '@/db/stores/sections'
import { usePlanEventsByTermId } from '@/db/stores/plan-events'
import { useStore } from '@tanstack/react-store'
import { css } from './calender.css'
import { ConfirmDialog } from './ConfirmDialog'
import { useConflicts } from '@/hooks/useConflicts'

type EventType = 'unavailable' | 'course'

const getTermMonth = (term: string): number => {
   switch (term) {
      case 'Spring':
         return 0
      case 'Summer':
         return 4
      case 'Fall':
         return 8
      case 'Winter':
         return 11
      default:
         return 0
   }
}

function weekStartForTerm(term: string, year: number) {
   const termStartDate = new Date(year, getTermMonth(term), 1)
   const dayOfWeek = termStartDate.getDay()
   const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
   termStartDate.setDate(termStartDate.getDate() + mondayOffset)
   return termStartDate
}

export const PlanCalendar = ({
   currentTerm,
   currentYear,
}: {
   currentTerm: string
   currentYear: number
}) => {
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
   const [eventToDelete, setEventToDelete] = useState<{
      id: string
      crn: string | null
      type: EventType
   } | null>(null)
   const calendarRef = useRef<FullCalendar>(null)
   const containerRef = useRef<HTMLDivElement>(null)

   const { hasConflict } = useConflicts(currentTerm, currentYear)

   const currentTermData = useTermByNameYear(currentTerm, currentYear)
   const rawEvents = usePlanEventsByTermId(currentTermData?.id ?? null)
   const allSections = useStore(sectionsStore)

   const dbEvents = rawEvents.map(e => ({
      ...e,
      course_id: e.crn ? (allSections.get(e.crn)?.course_id ?? null) : null,
   }))

   const events = dbEvents.map(event => {
      const courseHasConflict =
         event.type === 'course' && event.course_id && hasConflict(event.course_id)
      const colors =
         event.type === 'course'
            ? {
                 backgroundColor: '#3b82f6',
                 borderColor: courseHasConflict ? '#ef4444' : '#2563eb',
                 textColor: '#ffffff',
              }
            : {
                 backgroundColor: '#ef4444',
                 borderColor: '#dc2626',
                 textColor: '#ffffff',
              }

      const baseEvent = {
         id: event.id,
         title: event.title || 'Untitled',
         type: event.type as EventType,
         ...colors,
         editable: event.type === 'unavailable',
         startEditable: event.type === 'unavailable',
         durationEditable: event.type === 'unavailable',
         extendedProps: {
            sectionCrn: event.crn,
            dbEventId: event.id,
            type: event.type,
            hasConflict: courseHasConflict,
         },
      }

      if (event.type === 'course') {
         const eventStart = new Date(event.start)
         const eventEnd = new Date(event.end)
         const startHours = eventStart.getHours().toString().padStart(2, '0')
         const startMinutes = eventStart.getMinutes().toString().padStart(2, '0')
         const endHours = eventEnd.getHours().toString().padStart(2, '0')
         const endMinutes = eventEnd.getMinutes().toString().padStart(2, '0')
         const dayOfWeek = eventStart.getDay()

         const startRecurDate = new Date(currentYear, getTermMonth(currentTerm), 1)
         startRecurDate.setHours(0, 0, 0, 0)
         const endRecurDate = new Date(currentYear, getTermMonth(currentTerm) + 3, 0)
         endRecurDate.setHours(23, 59, 59, 999)

         return {
            ...baseEvent,
            startTime: `${startHours}:${startMinutes}`,
            endTime: `${endHours}:${endMinutes}`,
            daysOfWeek: [dayOfWeek],
            startRecur: startRecurDate,
            endRecur: endRecurDate,
         }
      }

      return {
         ...baseEvent,
         start: event.start as DateInput,
         end: event.end as DateInput,
      }
   })

   const initialDate = useMemo(
      () => weekStartForTerm(currentTerm, currentYear),
      [currentTerm, currentYear],
   )

   useEffect(() => {
      const api = calendarRef.current?.getApi()
      if (!api) return
      api.gotoDate(initialDate)
      api.updateSize()
   }, [initialDate])

   useEffect(() => {
      const el = containerRef.current
      if (!el || typeof ResizeObserver === 'undefined') return
      const observer = new ResizeObserver(() => {
         calendarRef.current?.getApi().updateSize()
      })
      observer.observe(el)
      return () => observer.disconnect()
   }, [])

   const handleDateSelect = async (selectInfo: DateSelectArg) => {
      selectInfo.view.calendar.unselect()
      const termId = currentTermData?.id ?? (await upsertTerm(currentTerm, currentYear))
      await insertPlanEvent({
         type: 'unavailable',
         title: 'Unavailable',
         start: selectInfo.start.toISOString(),
         end: selectInfo.end.toISOString(),
         term_id: termId,
      })
   }

   const handleEventChange = async (changeInfo: any) => {
      const event = changeInfo.event
      const dbEventId = event.extendedProps.dbEventId || event.id
      const eventType = event.extendedProps.type || event._def.extendedProps.type

      if (eventType !== 'unavailable') {
         changeInfo.revert()
         return
      }

      await updatePlanEvent(dbEventId, {
         start: event.start.toISOString(),
         end: (event.end || event.start).toISOString(),
      })
   }

   const handleEventClick = (clickInfo: EventClickArg) => {
      const event = clickInfo.event
      const dbEventId = event.extendedProps.dbEventId || event.id
      const crn = event.extendedProps.sectionCrn
      const eventType = event.extendedProps.type || event._def.extendedProps.type
      setEventToDelete({ id: dbEventId, crn, type: eventType })
      setDeleteDialogOpen(true)
   }

   const handleConfirmDelete = async () => {
      if (!eventToDelete) return
      const { id, crn, type } = eventToDelete

      if (type === 'course' && crn) {
         await deletePlanEventsByCrn(crn)
         await deleteSection(crn)
      } else {
         await deletePlanEvent(id)
      }

      setEventToDelete(null)
      setDeleteDialogOpen(false)
   }

   const handleCancelDelete = () => {
      setEventToDelete(null)
      setDeleteDialogOpen(false)
   }

   return (
      <Box h='full' display='flex' flexDirection='column' minH={0}>
         <Box
            ref={containerRef}
            flex='1'
            minH='0'
            overflow='hidden'
            bg='bg'
            borderRadius='lg'
            borderWidth='1px'
            borderColor='border'
            css={css}
         >
            <FullCalendar
               key={`${currentTerm}-${currentYear}`}
               ref={calendarRef}
               plugins={[timeGridPlugin, interactionPlugin]}
               timeZone='local'
               initialView='timeGridWeek'
               initialDate={initialDate}
               firstDay={1}
               weekends={false}
               headerToolbar={false}
               dayHeaderFormat={{ weekday: 'short' }}
               slotMinTime='07:00:00'
               slotMaxTime='22:00:00'
               allDaySlot={false}
               expandRows
               height='100%'
               stickyHeaderDates
               nowIndicator
               slotDuration='00:30:00'
               slotLabelInterval='01:00:00'
               slotLabelFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  omitZeroMinute: true,
                  meridiem: 'short',
               }}
               selectable
               selectMirror
               select={handleDateSelect}
               eventClick={handleEventClick}
               eventChange={handleEventChange}
               events={events}
               editable
               eventResizableFromStart
               eventDurationEditable
            />
         </Box>

         <ConfirmDialog
            setDeleteDialogOpen={setDeleteDialogOpen}
            deleteDialogOpen={deleteDialogOpen}
            handleConfirmDelete={handleConfirmDelete}
            handleCancelDelete={handleCancelDelete}
            isCourseEvent={
               eventToDelete
                  ? dbEvents.find(e => e.id === eventToDelete.id)?.type === 'course'
                  : false
            }
            courseInfo={(() => {
               if (!eventToDelete) return undefined
               const event = dbEvents.find(e => e.id === eventToDelete.id)
               if (event?.type !== 'course') return undefined
               const formatTime = (date: Date) =>
                  date.toLocaleTimeString('en-US', {
                     hour: 'numeric',
                     minute: '2-digit',
                     hour12: true,
                  })
               return {
                  title: event.title || undefined,
                  days: event.start
                     ? new Date(event.start).toLocaleDateString('en-US', { weekday: 'long' })
                     : undefined,
                  startTime: event.start ? formatTime(new Date(event.start)) : undefined,
                  endTime: event.end ? formatTime(new Date(event.end)) : undefined,
               }
            })()}
         />
      </Box>
   )
}

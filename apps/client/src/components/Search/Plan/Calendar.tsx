import { VStack, Box } from '@chakra-ui/react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useState, useRef } from 'react'
import type { DateSelectArg, EventClickArg, DateInput } from '@fullcalendar/core'
import { planEventsCollection } from '@/helpers/collections'
import { useLiveQuery, eq, and } from '@tanstack/react-db'
import { css } from './calender.css'
import { ConfirmDialog } from './ConfirmDialog'
import { useSearch } from '@tanstack/react-router'
import { useConflicts } from '@/hooks/useConflicts'

type EventType = 'unavailable' | 'course'

// Helper function to convert day abbreviations to day numbers (0 = Sunday, 1 = Monday, etc.)
const dayToNumber = (day: string): number => {
  const dayMap: { [key: string]: number } = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
  }
  return dayMap[day] ?? 1
}

// Helper function to create Date object from time string (e.g., "09:00:00")
// Uses the current week to calculate the correct date for a given day of week
const createDateTimeForDay = (dayOfWeek: number, timeString: string): Date => {
  const now = new Date()

  // Get the start of the current week (Monday)
  const currentDay = now.getDay()
  const diff = currentDay === 0 ? -6 : 1 - currentDay // Adjust so Monday is start of week
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)

  // Calculate target date based on day of week
  const targetDate = new Date(monday)
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to days from Monday
  targetDate.setDate(monday.getDate() + daysFromMonday)

  // Parse time string (format: "HH:MM:SS")
  const [hours, minutes] = timeString.split(':').map(Number)
  targetDate.setHours(hours!, minutes, 0, 0)

  return targetDate
}
export const PlanCalendar = () => {
  const { term: currentTerm, year: currentYear } = useSearch({ from: '/_search/courses/plan' })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const calendarRef = useRef<FullCalendar>(null)

  // Get conflicts data
  const { hasConflict } = useConflicts(currentTerm, currentYear)


  // Fetch events for current term and year
  const { data: dbEvents } = useLiveQuery(
    // @ts-ignore
    (q) => q.from({ events: planEventsCollection })
      .select(({ events }) => ({ ...events }))
      .where(({ events }) => and(
        eq(events.term, currentTerm),
        eq(events.year, currentYear),
      )),
    [currentTerm, currentYear]
  )

  // Convert DB events to FullCalendar format
  // For course events: generate multiple events from one DB record (one per meeting day)
  // For unavailable events: one DB record = one calendar event
  const events = (dbEvents ?? []).flatMap((event) => {
    // Check if this course has conflicts
    const hasCourseConflict = event.type === 'course' && event.courseId && hasConflict(event.courseId)

    // Standardized colors based on event type
    const colors = event.type === 'course'
      ? {
        backgroundColor: '#3b82f6',
        borderColor: hasCourseConflict ? '#ef4444' : '#2563eb',
        textColor: '#ffffff'
      }
      : { backgroundColor: '#ef4444', borderColor: '#dc2626', textColor: '#ffffff' }

    if (event.type === 'course' && event.days && event.startTime && event.endTime) {
      // Parse the days array from JSON string
      const days = JSON.parse(event.days) as string[]

      // Generate one calendar event per meeting day
      return days.map((day: string) => {
        const dayNumber = dayToNumber(day)
        const startDateTime = createDateTimeForDay(dayNumber, event.startTime!)
        const endDateTime = createDateTimeForDay(dayNumber, event.endTime!)

        return {
          id: `${event.id}-${day}`, // Unique ID for each occurrence
          title: event.title,
          start: startDateTime as DateInput,
          end: endDateTime,
          type: event.type as EventType,
          ...colors,
          editable: false,
          startEditable: false,
          durationEditable: false,
          groupId: event.crn, // Group by CRN for deletion
          extendedProps: {
            courseId: event.courseId,
            crn: event.crn,
            dbEventId: event.id // Store the original DB event ID
          }
        }
      })
    }

    // Unavailable event - one-to-one mapping
    return [{
      id: event.id,
      title: event.title,
      start: event.start! as DateInput,
      end: event.end! as DateInput,
      type: event.type as EventType,
      ...colors,
      editable: true,
      startEditable: true,
      durationEditable: true
    }]
  })

  // Handle creating unavailable events by dragging
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const calendarApi = selectInfo.view.calendar
    calendarApi.unselect()

    planEventsCollection.insert({
      id: crypto.randomUUID(),
      title: 'Unavailable',
      start: selectInfo.start,
      end: selectInfo.end,
      type: 'unavailable',
      term: currentTerm as "Fall" | "Winter" | "Spring" | "Summer",
      year: currentYear,
      courseId: null,
      crn: null,
      days: null,
      startTime: null,
      endTime: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  // Handle clicking on events (for deletion or editing)
  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event

    // For course events, get the actual DB event ID from extendedProps
    const dbEventId = event.extendedProps.dbEventId || event.id
    setEventToDelete(dbEventId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      // Simply delete the one DB record - rendering will handle the rest
      planEventsCollection.delete(eventToDelete)
      setEventToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleCancelDelete = () => {
    setEventToDelete(null)
    setDeleteDialogOpen(false)
  }

  return (
    <VStack align='stretch' gap={2}>

      <Box
        w="full"
        minH="400px"
        bg="bg"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="border"
        css={css}
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          timeZone='EST'
          initialView="timeGridWeek"
          headerToolbar={false}
          dayHeaderFormat={{ weekday: 'short' }}
          dayHeaderContent={(args) => {
            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            return dayNames[args.dow === 0 ? 6 : args.dow - 1]
          }}
          slotMinTime="07:00:00"
          slotMaxTime="24:00:00"
          hiddenDays={[0]}
          allDaySlot={false}
          expandRows={false}
          height="auto"
          contentHeight="auto"
          slotDuration="00:30:00"
          slotLabelInterval="01:00:00"
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: true,
            meridiem: 'short'
          }}
          selectable={true}
          selectMirror={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          events={events}
          editable={true}
          eventResizableFromStart={true}
          eventDurationEditable={true}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        setDeleteDialogOpen={setDeleteDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        handleConfirmDelete={handleConfirmDelete}
        handleCancelDelete={handleCancelDelete}
        isCourseEvent={eventToDelete ?
          dbEvents?.find((e: any) => e.id === eventToDelete)?.type === 'course'
          : false
        }
        courseInfo={(() => {
          if (!eventToDelete) return undefined
          const event = dbEvents?.find((e: any) => e.id === eventToDelete)
          if (event?.type !== 'course') return undefined

          // Parse days from JSON string
          let daysString = event.days
          try {
            if (event.days) {
              const daysArray = JSON.parse(event.days) as string[]
              daysString = daysArray.join(', ')
            }
          } catch {
            // If parsing fails, use as-is
          }

          return {
            title: event.title || undefined,
            crn: event.crn || undefined,
            days: daysString || undefined,
            startTime: event.startTime || undefined,
            endTime: event.endTime || undefined
          }
        })()}
      />
    </VStack>
  )
}


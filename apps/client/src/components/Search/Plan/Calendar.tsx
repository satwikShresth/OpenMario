import { VStack, Box } from '@chakra-ui/react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useState, useRef } from 'react'
import type { DateSelectArg, EventClickArg, DateInput } from '@fullcalendar/core'
import { planEventsCollection, sectionsCollection, termsCollection } from '@/helpers/collections'
import { useLiveQuery, eq, and } from '@tanstack/react-db'
import { css } from './calender.css'
import { ConfirmDialog } from './ConfirmDialog'
import { useSearch } from '@tanstack/react-router'
import { useConflicts } from '@/hooks/useConflicts'

type EventType = 'unavailable' | 'course'
const getTermMonth = (term: string): number => {
  switch (term) {
    case 'Spring': return 0; // January
    case 'Summer': return 4; // May
    case 'Fall': return 8; // September
    case 'Winter': return 11; // December
    default: return 0;
  }
}

export const PlanCalendar = () => {
  const { term: currentTerm, year: currentYear } = useSearch({ from: '/_search/courses/plan' })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<{ id: string; crn: string | null; type: EventType } | null>(null)
  const calendarRef = useRef<FullCalendar>(null)

  // Get conflicts data
  const { hasConflict } = useConflicts(currentTerm, currentYear)

  // Query for current term to get termId
  const { data: currentTermData } = useLiveQuery(
    (q) => q
      .from({ term: termsCollection })
      .select(({ term }) => ({ ...term }))
      .where(({ term }) => and(
        eq(term.term, currentTerm),
        eq(term.year, currentYear)
      ))
      .findOne(),
    [currentTerm, currentYear]
  )


  // Fetch events for current term and year by joining with terms and sections to get courseId
  const { data: dbEvents } = useLiveQuery(
    // @ts-ignore
    (q) => q
      .from({ events: planEventsCollection })
      .innerJoin({ term: termsCollection }, ({ events, term }) => eq(events.termId, term.id))
      .leftJoin({ section: sectionsCollection }, ({ events, section }) => eq(events.crn, section.crn))
      .select(({ events, section }) => ({ 
        ...events, 
        courseId: section?.courseId 
      }))
      .where(({ term }) => and(
        eq(term.term, currentTerm),
        eq(term.year, currentYear),
      )),
    [currentTerm, currentYear],
  )

  // Debug logging
  console.debug('📅 Calendar query result:', {
    currentTerm,
    currentYear,
    eventCount: dbEvents?.length,
    events: dbEvents
  })

  const events = (dbEvents ?? []).map((event) => {
    // Check if this course has conflicts
    const courseHasConflict = event.type === 'course' && event.courseId && hasConflict(event.courseId)
    
    // Standardized colors based on event type and conflict status
    const colors = event.type === 'course'
      ? {
        backgroundColor: '#3b82f6',
        borderColor: courseHasConflict ? '#ef4444' : '#2563eb', // Red border if conflict
        textColor: '#ffffff'
      }
      : { backgroundColor: '#ef4444', borderColor: '#dc2626', textColor: '#ffffff' }

    const baseEvent = {
      id: event.id,
      title: event.title || 'Untitled',
      type: event.type as EventType,
      ...colors,
      editable: event.type === 'unavailable',
      startEditable: event.type === 'unavailable',
      durationEditable: event.type === 'unavailable',
      extendedProps: {
        sectionCrn: event?.crn,
        dbEventId: event.id,
        type: event.type,
        hasConflict: courseHasConflict
      }
    };

    if (event.type === 'course') {
      // Course events repeat weekly on the same day (calendar displays in local time)
      const eventStart = new Date(event.start!);
      const eventEnd = new Date(event.end!);

      // Format time in local time for display
      const startHours = eventStart.getHours().toString().padStart(2, '0');
      const startMinutes = eventStart.getMinutes().toString().padStart(2, '0');
      const endHours = eventEnd.getHours().toString().padStart(2, '0');
      const endMinutes = eventEnd.getMinutes().toString().padStart(2, '0');

      return {
        ...baseEvent,
        startTime: `${startHours}:${startMinutes}`, // HH:MM in local time
        endTime: `${endHours}:${endMinutes}`, // HH:MM in local time
        daysOfWeek: [eventStart.getDay()], // Day of week in local time (0=Sunday, 1=Monday, etc.)
        startRecur: new Date(currentYear, getTermMonth(currentTerm), 1),
        endRecur: new Date(currentYear, getTermMonth(currentTerm) + 3, 0)
      };
    }
    // Unavailable events are one-time occurrences
    return {
      ...baseEvent,
      start: event.start! as DateInput,
      end: event.end! as DateInput
    };
  })

  // Handle creating unavailable events by dragging
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const calendarApi = selectInfo.view.calendar
    calendarApi.unselect()

    console.debug('🔧 Creating unavailable block:', {
      start: selectInfo.start.toISOString(),
      end: selectInfo.end.toISOString()
    })

    // Get or create termId
    let termId = currentTermData?.id
    if (!termId) {
      // Create term if it doesn't exist
      termId = crypto.randomUUID()
      termsCollection.insert({
        id: termId,
        term: currentTerm,
        year: currentYear,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    planEventsCollection.insert({
      id: crypto.randomUUID(),
      title: 'Unavailable',
      start: selectInfo.start,
      end: selectInfo.end,
      type: 'unavailable',
      termId,
      crn: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  // Handle event changes (move/resize for unavailable blocks)
  const handleEventChange = (changeInfo: any) => {
    const event = changeInfo.event
    const dbEventId = event.extendedProps.dbEventId || event.id
    const eventType = event.extendedProps.type || event._def.extendedProps.type

    // Only update unavailable events (courses shouldn't be edited this way)
    if (eventType !== 'unavailable') {
      console.warn('Cannot edit course events via drag/resize')
      changeInfo.revert()
      return
    }

    const newStart = event.start
    const newEnd = event.end || event.start

    console.debug('✏️ Updating unavailable block:', {
      id: dbEventId,
      start: newStart.toISOString(),
      end: newEnd.toISOString()
    })

    // Update in database using collection
    planEventsCollection.update(dbEventId, (draft) => {
      draft.start = newStart
      draft.end = newEnd
      draft.updatedAt = new Date()
    })
  }

  // Handle clicking on events (for deletion or editing)
  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event

    // For course events, get the actual DB event ID, sectionId and crn from extendedProps
    const dbEventId = event.extendedProps.dbEventId || event.id
    const crn = event.extendedProps.sectionCrn
    const eventType = event.extendedProps.type || event._def.extendedProps.type

    setEventToDelete({ id: dbEventId, crn, type: eventType })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      const { id, crn, type } = eventToDelete

      console.debug('🗑️ Deleting event:', { id, crn, type })

      if (type === 'course' && crn) {
        // Delete all events for this section's CRN
        const eventsToDelete = dbEvents?.filter(e => e.crn === crn && e.type === 'course') || []
        
        console.debug(`🗑️ Found ${eventsToDelete.length} events to delete for CRN ${crn}:`, eventsToDelete.map(e => e.id))
        
        eventsToDelete.forEach(event => {
          console.debug(`🗑️ Deleting event ${event.id}`)
          planEventsCollection.delete(event.id)
        })

        // Delete the section (if it exists)
        // Note: Liked sections are handled separately, so we can just delete
        const sectionToUpdate = sectionsCollection.get(crn)
        if (sectionToUpdate) {
          console.debug('🗑️ Deleting section:', crn)
          sectionsCollection.delete(crn)
        } else {
          console.debug('🗑️ No section found for CRN:', crn)
        }
      } else {
        // For unavailable events, just delete the event
        console.debug('🗑️ Deleting single unavailable event:', id)
        planEventsCollection.delete(id)
      }

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
          timeZone='local'
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
          eventChange={handleEventChange}
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

          // Format the event time
          const formatTime = (date: Date) => {
            return date.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })
          }

          const startTime = event.start ? formatTime(new Date(event.start)) : undefined
          const endTime = event.end ? formatTime(new Date(event.end)) : undefined
          const dayName = event.start ? new Date(event.start).toLocaleDateString('en-US', { weekday: 'long' }) : undefined

          return {
            title: event.title || undefined,
            days: dayName,
            startTime,
            endTime
          }
        })()}
      />
    </VStack>
  )
}


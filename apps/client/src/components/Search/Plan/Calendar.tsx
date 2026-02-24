import { Box } from '@chakra-ui/react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useState, useRef } from 'react'
import type { DateSelectArg, EventClickArg, DateInput } from '@fullcalendar/core'
import { planEventsCollection, sectionsCollection, termsCollection } from '@/helpers/collections'
import { useLiveQuery, eq, and } from '@tanstack/react-db'
import { css } from './calender.css'
import { ConfirmDialog } from './ConfirmDialog'
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

export const PlanCalendar = ({ currentTerm, currentYear }: { currentTerm: string; currentYear: number }) => {
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
    console.debug('🔄 Processing event:', {
      id: event.id,
      type: event.type,
      title: event.title,
      start: event.start,
      end: event.end,
      crn: event.crn
    })
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

      // Calculate day of week (FullCalendar uses 0=Sunday, 1=Monday, etc.)
      const dayOfWeek = eventStart.getDay();
      
      // Create start and end recurrence dates (set to start of day in local timezone)
      const startRecurDate = new Date(currentYear, getTermMonth(currentTerm), 1);
      startRecurDate.setHours(0, 0, 0, 0);
      
      const endRecurDate = new Date(currentYear, getTermMonth(currentTerm) + 3, 0);
      endRecurDate.setHours(23, 59, 59, 999);

      const recurringEvent = {
        ...baseEvent,
        startTime: `${startHours}:${startMinutes}`, // HH:MM format
        endTime: `${endHours}:${endMinutes}`, // HH:MM format
        daysOfWeek: [dayOfWeek], // Day of week (0=Sunday, 1=Monday, etc.)
        startRecur: startRecurDate, // Date object
        endRecur: endRecurDate // Date object
      };
      
      console.debug('✅ Created recurring event:', {
        id: recurringEvent.id,
        title: recurringEvent.title,
        daysOfWeek: recurringEvent.daysOfWeek,
        startTime: recurringEvent.startTime,
        endTime: recurringEvent.endTime,
        startRecur: recurringEvent.startRecur,
        endRecur: recurringEvent.endRecur
      });
      
      return recurringEvent;
    }
    // Unavailable events are one-time occurrences
    const unavailableEvent = {
      ...baseEvent,
      start: event.start! as DateInput,
      end: event.end! as DateInput
    };
    
    console.debug('✅ Created unavailable event:', {
      id: unavailableEvent.id,
      title: unavailableEvent.title,
      start: unavailableEvent.start,
      end: unavailableEvent.end
    });
    
    return unavailableEvent;
  })
  
  console.debug('📊 Final events array:', {
    totalEvents: events.length,
    courseEvents: events.filter(e => e.type === 'course').length,
    unavailableEvents: events.filter(e => e.type === 'unavailable').length,
    events: events
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

  // Calculate initial date for the term (show the week containing the term start)
  const termStartDate = new Date(currentYear, getTermMonth(currentTerm), 1)
  
  // Set initial date to the Monday of the week containing the term start
  // FullCalendar week view starts on Monday (day 1), but getDay() returns 0 for Sunday
  const initialDate = new Date(termStartDate)
  const dayOfWeek = initialDate.getDay()
  // Convert to Monday-based: 0=Sunday -> 6, 1=Monday -> 0, etc.
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  initialDate.setDate(initialDate.getDate() + mondayOffset)

  return (
    <Box h="full" display="flex" flexDirection="column">
      {/* Calendar fills all available panel height and scrolls internally */}
      <Box
        flex="1"
        minH="0"
        overflow="hidden"
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
          initialDate={initialDate}
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
          height="100%"
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

          const formatTime = (date: Date) =>
            date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

          return {
            title: event.title || undefined,
            days: event.start ? new Date(event.start).toLocaleDateString('en-US', { weekday: 'long' }) : undefined,
            startTime: event.start ? formatTime(new Date(event.start)) : undefined,
            endTime: event.end ? formatTime(new Date(event.end)) : undefined,
          }
        })()}
      />
    </Box>
  )
}


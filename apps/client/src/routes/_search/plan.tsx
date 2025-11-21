import { Container, VStack, Box, HStack, Button, Text } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useState } from 'react'

export const Route = createFileRoute('/_search/plan')({
  component: RouteComponent,
})

type Term = 'Fall' | 'Winter' | 'Spring' | 'Summer'

const TERMS: Term[] = ['Fall', 'Winter', 'Spring', 'Summer']
const AVAILABLE_YEARS = [2025]

function RouteComponent() {
  const [currentTermIndex, setCurrentTermIndex] = useState(0)
  const [currentYear, setCurrentYear] = useState(2025)

  const currentTerm = TERMS[currentTermIndex]

  const handlePrevTerm = () => {
    if (currentTermIndex === 0) {
      // Go to previous year if available
      const currentYearIndex = AVAILABLE_YEARS.indexOf(currentYear)
      if (currentYearIndex > 0) {
        setCurrentYear(AVAILABLE_YEARS[currentYearIndex - 1]!)
        setCurrentTermIndex(TERMS.length - 1)
      }
    } else {
      setCurrentTermIndex(currentTermIndex - 1)
    }
  }

  const handleNextTerm = () => {
    if (currentTermIndex === TERMS.length - 1) {
      // Go to next year if available
      const currentYearIndex = AVAILABLE_YEARS.indexOf(currentYear)
      if (currentYearIndex < AVAILABLE_YEARS.length - 1) {
        setCurrentYear(AVAILABLE_YEARS[currentYearIndex + 1]!)
        setCurrentTermIndex(0)
      }
    } else {
      setCurrentTermIndex(currentTermIndex + 1)
    }
  }

  const canGoPrev = currentTermIndex > 0 || AVAILABLE_YEARS.indexOf(currentYear) > 0
  const canGoNext = currentTermIndex < TERMS.length - 1 || AVAILABLE_YEARS.indexOf(currentYear) < AVAILABLE_YEARS.length - 1

  return (
    <Container maxW="container.xl" py={2}>
      <VStack align='stretch' gap={2}>
        {/* Custom Navigation Header */}
        <HStack justify="space-between" px={2}>
          <Button
            onClick={handlePrevTerm}
            disabled={!canGoPrev}
            size="sm"
            variant="outline"
            borderRadius="md"
          >
            Previous
          </Button>

          <Text fontSize="lg" fontWeight="bold" color="fg.emphasized">
            {currentTerm} {currentYear}
          </Text>

          <Button
            onClick={handleNextTerm}
            disabled={!canGoNext}
            size="sm"
            variant="outline"
            borderRadius="md"
          >
            Next
          </Button>
        </HStack>

        <Box
          w="full"
          minH="400px"
          bg="bg"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="border"
          css={{
            // Remove ugly borders on scrollgrid table
            '& .fc-scrollgrid': {
              border: 'none !important',
              borderWidth: '0 !important',
            },
            '& .fc-scrollgrid-liquid': {
              border: 'none !important',
            },
            // Reduce slot height for more compact view
            '& .fc-timegrid-slot': {
              height: '30px !important',
              minHeight: '30px !important',
            },
            // Add padding to the calendar body
            '& .fc-timegrid-body': {
              minHeight: '400px',
            },
            // Header toolbar spacing
            '& .fc-header-toolbar': {
              marginBottom: '10px !important',
              padding: '5px 0',
              display: 'none !important', // Hide default toolbar
            },
            // Make scrollable area more spacious
            '& .fc-scroller': {
              overflowY: 'auto !important',
            },
            // Ensure proper table layout
            '& .fc-timegrid-axis-frame': {
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
            },
            // Use Chakra color mode compatible colors
            '& .fc-theme-standard td': {
              borderColor: 'var(--chakra-colors-border)',
            },
            '& .fc-theme-standard th': {
              borderColor: 'var(--chakra-colors-border)',
            },
            '& .fc-col-header-cell': {
              backgroundColor: 'var(--chakra-colors-bg-subtle)',
              color: 'var(--chakra-colors-fg)',
              padding: '8px 4px !important',
              fontSize: '13px',
              fontWeight: '600',
            },
            '& .fc-timegrid-slot-label': {
              color: 'var(--chakra-colors-fg)',
              padding: '4px 8px !important',
              fontSize: '12px',
              fontWeight: '500',
              verticalAlign: 'middle',
            },
            '& .fc-toolbar-title': {
              color: 'var(--chakra-colors-fg-emphasized)',
              display: 'none',
            },
            '& .fc-timegrid-axis': {
              width: '60px !important',
              minWidth: '60px !important',
              visibility: 'visible !important',
              opacity: '1 !important',
              backgroundColor: 'var(--chakra-colors-bg-subtle)',
            },
          }}
        >
          <FullCalendar
            plugins={[timeGridPlugin]}
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
          />
        </Box>
      </VStack>
    </Container>
  )
}

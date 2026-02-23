import { Box, Flex, Text, ScrollArea, HStack, Icon, Button, Dialog, VStack, Switch as ChakraSwitch } from '@chakra-ui/react'
import { SearchBox, RefinementSelectInDialog as RefinementSelect } from '@/components/Search'
import { Configure, useInfiniteHits, useCurrentRefinements } from 'react-instantsearch'
import { planEventsCollection, sectionsCollection, termsCollection } from '@/helpers/collections'
import { eq, useLiveQuery, and } from '@tanstack/react-db'
import { PlanCard } from './PlanCard'
import { useMobile } from '@/hooks'
import { Stats } from '@/components/Search/Stats'
import { useEffect, useRef, useState } from 'react'
import type { Section } from '@/types'
import { Switch, Tooltip } from '@/components/ui'
import { WarningIcon, FilterIcon, HeartFilledIcon, HeartIcon } from '@/components/icons'
import { Tag } from '@/components/ui'

// Helper function to check if two time ranges overlap
const timeRangesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours! * 60 + minutes!
  }

  const s1 = parseTime(start1)
  const e1 = parseTime(end1)
  const s2 = parseTime(start2)
  const e2 = parseTime(end2)

  return s1 < e2 && s2 < e1
}

// Helper function to check if a section overlaps with unavailable blocks
export const checkUnavailableOverlap = (section: Section, dbEvents: any[]): boolean => {
  if (!section.days || !section.start_time || !section.end_time || !dbEvents) {
    return false
  }

  return dbEvents.some((event: any) => {
    // Only check unavailable events
    if (event.type === 'unavailable' && event.start && event.end) {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      const eventDayOfWeek = eventStart.getDay()

      // Map section days to day numbers
      const dayMap: Record<string, number> = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      }

      // Check if any of the section's days match the unavailable event's day
      const sectionDayNumbers = section.days.map((day: string) => dayMap[day])
      if (!sectionDayNumbers.includes(eventDayOfWeek)) {
        return false
      }

      // Extract time from event dates
      const eventStartTime = `${eventStart.getHours().toString().padStart(2, '0')}:${eventStart.getMinutes().toString().padStart(2, '0')}:00`
      const eventEndTime = `${eventEnd.getHours().toString().padStart(2, '0')}:${eventEnd.getMinutes().toString().padStart(2, '0')}:00`

      return timeRangesOverlap(
        section.start_time,
        section.end_time,
        eventStartTime,
        eventEndTime
      )
    }

    return false
  })
}

// Helper function to check if a section overlaps with other courses
export const checkCourseOverlap = (section: Section, dbEvents: any[]): boolean => {
  if (!section.days || !section.start_time || !section.end_time || !dbEvents) {
    return false
  }

  // Map section days to day numbers
  const dayMap: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  }

  const sectionDayNumbers = section.days.map((day: string) => dayMap[day])

  return dbEvents.some((event: any) => {
    // Only check course events
    if (event.type === 'course' && event.start && event.end) {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      const eventDayOfWeek = eventStart.getDay()

      // Check if the section meets on the same day as this event
      if (!sectionDayNumbers.includes(eventDayOfWeek)) {
        return false
      }

      // Extract time from event dates
      const eventStartTime = `${eventStart.getHours().toString().padStart(2, '0')}:${eventStart.getMinutes().toString().padStart(2, '0')}:00`
      const eventEndTime = `${eventEnd.getHours().toString().padStart(2, '0')}:${eventEnd.getMinutes().toString().padStart(2, '0')}:00`

      return timeRangesOverlap(
        section.start_time,
        section.end_time,
        eventStartTime,
        eventEndTime
      )
    }

    return false
  })
}

export const PlanCourses = ({ currentTerm, currentYear }: { currentTerm: string; currentYear: number }) => {
  const isMobile = useMobile()
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const [hideCoursesOverlap, setHideCoursesOverlap] = useState(false)
  const [hideUnavailableOverlap, setHideUnavailableOverlap] = useState(false)
  const [showOnlyLiked, setShowOnlyLiked] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const handleSearchChange = (query: string) => {
    setSearchQuery(query || undefined)
  }

  // Fetch sections that are planned for current term/year (to get CRNs)
  const { data: plannedSections } = useLiveQuery(
    // @ts-ignore
    (q) => q
      .from({ sec: sectionsCollection })
      .innerJoin({ term: termsCollection }, ({ sec, term }) => eq(sec.termId, term.id))
      .select(({ sec }) => ({ ...sec }))
      .where(({ sec, term }) => and(
        eq(sec.status, 'planned'),
        eq(term.term, currentTerm),
        eq(term.year, currentYear)
      )),
    [currentTerm, currentYear]
  )

  // Fetch ALL events (including unavailable) for overlap checking (for current term/year only)
  const { data: allEvents } = useLiveQuery(
    // @ts-ignore
    (q) => q
      .from({ events: planEventsCollection })
      .innerJoin({ term: termsCollection }, ({ events, term }) => eq(events.termId, term.id))
      .select(({ events }) => ({ ...events }))
      .where(({ term }) => and(
        eq(term.term, currentTerm),
        eq(term.year, currentYear)
      )),
    [currentTerm, currentYear]
  )

  // Fetch liked sections (all terms)
  const { data: likedSections } = useLiveQuery(
    // @ts-ignore
    (q) => q.from({ sections: sectionsCollection })
      .select(({ sections }) => ({ ...sections }))
      .where(({ sections }) => eq(sections.liked, true))
  )

  // Get CRNs of courses already in schedule (planned for current term)
  const addedCRNs = plannedSections?.map((s: any) => s.crn).filter(Boolean) ?? []

  // Get CRNs of liked sections
  const likedCRNs = likedSections?.map((s: any) => s.crn).filter(Boolean) ?? []

  // Create filter string for liked courses if enabled
  const favoritesFilter = likedCRNs.length > 0
    ? likedCRNs.map((crn: string) => `crn = "${crn}"`).join(' OR ')
    : null

  // Create filter string for term, year, and exclude added courses
  let filters = `term = "${currentTerm} ${currentYear}"`

  // If showing only liked courses, use favorites filter
  if (showOnlyLiked && favoritesFilter) {
    filters = `${filters} AND (${favoritesFilter})`
  } else if (addedCRNs.length > 0) {
    // Only exclude added courses when NOT showing liked courses
    const crnFilter = addedCRNs.map((crn: any) => `crn != "${crn}"`).join(' AND ')
    filters = `${filters} AND ${crnFilter}`
  }

  return (
    <Box
      w="full"
      h="full"
      bg="bg"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      {/* Configure filters for term, year, and exclude added courses */}
      <Configure filters={filters} hitsPerPage={20} />

      {/* Fixed Header Section */}
      <Flex direction="column" gap={4} p={4} flexShrink={0}>
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" gap={1}>
            <Text fontSize="lg" fontWeight="bold" color="fg.emphasized">
              Available Courses
            </Text>
            <Text fontSize="sm" color="fg.muted">
              {currentTerm} {currentYear}
            </Text>
          </VStack>

          <HStack gap={3}>
            {/* Liked Courses Toggle */}
            <ChakraSwitch.Root
              colorPalette="pink"
              size="sm"
              disabled={likedCRNs.length < 1}
              checked={showOnlyLiked}
              onCheckedChange={(e: any) => setShowOnlyLiked(e.checked)}
            >
              <ChakraSwitch.Label>Show liked ({likedCRNs.length})</ChakraSwitch.Label>
              <ChakraSwitch.HiddenInput />
              <ChakraSwitch.Control>
                <ChakraSwitch.Thumb>
                  <ChakraSwitch.ThumbIndicator fallback={<Icon as={HeartIcon} />}>
                    <Icon as={HeartFilledIcon} />
                  </ChakraSwitch.ThumbIndicator>
                </ChakraSwitch.Thumb>
              </ChakraSwitch.Control>
            </ChakraSwitch.Root>

            {/* Filters Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFiltersOpen(true)}
            >
              <Icon as={FilterIcon} />
              Filters
            </Button>
          </HStack>
        </Flex>

        {/* Search Box */}
        <Box>
          <SearchBox value={searchQuery} onChange={handleSearchChange} />
        </Box>

        {/* Current Refinements */}
        <CurrentRefinementsTags />

        {/* Stats */}
        {!isMobile && (
          <Box>
            <Stats />
          </Box>
        )}
      </Flex>

      {/* Filters Dialog */}
      <Dialog.Root
        open={filtersOpen}
        onOpenChange={(e) => setFiltersOpen(e.open)}
        size="md"
        lazyMount={false}
        unmountOnExit={false}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Filter Courses</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4} align="stretch">
                {/* Subject Filter */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Subject
                  </Text>
                  <RefinementSelect attribute="subject_name" size="md" />
                </Box>

                {/* Instruction Method Filter */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Instruction Method
                  </Text>
                  <RefinementSelect attribute="instruction_method" size="md" />
                </Box>

                {/* Instruction Type Filter */}
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Instruction Type
                  </Text>
                  <RefinementSelect attribute="instruction_type" size="md" />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Course
                  </Text>
                  <RefinementSelect attribute="course" size="md" />
                </Box>

                {/* Overlap Filters */}
                <Box borderTopWidth="1px" pt={4}>
                  <Text fontSize="sm" fontWeight="medium" mb={3}>
                    Hide Conflicts
                  </Text>
                  <VStack gap={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="fg.muted">
                        Hide Course Conflicts
                      </Text>
                      <Switch
                        size="sm"
                        checked={hideCoursesOverlap}
                        onCheckedChange={(e: any) => setHideCoursesOverlap(e.checked)}
                      />
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="fg.muted">
                        Hide Unavailable Conflicts
                      </Text>
                      <Switch
                        size="sm"
                        checked={hideUnavailableOverlap}
                        onCheckedChange={(e: any) => setHideUnavailableOverlap(e.checked)}
                      />
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Close</Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Scrollable Content */}
      <ScrollArea.Root flex="1" minH="0" overflow="hidden" variant="hover">
        <ScrollArea.Viewport h="100%">
          <ScrollArea.Content px={4} pb={4}>
            <InfiniteHitsList
              currentTerm={currentTerm}
              currentYear={currentYear}
              allEvents={allEvents ?? []}
              hideCoursesOverlap={hideCoursesOverlap}
              hideUnavailableOverlap={hideUnavailableOverlap}
            />
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar>
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </Box>
  )
}

const InfiniteHitsList = ({
  currentYear,
  currentTerm,
  allEvents,
  hideCoursesOverlap,
  hideUnavailableOverlap
}: {
  currentYear: number,
  currentTerm: string,
  allEvents: any[],
  hideCoursesOverlap: boolean,
  hideUnavailableOverlap: boolean
}) => {
  const { items, isLastPage, showMore } = useInfiniteHits<Section>()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sentinelRef.current !== null) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLastPage) {
            showMore()
          }
        })
      })

      observer.observe(sentinelRef.current)

      return () => {
        observer.disconnect()
      }
    }
  }, [isLastPage, showMore])

  // Filter out overlapping courses based on switches
  const filteredItems = items.filter((section) => {
    if (hideCoursesOverlap && checkCourseOverlap(section, allEvents)) {
      return false
    }
    if (hideUnavailableOverlap && checkUnavailableOverlap(section, allEvents)) {
      return false
    }
    return true
  })

  return (
    <Box maxW="520px" mx="auto" w="full">
      <Flex direction="column" gap={3} width="full">
        {filteredItems.map((section) => {
          const hasCourseOverlap = checkCourseOverlap(section, allEvents)
          const hasUnavailableOverlap = checkUnavailableOverlap(section, allEvents)
          const hasAnyOverlap = hasCourseOverlap || hasUnavailableOverlap

          // Build tooltip message
          let tooltipMessage = ''
          if (hasCourseOverlap && hasUnavailableOverlap) {
            tooltipMessage = 'This course conflicts with both scheduled courses and unavailable blocks'
          } else if (hasCourseOverlap) {
            tooltipMessage = 'This course conflicts with other scheduled courses'
          } else if (hasUnavailableOverlap) {
            tooltipMessage = 'This course conflicts with unavailable time blocks'
          }

          return (
            <Tooltip
              key={`${section.crn}-${section.instruction_method}-${section.instruction_type}`}
              content={tooltipMessage}
              disabled={!hasAnyOverlap}
            >
              <Box
                borderWidth={hasAnyOverlap ? '2px' : '0'}
                borderColor={hasAnyOverlap ? 'red.500' : 'transparent'}
                borderRadius="lg"
                transition="all 0.2s"
                position="relative"
                _hover={{
                  borderColor: hasAnyOverlap ? 'red.600' : 'transparent'
                }}
              >
                <PlanCard section={section} currentTerm={currentTerm} currentYear={currentYear} />
                {/* Overlap Warning Badge */}
                {hasAnyOverlap && (
                  <Box
                    position="absolute"
                    bottom={2}
                    right={2}
                    zIndex={1}
                    bg="red.500"
                    color="white"
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight="medium"
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Icon as={WarningIcon} />
                    <Text>
                      {hasCourseOverlap && hasUnavailableOverlap
                        ? 'Both Conflicts'
                        : hasCourseOverlap
                          ? 'Course Conflict'
                          : 'Unavailable Conflict'}
                    </Text>
                  </Box>
                )}
              </Box>
            </Tooltip>
          )
        })}
      </Flex>
      {/* Sentinel element for intersection observer */}
      <Box ref={sentinelRef} h="20px" aria-hidden="true" />
      {!isLastPage && (
        <Flex justify="center" py={4}>
          <Text fontSize="sm" color="fg.muted">
            Loading more...
          </Text>
        </Flex>
      )}
    </Box>
  )
}

const CurrentRefinementsTags = () => {
  const { items, refine } = useCurrentRefinements({
    excludedAttributes: ['query']
  })

  if (items.length === 0) return null

  // Convert snake_case to Title Case
  const formatLabel = (str: string) => {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Handle removing all refinements for an attribute
  const handleRemoveAttribute = (item: any) => {
    // Remove all refinements for this attribute
    item.refinements.forEach((refinement: any) => {
      refine(refinement)
    })
  }

  return (
    <Flex wrap="wrap" gap={2}>
      {items.map((item) => {
        // Combine all refinement labels for this attribute
        const values = item.refinements
          .map((refinement: any) => refinement.label)
          .join(', ')

        return (
          <Tag
            key={item.attribute}
            size="sm"
            colorPalette="blue"
            closable
            onClose={() => handleRemoveAttribute(item)}
          >
            {formatLabel(item.label)}: {values}
          </Tag>
        )
      })}
    </Flex>
  )
}


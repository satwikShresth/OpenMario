import { Box, Flex, Text, ScrollArea, HStack, Icon, Button, Dialog, VStack, Switch as ChakraSwitch } from '@chakra-ui/react'
import { SearchBox, RefinementSelectInDialog as RefinementSelect } from '@/components/Search'
import { Configure, useInfiniteHits, useCurrentRefinements } from 'react-instantsearch'
import { useTermByNameYear } from '@/db/stores/terms'
import { useSectionsByTermId, useLikedSections } from '@/db/stores/sections'
import { usePlanEventsByTermId } from '@/db/stores/plan-events'
import { PlanCard } from './PlanCard'
import { useMobile } from '@/hooks'
import { Stats } from '@/components/Search/Stats'
import { useCallback, useRef, useState } from 'react'
import type { Section } from '@/types'
import { Switch, Tooltip } from '@/components/ui'
import { WarningIcon, FilterIcon, HeartFilledIcon, HeartIcon } from '@/components/icons'
import { Tag } from '@/components/ui'

/** Reverse of parseDrexelTerm — convert (termName, year) → Drexel numeric ID e.g. "202515" */
const TERM_TO_CODE: Record<string, string> = { Fall: '15', Winter: '25', Spring: '35', Summer: '45' }
const toTermId = (term: string, year: number): string => `${year}${TERM_TO_CODE[term] ?? '15'}`

const timeRangesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  const parseTime = (t: string) => { const [h, m] = t.split(':').map(Number); return h! * 60 + m! }
  return parseTime(start1) < parseTime(end2) && parseTime(start2) < parseTime(end1)
}

export const checkUnavailableOverlap = (section: Section, dbEvents: any[]): boolean => {
  if (!section.days || !section.start_time || !section.end_time || !dbEvents) return false
  return dbEvents.some((event: any) => {
    if (event.type !== 'unavailable' || !event.start || !event.end) return false
    const eventStart = new Date(event.start)
    const eventDayOfWeek = eventStart.getDay()
    const dayMap: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 }
    if (!section.days.map((d: string) => dayMap[d]).includes(eventDayOfWeek)) return false
    const fmt = (d: Date) => `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:00`
    return timeRangesOverlap(section.start_time, section.end_time, fmt(eventStart), fmt(new Date(event.end)))
  })
}

export const checkCourseOverlap = (section: Section, dbEvents: any[]): boolean => {
  if (!section.days || !section.start_time || !section.end_time || !dbEvents) return false
  const dayMap: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 }
  const sectionDayNumbers = section.days.map((d: string) => dayMap[d])
  return dbEvents.some((event: any) => {
    if (event.type !== 'course' || !event.start || !event.end) return false
    const eventStart = new Date(event.start)
    if (!sectionDayNumbers.includes(eventStart.getDay())) return false
    const fmt = (d: Date) => `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:00`
    return timeRangesOverlap(section.start_time, section.end_time, fmt(eventStart), fmt(new Date(event.end)))
  })
}

export const PlanCourses = ({ currentTerm, currentYear }: { currentTerm: "Fall" | "Winter" | "Spring" | "Summer"; currentYear: number }) => {
  const isMobile = useMobile()
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const [hideCoursesOverlap, setHideCoursesOverlap] = useState(false)
  const [hideUnavailableOverlap, setHideUnavailableOverlap] = useState(false)
  const [showOnlyLiked, setShowOnlyLiked] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const termData = useTermByNameYear(currentTerm, currentYear)
  const termId = termData?.id ?? null

  const termSections = useSectionsByTermId(termId)
  const allEvents = usePlanEventsByTermId(termId)
  const likedSections = useLikedSections()

  const addedCRNs = termSections.filter(s => s.status === 'planned').map(s => s.crn)
  const likedCRNs = likedSections.map(s => s.crn)
  const favoritesFilter = likedCRNs.length > 0
    ? likedCRNs.map(crn => `crn = "${crn}"`).join(' OR ')
    : null

  const meiliTermId = toTermId(currentTerm, currentYear)
  let filters = `term = "${meiliTermId}"`
  if (showOnlyLiked && favoritesFilter) {
    filters = `${filters} AND (${favoritesFilter})`
  } else if (addedCRNs.length > 0) {
    const crnFilter = addedCRNs.map(crn => `crn != "${crn}"`).join(' AND ')
    filters = `${filters} AND ${crnFilter}`
  }

  return (
    <Box w="full" h="full" bg="bg" borderRadius="lg" borderWidth="1px" borderColor="border"
      display="flex" flexDirection="column" overflow="hidden">
      <Configure filters={filters} hitsPerPage={20} />

      <Flex direction="column" gap={4} p={4} flexShrink={0}>
        <Flex justify="space-between" align="center">
          <VStack align="start" gap={1}>
            <Text fontSize="lg" fontWeight="bold" color="fg.emphasized">Available Courses</Text>
            <Text fontSize="sm" color="fg.muted">{currentTerm} {currentYear}</Text>
          </VStack>
          <HStack gap={3}>
            <ChakraSwitch.Root
              colorPalette="pink" size="sm"
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
            <Button size="sm" variant="outline" onClick={() => setFiltersOpen(true)}>
              <Icon as={FilterIcon} />Filters
            </Button>
          </HStack>
        </Flex>

        <Box><SearchBox value={searchQuery} onChange={q => setSearchQuery(q || undefined)} /></Box>
        <CurrentRefinementsTags />
        {!isMobile && <Box><Stats /></Box>}
      </Flex>

      <Dialog.Root open={filtersOpen} onOpenChange={(e) => setFiltersOpen(e.open)} size="md" lazyMount={false} unmountOnExit={false}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header><Dialog.Title>Filter Courses</Dialog.Title></Dialog.Header>
            <Dialog.Body>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Subject</Text>
                  <RefinementSelect attribute="subject_name" size="md" />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Instruction Method</Text>
                  <RefinementSelect attribute="instruction_method" size="md" />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Instruction Type</Text>
                  <RefinementSelect attribute="instruction_type" size="md" />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Course</Text>
                  <RefinementSelect attribute="course" size="md" />
                </Box>
                <Box borderTopWidth="1px" pt={4}>
                  <Text fontSize="sm" fontWeight="medium" mb={3}>Hide Conflicts</Text>
                  <VStack gap={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="fg.muted">Hide Course Conflicts</Text>
                      <Switch size="sm" checked={hideCoursesOverlap} onCheckedChange={(e: any) => setHideCoursesOverlap(e.checked)} />
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="fg.muted">Hide Unavailable Conflicts</Text>
                      <Switch size="sm" checked={hideUnavailableOverlap} onCheckedChange={(e: any) => setHideUnavailableOverlap(e.checked)} />
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild><Button variant="outline">Close</Button></Dialog.ActionTrigger>
            </Dialog.Footer>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <ScrollArea.Root flex="1" minH="0" overflow="hidden" variant="hover">
        <ScrollArea.Viewport h="100%">
          <ScrollArea.Content px={4} pb={4}>
            <InfiniteHitsList
              currentTerm={currentTerm} currentYear={currentYear}
              allEvents={allEvents}
              hideCoursesOverlap={hideCoursesOverlap}
              hideUnavailableOverlap={hideUnavailableOverlap}
            />
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar><ScrollArea.Thumb /></ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </Box>
  )
}

const InfiniteHitsList = ({
  currentYear, currentTerm, allEvents, hideCoursesOverlap, hideUnavailableOverlap
}: {
  currentYear: number; currentTerm: "Fall" | "Winter" | "Spring" | "Summer"
  allEvents: any[]; hideCoursesOverlap: boolean; hideUnavailableOverlap: boolean
}) => {
  const { items, isLastPage, showMore } = useInfiniteHits<Section>()

  const showMoreRef = useRef(showMore)
  const isLastPageRef = useRef(isLastPage)
  showMoreRef.current = showMore
  isLastPageRef.current = isLastPage

  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelCallbackRef = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      observerRef.current = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isLastPageRef.current) showMoreRef.current()
        })
      })
      observerRef.current.observe(el)
    } else {
      observerRef.current?.disconnect()
      observerRef.current = null
    }
  }, [])

  const filteredItems = items.filter(section => {
    if (hideCoursesOverlap && checkCourseOverlap(section, allEvents)) return false
    if (hideUnavailableOverlap && checkUnavailableOverlap(section, allEvents)) return false
    return true
  })

  return (
    <Box maxW="520px" mx="auto" w="full">
      <Flex direction="column" gap={3} width="full">
        {filteredItems.map(section => {
          const hasCourseOverlap = checkCourseOverlap(section, allEvents)
          const hasUnavailableOverlap = checkUnavailableOverlap(section, allEvents)
          const hasAnyOverlap = hasCourseOverlap || hasUnavailableOverlap

          let tooltipMessage = ''
          if (hasCourseOverlap && hasUnavailableOverlap) tooltipMessage = 'This course conflicts with both scheduled courses and unavailable blocks'
          else if (hasCourseOverlap) tooltipMessage = 'This course conflicts with other scheduled courses'
          else if (hasUnavailableOverlap) tooltipMessage = 'This course conflicts with unavailable time blocks'

          return (
            <Tooltip
              key={`${section.crn}-${section.instruction_method}-${section.instruction_type}`}
              content={tooltipMessage}
              disabled={!hasAnyOverlap}
            >
              <Box
                borderWidth={hasAnyOverlap ? '2px' : '0'}
                borderColor={hasAnyOverlap ? 'red.500' : 'transparent'}
                borderRadius="lg" transition="all 0.2s" position="relative"
                _hover={{ borderColor: hasAnyOverlap ? 'red.600' : 'transparent' }}
              >
                <PlanCard section={section} currentTerm={currentTerm} currentYear={currentYear} />
                {hasAnyOverlap && (
                  <Box position="absolute" bottom={2} right={2} zIndex={1} bg="red.500" color="white"
                    px={2} py={1} borderRadius="md" fontSize="xs" fontWeight="medium"
                    display="flex" alignItems="center" gap={1}>
                    <Icon as={WarningIcon} />
                    <Text>
                      {hasCourseOverlap && hasUnavailableOverlap ? 'Both Conflicts'
                        : hasCourseOverlap ? 'Course Conflict' : 'Unavailable Conflict'}
                    </Text>
                  </Box>
                )}
              </Box>
            </Tooltip>
          )
        })}
      </Flex>
      <Box ref={sentinelCallbackRef} h="20px" aria-hidden="true" />
      {!isLastPage && (
        <Flex justify="center" py={4}>
          <Text fontSize="sm" color="fg.muted">Loading more...</Text>
        </Flex>
      )}
    </Box>
  )
}

const CurrentRefinementsTags = () => {
  const { items, refine } = useCurrentRefinements({ excludedAttributes: ['query'] })
  if (items.length === 0) return null

  const formatLabel = (str: string) =>
    str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

  return (
    <Flex wrap="wrap" gap={2}>
      {items.map(item => {
        const values = item.refinements.map((r: any) => r.label).join(', ')
        return (
          <Tag key={item.attribute} size="sm" colorPalette="blue" closable
            onClose={() => { item.refinements.forEach((r: any) => { refine(r) }) }}>
            {formatLabel(item.label)}: {values}
          </Tag>
        )
      })}
    </Flex>
  )
}

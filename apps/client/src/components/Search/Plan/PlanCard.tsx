import {
  Card as CCard,
  Flex,
  Text,
  HStack,
  VStack,
  For,
  Icon,
  Button,
} from '@chakra-ui/react'
import type { Section } from '@/types'
import { Tag, Tooltip } from '@/components/ui'
import { toaster } from '@/components/ui/toaster'
import { Link, useMatch } from '@tanstack/react-router'
import { formatTime } from '@/helpers'
import { getDifficultyColor, getRatingColor, weekItems } from '@/components/Search/Courses/helpers'
import { ExternalLinkIcon, AddCircleIcon, CheckCircleIcon } from '@/components/icons'
import { sectionsCollection, termsCollection, coursesCollection, planEventsCollection } from '@/helpers/collections'
import { useLiveQuery, eq, and } from '@tanstack/react-db'

type PlanCardProps = {
  section: Section,
  currentTerm: "Fall" | "Winter" | "Spring" | "Summer",
  currentYear: number
}

export const PlanCard = ({ section, currentTerm, currentYear }: PlanCardProps) => {
  const match = useMatch({ from: '/_search/courses/plan' });

  // Check if course section is already planned by checking if plan events exist
  // Check across ALL terms, not just current term
  const { data: plannedSection } = useLiveQuery(
    (q) => q
      .from({ events: planEventsCollection })
      .select(({ events }) => ({ ...events }))
      .where(({ events }) => eq(events.crn, section.crn.toString()),)
      .findOne(),
    [section.crn]
  )

  // Query for term
  const { data: existingTerm } = useLiveQuery(
    (q) => q
      .from({ term: termsCollection })
      .select(({ term }) => ({ ...term }))
      .where(({ term }) =>
        and(
          eq(term.term, currentTerm),
          eq(term.year, currentYear)
        )
      )
      .findOne(),
    [currentTerm, currentYear]
  )

  // Check if course is marked as taken
  const { data: courseData } = useLiveQuery(
    (q) => q
      .from({ course: coursesCollection })
      .select(({ course }) => ({ ...course }))
      .where(({ course }) => eq(course.id, section.course_id))
      .findOne(),
    [section.course_id]
  )

  const isAlreadyAdded = !!plannedSection
  const isTaken = !!courseData?.completed
  const hasSchedule = !!(section.days && section.start_time && section.end_time)
  const isOnlineAsync = section.instruction_method === 'Online' && section.instruction_type === 'Asynchronous'

  const handleMarkAsTaken = () => {
    try {
      // Create or update course with completed flag
      const course = coursesCollection.get(section.course_id);
      if (!course) {
        coursesCollection.insert({
          id: section.course_id,
          course: section.course,
          title: section.title,
          completed: true,
          credits: section.credits || null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      } else {
        coursesCollection.update(section.course_id, (draft) => {
          draft.completed = true
          draft.updatedAt = new Date()
        })
      }

      toaster.create({
        title: 'Course Marked as Taken',
        description: `${section.course}: ${section.title} has been marked as completed`,
        type: 'success',
      })
    } catch (error) {
      console.error('Error marking course as taken:', error)
      toaster.create({
        title: 'Error',
        description: 'Failed to mark course as taken',
        type: 'error',
      })
    }
  }

  const handleAddCourse = () => {
    // Check if already added
    if (isAlreadyAdded) {
      toaster.create({
        title: 'Already Added',
        description: 'This course is already in your schedule',
        type: 'warning',
      })
      return
    }

    try {
      // Ensure term exists before proceeding
      if (!existingTerm?.id) {
        toaster.create({
          title: 'Error',
          description: 'Term not found. Please refresh the page.',
          type: 'error',
        })
        return
      }

      const termId = existingTerm.id

      const course = coursesCollection.get(section.course_id);

      if (!course) {
        coursesCollection.insert({
          id: section.course_id,
          course: section.course,
          title: section.title,
          completed: false,
          credits: section.credits || null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }

      const existingSection = sectionsCollection.get(section.crn.toString())
      if (!existingSection) {
        console.debug('Creating new section for CRN:', section.crn.toString())
        sectionsCollection.insert({
          crn: section.crn.toString(),
          termId,
          courseId: section.course_id,
          status: 'planned',
          liked: false, // Liked sections are handled separately
          grade: null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        console.debug('✅ Section created successfully')
      } else {
        console.debug('Updating existing section for CRN:', section.crn.toString())
        sectionsCollection.update(section.crn.toString(), (draft) => {
          draft.status = 'planned'
          draft.updatedAt = new Date()
        })
      }


      // Check if events already exist - if so, skip creation
      if (plannedSection) {
        console.debug('⚠️ Events already exist for this CRN, skipping creation')
        toaster.create({
          title: 'Already Added',
          description: 'This course is already in your schedule',
          type: 'warning',
        })
        return
      }

      // No events exist, create them!
      console.debug('✅ No events found, creating new events for CRN:', section.crn.toString())

      // For Online-Asynchronous courses without schedule, just create section
      if (isOnlineAsync || !hasSchedule) {
        toaster.create({
          title: 'Course Added',
          description: `${section.course}: ${section.title} has been added (no calendar events)`,
          type: 'success',
        })
        return
      }

      const dayMap: Record<string, number> = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6
      }

      // Parse time
      const [startHours, startMinutes] = section.start_time!.split(':').map(Number)
      const [endHours, endMinutes] = section.end_time!.split(':').map(Number)

      // Use a reference week to get valid dates for each day
      const getTermMonth = (term: string): number => {
        switch (term) {
          case 'Spring': return 0 // January
          case 'Summer': return 4 // May
          case 'Fall': return 8 // September
          case 'Winter': return 11 // December
          default: return 0
        }
      }

      const referenceWeekStart = new Date(currentYear, getTermMonth(currentTerm), 1)

      // Create MULTIPLE events - one for each day the class meets
      console.debug('Creating events for days:', section.days)
      const events = section.days!.map(dayName => {
        const targetDayOfWeek = dayMap[dayName]

        // Find the first occurrence of this day in the term
        const eventDate = new Date(referenceWeekStart)
        while (eventDate.getDay() !== targetDayOfWeek) {
          eventDate.setDate(eventDate.getDate() + 1)
        }

        // Create start and end timestamps
        const eventStart = new Date(eventDate)
        eventStart.setHours(startHours!, startMinutes!, 0, 0)

        const eventEnd = new Date(eventDate)
        eventEnd.setHours(endHours!, endMinutes!, 0, 0)

        return {
          id: crypto.randomUUID(),
          type: 'course' as const,
          title: `${section.course}: ${section.title}`,
          start: eventStart,
          end: eventEnd,
          termId,
          crn: section.crn.toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.debug(`✅ Inserting ${events.length} events`)
      // Insert all events
      events.forEach((event, index) => {
        console.debug(`Inserting event ${index + 1}/${events.length}`, event)
        planEventsCollection.insert(event)
      })

      toaster.create({
        title: 'Course Added',
        description: `${section.course}: ${section.title} has been added to your schedule`,
        type: 'success',
      })
    } catch (error) {
      console.error('Error adding course to schedule:', error)
      toaster.create({
        title: 'Error',
        description: 'Failed to add course to schedule',
        type: 'error',
      })
    }
  }

  return (
    <CCard.Root
      width="full"
      p={3}
      _hover={{
        borderColor: 'border.emphasized',
        bg: (isAlreadyAdded || isTaken) ? 'bg' : 'bg.muted'
      }}
      transition="all 0.2s"
      opacity={(isAlreadyAdded || isTaken) ? 0.6 : 1}
    >
      <CCard.Body p={0} gap={3}>
        {isTaken && (
          <Tag size="sm" colorPalette="teal" width="fit-content">
            ✓ Completed
          </Tag>
        )}

        {/* Course Title with Credits and Tags */}
        <Flex wrap="wrap" gap={2} align="center">

          <Link
            to={`${match.fullPath}/$course_id` as any}
            params={{ course_id: section.course_id } as any}
            reloadDocument={false}
            resetScroll={false}
            replace={true}
            onClick={(e: any) => e.stopPropagation()}
          >

            <Text
              _hover={{ textDecoration: 'underline' }}
              fontSize="md"
              fontWeight="semibold"
              lineHeight="1.2"
            >
              {section.course}: {section.title}
            </Text>
          </Link>
          {section.credits && (
            <Tag size="sm">
              Credits: {section.credits}
            </Tag>
          )}
          <Tag size="sm">
            {section.instruction_method}
          </Tag>
          <Tag size="sm">
            {section.instruction_type}
          </Tag>
        </Flex>

        {/* Days, Time, Section, and CRN */}
        <Flex wrap="wrap" gap={2} align="center">
          {section.days && section.days.length > 0 && (
            <>
              <HStack gap={1}>
                {weekItems.map((item) => (
                  <Tooltip key={item.label} content={item.value}>
                    <Icon
                      size="sm"
                      as={section?.days.includes(item?.value)
                        ? item.filledIcon
                        : item.icon}
                    />
                  </Tooltip>
                ))}
              </HStack>
              {section.start_time && (
                <Tag size="sm" colorPalette="blue">
                  {formatTime(section.start_time)} - {formatTime(section.end_time)}
                </Tag>
              )}
            </>
          )}
          <Tag size="sm" variant="subtle">
            Section: {section.section}
          </Tag>
          <Tag size="sm" variant="subtle">
            CRN: {section.crn}
          </Tag>
        </Flex>

        {/* Instructors */}
        {section.instructors && section.instructors.length > 0 && (
          <VStack align="start" gap={2} width="full">
            <Text fontSize="xs" color="fg.muted">
              Instructors:
            </Text>
            <For each={section.instructors}>
              {(instructor) => (
                <Flex
                  key={instructor.id}
                  direction="column"
                  gap={2}
                  width="full"
                >
                  <Text fontSize="sm" fontWeight="medium" color="fg">
                    {instructor.name}
                  </Text>
                  <Flex wrap="wrap" gap={2}>
                    {instructor.avg_difficulty && (
                      <Tag
                        size="sm"
                        colorPalette={getDifficultyColor(instructor.avg_difficulty)}
                      >
                        Difficulty: {instructor.avg_difficulty.toFixed(1)}
                      </Tag>
                    )}
                    {instructor.avg_rating && (
                      <Tag
                        size="sm"
                        colorPalette={getRatingColor(instructor.avg_rating)}
                      >
                        Rating: {instructor.avg_rating.toFixed(1)}
                        {instructor.num_ratings && ` (${instructor.num_ratings})`}
                      </Tag>
                    )}
                    {instructor.rmp_id && (
                      <Link
                        //@ts-ignore: shuuup
                        to={`https://www.ratemyprofessors.com/professor/${instructor.rmp_id}`}
                        onClick={(e) => e.stopPropagation()}
                      >

                        <Tag
                          colorPalette="blue"
                          size="sm"
                          cursor="pointer"
                          _hover={{ opacity: 0.8 }}
                        >
                          <HStack gap={1}>
                            <Text fontSize="xs">RMP</Text>
                            <ExternalLinkIcon size={12} />
                          </HStack>
                        </Tag>
                      </Link>
                    )}
                  </Flex>
                </Flex>
              )}
            </For>
          </VStack>
        )}
        {/* Action Buttons */}
        {!isTaken && (
          <HStack gap={2}>
            {!isAlreadyAdded && (
              <Button
                size="sm"
                colorPalette="blue"
                variant="solid"
                onClick={handleAddCourse}
                flex={1}
              >
                <Icon as={AddCircleIcon} />
                {isOnlineAsync || !hasSchedule ? 'Add Course' : 'Add to Schedule'}
              </Button>
            )}
            {isAlreadyAdded && (
              <Tag size="sm" colorPalette="green" width="fit-content">
                {isOnlineAsync || !hasSchedule ? 'Added' : 'Added to Schedule'}
              </Tag>
            )}
            <Button
              size="sm"
              colorPalette="green"
              variant="outline"
              onClick={handleMarkAsTaken}
              width="fit-content"
            >
              <Icon as={CheckCircleIcon} />
              Mark as Taken
            </Button>
          </HStack>
        )}
      </CCard.Body>
    </CCard.Root >
  )
}


import {
  Card as CCard,
  Flex,
  Text,
  HStack,
  VStack,
  For,
  Icon,
} from '@chakra-ui/react'
import type { Section } from '@/types'
import { Tag, Tooltip } from '@/components/ui'
import { toaster } from '@/components/ui/toaster'
import { Link, useMatch } from '@tanstack/react-router'
import { formatTime } from '@/helpers'
import { getDifficultyColor, getRatingColor, weekItems } from '@/components/Search/Courses/helpers'
import { BiLinkExternal } from 'react-icons/bi'
import { planEventsCollection } from '@/helpers/collections'
import { useLiveQuery } from '@tanstack/react-db'

type PlanCardProps = {
  section: Section,
  currentTerm: "Fall" | "Winter" | "Spring" | "Summer",
  currentYear: number
}

export const PlanCard = ({ section, currentTerm, currentYear }: PlanCardProps) => {
  const match = useMatch({ from: '/_search/courses/plan' });

  // Fetch existing events to check if course is already added
  const { data: dbEvents } = useLiveQuery(
    // @ts-ignore
    (q) => q.from({ events: planEventsCollection })
      .select(({ events }) => ({ ...events }))
  )

  const isAlreadyAdded = dbEvents?.some((e: any) =>
    e.type === 'course' && e.crn === section.crn.toString()
  )

  const handleAddCourse = () => {
    // Check if course has meeting times
    if (!section.days || !section.start_time || !section.end_time) {
      toaster.create({
        title: 'Cannot Add Course',
        description: 'This course does not have scheduled meeting times',
        type: 'error',
      })
      return
    }

    // Check if already added
    if (isAlreadyAdded) {
      toaster.create({
        title: 'Already Added',
        description: 'This course is already in your schedule',
        type: 'warning',
      })
      return
    }

    // Add the course to the schedule
    planEventsCollection.insert({
      id: crypto.randomUUID(),
      title: `${section.course}`,
      start: null,
      end: null,
      type: 'course',
      term: currentTerm,
      year: currentYear,
      courseId: section.course_id,
      crn: section.crn.toString(),
      days: JSON.stringify(section.days),
      startTime: section.start_time,
      endTime: section.end_time,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Show success toast
    toaster.create({
      title: 'Course Added',
      description: `${section.course}: ${section.title} has been added to your schedule`,
      type: 'success',
    })
  }

  return (
    <CCard.Root
      width="full"
      p={3}
      _hover={{
        borderColor: 'border.emphasized',
        bg: isAlreadyAdded ? 'bg' : 'bg.muted'
      }}
      transition="all 0.2s"
      cursor={isAlreadyAdded ? 'not-allowed' : 'pointer'}
      opacity={isAlreadyAdded ? 0.6 : 1}
      onClick={isAlreadyAdded ? undefined : handleAddCourse}
    >
      <CCard.Body p={0} gap={3}>
        {/* Course Title with Credits and Tags */}
        <Flex wrap="wrap" gap={2} align="center">

          <Link
            to={`${match.fullPath}/$course_id`}
            params={{ course_id: section?.course_id! }}
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
                            <BiLinkExternal size={12} />
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
      </CCard.Body>
    </CCard.Root >
  )
}


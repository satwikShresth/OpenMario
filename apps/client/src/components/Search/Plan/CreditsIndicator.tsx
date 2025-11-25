import { Button, Icon, HoverCard as ChakraHoverCard, Dialog as ChakraDialog, Portal, VStack, Text, ScrollArea, HStack, Badge } from '@chakra-ui/react'
import { MdSchool, MdDelete } from 'react-icons/md'
import { useState } from 'react'
import { useLiveQuery, eq } from '@tanstack/react-db'
import { planEventsCollection, sectionsCollection, coursesCollection, termsCollection } from '@/helpers/collections'
import { toaster } from '@/components/ui/toaster'

// Create aliases for easier use
const HoverCard = {
  Root: ChakraHoverCard.Root,
  Trigger: ChakraHoverCard.Trigger,
  Positioner: ChakraHoverCard.Positioner,
  Content: ChakraHoverCard.Content,
  Arrow: ChakraHoverCard.Arrow,
}

const Dialog = {
  Root: ChakraDialog.Root,
  Trigger: ChakraDialog.Trigger,
  Backdrop: ChakraDialog.Backdrop,
  Positioner: ChakraDialog.Positioner,
  Content: ChakraDialog.Content,
  Header: ChakraDialog.Header,
  Title: ChakraDialog.Title,
  Body: ChakraDialog.Body,
  Footer: ChakraDialog.Footer,
  CloseTrigger: ChakraDialog.CloseTrigger,
  ActionTrigger: ChakraDialog.ActionTrigger,
}

type CreditsIndicatorProps = {
  currentTerm: string
  currentYear: number
}

export const CreditsIndicator = ({ currentTerm, currentYear }: CreditsIndicatorProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)

  // Fetch sections for current term (includes both courses with and without events)
  const { data: currentTermSections } = useLiveQuery(
    q =>
      q
        .from({ sections: sectionsCollection })
        .innerJoin({ terms: termsCollection }, ({ sections, terms }) =>
          eq(sections.termId, terms.id)
        )
        .leftJoin({ courses: coursesCollection }, ({ sections, courses }) =>
          eq(sections.courseId, courses.id)
        )
        .select(({ courses, terms, sections }) => ({
          courseId: courses?.id,
          courseName: courses?.title,
          courseNumber: courses?.course,
          credits: courses?.credits,
          crn: sections.crn,
          termName: terms.term,
          termYear: terms.year,
        }))
        .where(({ terms }) => eq(terms.term, currentTerm) && eq(terms.year, currentYear)),
    [currentTerm, currentYear]
  );

  // Fetch plan events for current term (to get event IDs for deletion)
  const { data: currentTermEvents } = useLiveQuery(
    q =>
      q
        .from({ events: planEventsCollection })
        .innerJoin({ terms: termsCollection }, ({ events, terms }) =>
          eq(events.termId, terms.id)
        )
        .select(({ events }) => ({
          eventId: events.id,
          crn: events.crn,
        }))
        .where(({ terms }) => eq(terms.term, currentTerm) && eq(terms.year, currentYear)),
    [currentTerm, currentYear]
  );

  // Get unique courses with their details
  const uniqueCourses = new Map<string, {
    courseId: string
    courseName: string
    courseNumber: string
    credits: number
    crns: string[]
    eventIds: string[]
  }>();

  currentTermSections?.forEach((section: any) => {
    if (section.courseId && section.credits) {
      const existing = uniqueCourses.get(section.courseId);
      if (existing) {
        if (!existing.crns.includes(section.crn)) {
          existing.crns.push(section.crn);
        }
      } else {
        uniqueCourses.set(section.courseId, {
          courseId: section.courseId,
          courseName: section.courseName || 'Untitled',
          courseNumber: section.courseNumber || section.courseId,
          credits: section.credits,
          crns: [section.crn],
          eventIds: []
        });
      }
    }
  });

  // Add event IDs to courses
  currentTermEvents?.forEach((event: any) => {
    // Find which course this event belongs to
    currentTermSections?.forEach((section: any) => {
      if (section.crn === event.crn && section.courseId) {
        const course = uniqueCourses.get(section.courseId);
        if (course && !course.eventIds.includes(event.eventId)) {
          course.eventIds.push(event.eventId);
        }
      }
    });
  });

  const courses = Array.from(uniqueCourses.values());
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const isOverloaded = totalCredits > 20;

  const handleRemoveCourse = (course: typeof courses[0]) => {
    try {
      // Delete all plan events for this course in this term
      course.eventIds.forEach(eventId => {
        if (eventId) {
          planEventsCollection.delete(eventId);
        }
      });

      // Delete all sections for this course in this term
      course.crns.forEach(crn => {
        if (crn) {
          sectionsCollection.delete(crn);
        }
      });

      toaster.create({
        title: 'Course removed',
        description: `${course.courseNumber} has been removed from ${currentTerm} ${currentYear}`,
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error removing course:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to remove course',
        type: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <>
      <HoverCard.Root openDelay={300} closeDelay={100}>
        <HoverCard.Trigger asChild>
          <Button
            colorPalette={isOverloaded ? 'red' : 'blue'}
            variant="subtle"
            size="xs"
            onClick={() => setDialogOpen(true)}
          >
            <Icon as={MdSchool} />
            {totalCredits} / 20 Credits
          </Button>
        </HoverCard.Trigger>
        <Portal>
          <HoverCard.Positioner>
            <HoverCard.Content maxW="300px">
              <HoverCard.Arrow />
              <VStack align="stretch" gap={2} p={3}>
                <HStack justify="space-between">
                  <Text fontWeight="semibold" fontSize="sm">
                    {currentTerm} {currentYear}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    Click for details
                  </Text>
                </HStack>
                <VStack align="stretch" gap={1.5}>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="fg.muted">
                      Total Credits
                    </Text>
                    <Badge size="sm" colorPalette={isOverloaded ? 'red' : 'blue'}>
                      {totalCredits} / 20
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="fg.muted">
                      Courses
                    </Text>
                    <Badge size="sm" colorPalette="gray">
                      {courses.length}
                    </Badge>
                  </HStack>
                </VStack>
              </VStack>
            </HoverCard.Content>
          </HoverCard.Positioner>
        </Portal>
      </HoverCard.Root>

      {/* Detailed Dialog */}
      <Dialog.Root
        open={dialogOpen}
        onOpenChange={(e) => setDialogOpen(e.open)}
        size="lg"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  <HStack>
                    <Icon as={MdSchool} color={isOverloaded ? 'red.500' : 'blue.500'} />
                    <Text>Scheduled Courses - {currentTerm} {currentYear}</Text>
                    <Badge colorPalette={isOverloaded ? 'red' : 'blue'}>
                      {totalCredits} / 20 Credits
                    </Badge>
                  </HStack>
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <ScrollArea.Root maxH="500px" variant="hover">
                  <ScrollArea.Viewport>
                    <ScrollArea.Content>
                      {courses.length === 0 ? (
                        <VStack p={8} gap={2}>
                          <Text color="fg.muted" fontSize="sm">
                            No courses scheduled for this term
                          </Text>
                        </VStack>
                      ) : (
                        <VStack align="stretch" gap={3}>
                          {courses.map((course) => (
                            <HStack
                              key={course.courseId}
                              justify="space-between"
                              p={4}
                              borderWidth="1px"
                              borderRadius="md"
                              bg="bg.subtle"
                            >
                              <VStack align="stretch" gap={1}>
                                <Text fontSize="md" fontWeight="bold">
                                  {course.courseNumber}
                                </Text>
                                <Text fontSize="sm" color="fg.muted">
                                  {course.courseName}
                                </Text>
                                <HStack gap={2}>
                                  <Badge size="sm" colorPalette="blue">
                                    {course.credits} Credits
                                  </Badge>
                                  <Badge size="sm" variant="subtle">
                                    {course.crns.length} Section{course.crns.length > 1 ? 's' : ''}
                                  </Badge>
                                  {course.eventIds.length === 0 && (
                                    <Badge size="sm" colorPalette="purple" variant="subtle">
                                      No Calendar
                                    </Badge>
                                  )}
                                </HStack>
                              </VStack>
                              <Button
                                variant="ghost"
                                size="sm"
                                colorPalette="red"
                                onClick={() => handleRemoveCourse(course)}
                              >
                                <Icon as={MdDelete} />
                                Remove
                              </Button>
                            </HStack>
                          ))}
                        </VStack>
                      )}
                    </ScrollArea.Content>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar>
                    <ScrollArea.Thumb />
                  </ScrollArea.Scrollbar>
                </ScrollArea.Root>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Close</Button>
                </Dialog.ActionTrigger>
              </Dialog.Footer>
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}


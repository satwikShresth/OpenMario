import { Button, Icon, HoverCard as ChakraHoverCard, Dialog as ChakraDialog, Portal, VStack, Text, ScrollArea, HStack, Badge } from '@chakra-ui/react'
import { GraduationCapIcon, DeleteIcon } from '@/components/icons'
import { useState } from 'react'
import { deletePlanEvent, deleteSection } from '@/db/mutations'
import { useTermByNameYear } from '@/db/stores/terms'
import { useSectionsByTermId } from '@/db/stores/sections'
import { usePlanEventsByTermId } from '@/db/stores/plan-events'
import { coursesStore } from '@/db/stores/courses'
import { useStore } from '@tanstack/react-store'
import { toaster } from '@/components/ui/toaster'

const HoverCard = {
  Root: ChakraHoverCard.Root, Trigger: ChakraHoverCard.Trigger,
  Positioner: ChakraHoverCard.Positioner, Content: ChakraHoverCard.Content,
  Arrow: ChakraHoverCard.Arrow,
}
const Dialog = {
  Root: ChakraDialog.Root, Trigger: ChakraDialog.Trigger, Backdrop: ChakraDialog.Backdrop,
  Positioner: ChakraDialog.Positioner, Content: ChakraDialog.Content,
  Header: ChakraDialog.Header, Title: ChakraDialog.Title, Body: ChakraDialog.Body,
  Footer: ChakraDialog.Footer, CloseTrigger: ChakraDialog.CloseTrigger,
  ActionTrigger: ChakraDialog.ActionTrigger,
}

export const CreditsIndicator = ({ currentTerm, currentYear }: { currentTerm: string; currentYear: number }) => {
  const [dialogOpen, setDialogOpen] = useState(false)

  const termData = useTermByNameYear(currentTerm, currentYear)
  const termId = termData?.id ?? null

  const rawSections = useSectionsByTermId(termId)
  const rawEvents = usePlanEventsByTermId(termId)
  const allCourses = useStore(coursesStore)

  const currentTermSections = rawSections.map(s => {
    const c = allCourses.get(s.course_id)
    return {
      crn: s.crn,
      course_id: s.course_id,
      course_name: c?.title ?? 'Untitled',
      course_number: c?.course ?? s.course_id,
      credits: c?.credits ?? 0,
    }
  })

  const currentTermEvents = rawEvents.map(e => ({ event_id: e.id, crn: e.crn }))

  const uniqueCourses = new Map<string, {
    courseId: string; courseName: string; courseNumber: string
    credits: number; crns: string[]; eventIds: string[]
  }>()

  currentTermSections.forEach((section) => {
    if (section.course_id && section.credits) {
      const existing = uniqueCourses.get(section.course_id)
      if (existing) {
        if (!existing.crns.includes(section.crn)) existing.crns.push(section.crn)
      } else {
        uniqueCourses.set(section.course_id, {
          courseId: section.course_id,
          courseName: section.course_name || 'Untitled',
          courseNumber: section.course_number || section.course_id,
          credits: section.credits,
          crns: [section.crn],
          eventIds: []
        })
      }
    }
  })

  currentTermEvents.forEach((event) => {
    currentTermSections.forEach((section) => {
      if (section.crn === event.crn && section.course_id) {
        const course = uniqueCourses.get(section.course_id)
        if (course && event.event_id && !course.eventIds.includes(event.event_id)) {
          course.eventIds.push(event.event_id)
        }
      }
    })
  })

  const courses = Array.from(uniqueCourses.values())
  const totalCredits = courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0)
  const isOverloaded = totalCredits > 20

  const handleRemoveCourse = async (course: typeof courses[0]) => {
    try {
      await Promise.all(course.eventIds.filter(Boolean).map(id => deletePlanEvent(id)))
      await Promise.all(course.crns.filter(Boolean).map(crn => deleteSection(crn)))
      toaster.create({
        title: 'Course removed',
        description: `${course.courseNumber} has been removed from ${currentTerm} ${currentYear}`,
        type: 'success', duration: 3000,
      })
    } catch (error) {
      console.error('Error removing course:', error)
      toaster.create({ title: 'Error', description: 'Failed to remove course', type: 'error', duration: 3000 })
    }
  }

  return (
    <>
      <HoverCard.Root openDelay={300} closeDelay={100}>
        <HoverCard.Trigger asChild>
          <Button
            colorPalette={isOverloaded ? 'red' : 'blue'}
            variant="subtle" size="xs"
            onClick={() => setDialogOpen(true)}
          >
            <Icon as={GraduationCapIcon} />
            {totalCredits} / 20 Credits
          </Button>
        </HoverCard.Trigger>
        <Portal>
          <HoverCard.Positioner>
            <HoverCard.Content maxW="300px">
              <HoverCard.Arrow />
              <VStack align="stretch" gap={2} p={3}>
                <HStack justify="space-between">
                  <Text fontWeight="semibold" fontSize="sm">{currentTerm} {currentYear}</Text>
                  <Text fontSize="xs" color="fg.muted">Click for details</Text>
                </HStack>
                <VStack align="stretch" gap={1.5}>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="fg.muted">Total Credits</Text>
                    <Badge size="sm" colorPalette={isOverloaded ? 'red' : 'blue'}>{totalCredits} / 20</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="fg.muted">Courses</Text>
                    <Badge size="sm" colorPalette="gray">{courses.length}</Badge>
                  </HStack>
                </VStack>
              </VStack>
            </HoverCard.Content>
          </HoverCard.Positioner>
        </Portal>
      </HoverCard.Root>

      <Dialog.Root open={dialogOpen} onOpenChange={(e) => setDialogOpen(e.open)} size="lg">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  <HStack>
                    <Icon as={GraduationCapIcon} color={isOverloaded ? 'red.500' : 'blue.500'} />
                    <Text>Scheduled Courses - {currentTerm} {currentYear}</Text>
                    <Badge colorPalette={isOverloaded ? 'red' : 'blue'}>{totalCredits} / 20 Credits</Badge>
                  </HStack>
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <ScrollArea.Root maxH="500px" variant="hover">
                  <ScrollArea.Viewport>
                    <ScrollArea.Content>
                      {courses.length === 0
                        ? <VStack p={8} gap={2}><Text color="fg.muted" fontSize="sm">No courses scheduled for this term</Text></VStack>
                        : (
                          <VStack align="stretch" gap={3}>
                            {courses.map((course) => (
                              <HStack key={course.courseId} justify="space-between" p={4} borderWidth="1px" borderRadius="md" bg="bg.subtle">
                                <VStack align="stretch" gap={1}>
                                  <Text fontSize="md" fontWeight="bold">{course.courseNumber}</Text>
                                  <Text fontSize="sm" color="fg.muted">{course.courseName}</Text>
                                  <HStack gap={2}>
                                    <Badge size="sm" colorPalette="blue">{course.credits} Credits</Badge>
                                    <Badge size="sm" variant="subtle">{course.crns.length} Section{course.crns.length > 1 ? 's' : ''}</Badge>
                                    {course.eventIds.length === 0 && (
                                      <Badge size="sm" colorPalette="purple" variant="subtle">No Calendar</Badge>
                                    )}
                                  </HStack>
                                </VStack>
                                <Button variant="ghost" size="sm" colorPalette="red" onClick={() => handleRemoveCourse(course)}>
                                  <Icon as={DeleteIcon} />
                                  Remove
                                </Button>
                              </HStack>
                            ))}
                          </VStack>
                        )}
                    </ScrollArea.Content>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar><ScrollArea.Thumb /></ScrollArea.Scrollbar>
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

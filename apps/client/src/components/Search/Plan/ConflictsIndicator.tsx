import { Button, Icon, HoverCard as ChakraHoverCard, Dialog as ChakraDialog, Portal, VStack, Text, ScrollArea, HStack, Badge } from '@chakra-ui/react'
import { WarningIcon, ExternalLinkIcon, CheckCircleIcon } from '@/components/icons'
import { useRefinementList } from 'react-instantsearch'
import { useConflicts } from '@/hooks/useConflicts'
import { coursesCollection } from '@/helpers/collections'
import { useState } from 'react'
import { toaster } from '@/components/ui/toaster'

export type ConflictType =
  | 'duplicate'
  | 'overlap'
  | 'course-overlap'
  | 'duplicate-course'
  | 'missing-corequisite'
  | 'missing-prerequisite'
  | 'unavailable-overlap';

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

const getConflictLabel = (type: ConflictType) => {
  switch (type) {
    case 'duplicate':
      return { text: 'Duplicate Sections', color: 'orange.500' }
    case 'overlap':
      return { text: 'Time Overlap', color: 'red.500' }
    case 'course-overlap':
      return { text: 'Course Time Conflict', color: 'red.500' }
    case 'duplicate-course':
      return { text: 'Duplicate Course', color: 'purple.500' }
    case 'missing-corequisite':
      return { text: 'Missing Corequisites', color: 'red.500' }
    case 'missing-prerequisite':
      return { text: 'Missing Prerequisites', color: 'red.600' }
    case 'unavailable-overlap':
      return { text: 'Unavailable Time Conflict', color: 'yellow.600' }
  }
}

type ConflictsIndicatorProps = {
  currentTerm: string
  currentYear: number
}

export const ConflictsIndicator = ({ currentTerm, currentYear }: ConflictsIndicatorProps) => {
  const courseRefinement = useRefinementList({ attribute: 'course' })
  const [dialogOpen, setDialogOpen] = useState(false)

  // Use the shared conflicts hook
  const { conflicts } = useConflicts(currentTerm, currentYear)

  // Handle clicking on a missing corequisite to add to search filters
  const handleCoreqClick = (courseId: string) => {
    courseRefinement.refine(courseId)
  }

  // Handle marking a prerequisite as taken
  const handleMarkAsTaken = async (detail: any) => {
    const courseData = detail.fullData || {}

    // Extract course information - no fallbacks, explicit validation
    const courseId = detail.id
    const courseNumber = detail.name
    const courseTitle = courseData.name  // title is in courseData.name
    const courseCredits = courseData.credits

    // Validate all required fields
    if (!courseId) {
      console.error('Missing courseId:', { detail, courseData })
      toaster.create({
        title: 'Error',
        description: 'Missing course ID',
        type: 'error',
        duration: 3000,
      })
      return
    }

    if (!courseNumber) {
      console.error('Missing courseNumber:', { detail, courseData })
      toaster.create({
        title: 'Error',
        description: 'Missing course number',
        type: 'error',
        duration: 3000,
      })
      return
    }

    if (!courseTitle) {
      console.error('Missing courseTitle:', { detail, courseData })
      toaster.create({
        title: 'Error',
        description: 'Missing course title',
        type: 'error',
        duration: 3000,
      })
      return
    }

    try {
      // Get or create course, then mark as completed
      const existingCourse = coursesCollection.get(courseId)

      if (existingCourse) {
        // Course exists, just mark as completed
        coursesCollection.update(courseId, (draft) => {
          draft.completed = true
          draft.updatedAt = new Date()
        })
      } else {
        // Create course and mark as completed
        coursesCollection.insert({
          id: courseId,
          course: courseNumber,
          title: courseTitle,
          credits: courseCredits || null,
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }

      toaster.create({
        title: 'Course marked as taken',
        description: `${courseNumber} has been added to your completed courses`,
        type: 'success',
        duration: 3000,
      })
    } catch (error) {
      console.error('Error marking course as taken:', error)
      toaster.create({
        title: 'Error',
        description: 'Failed to mark course as taken',
        type: 'error',
        duration: 3000,
      })
    }
  }

  if (conflicts.length === 0) return null

  // Group conflicts by type for summary
  const conflictsByType = conflicts.reduce((acc, conflict) => {
    acc[conflict.type] = (acc[conflict.type] || 0) + 1
    return acc
  }, {} as Record<ConflictType, number>)

  return (
    <>
      <HoverCard.Root openDelay={300} closeDelay={100}>
        <HoverCard.Trigger asChild>
          <Button
            colorPalette="orange"
            variant="subtle"
            size="xs"
            onClick={() => setDialogOpen(true)}
          >
            <Icon as={WarningIcon} />
            {conflicts.length} Conflicts
          </Button>
        </HoverCard.Trigger>
        <Portal>
          <HoverCard.Positioner>
            <HoverCard.Content maxW="300px">
              <HoverCard.Arrow />
              <VStack align="stretch" gap={2} p={3}>
                <HStack justify="space-between">
                  <Text fontWeight="semibold" fontSize="sm">
                    Quick Summary
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    Click for details
                  </Text>
                </HStack>
                <VStack align="stretch" gap={1.5}>
                  {Object.entries(conflictsByType).map(([type, count]) => {
                    const label = getConflictLabel(type as ConflictType)
                    return (
                      <HStack key={type} justify="space-between">
                        <Text fontSize="xs" color="fg.muted">
                          {label.text}
                        </Text>
                        <Badge size="sm" colorPalette="orange">
                          {count}
                        </Badge>
                      </HStack>
                    )
                  })}
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
                    <Icon as={WarningIcon} color="orange.500" />
                    <Text>Schedule Conflicts ({conflicts.length})</Text>
                  </HStack>
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <ScrollArea.Root maxH="500px" variant="hover">
                  <ScrollArea.Viewport>
                    <ScrollArea.Content>
                      <VStack align="stretch" gap={4}>
                        {conflicts.map((conflict, idx) => {
                          const label = getConflictLabel(conflict.type)

                          return (
                            <VStack
                              key={`${conflict.courseId}-${idx}`}
                              align="stretch"
                              gap={2}
                              p={4}
                              borderWidth="1px"
                              borderRadius="md"
                              bg="bg.subtle"
                            >
                              <HStack justify="space-between">
                                <Text fontSize="md" fontWeight="bold">
                                  {conflict.courseName}
                                </Text>
                                <Badge colorPalette="orange" size="sm">
                                  {label.text}
                                </Badge>
                              </HStack>

                              {conflict.details.length > 0 && (
                                <VStack align="stretch" gap={1.5} pl={2}>
                                  <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                                    {conflict.type === 'duplicate' && 'Duplicate sections:'}
                                    {conflict.type === 'overlap' && 'Conflicts with:'}
                                    {conflict.type === 'course-overlap' && 'Conflicts with:'}
                                    {conflict.type === 'duplicate-course' && 'You are enrolled in multiple sections:'}
                                    {conflict.type === 'missing-corequisite' && 'Missing corequisites:'}
                                    {conflict.type === 'missing-prerequisite' && 'Prerequisites not taken:'}
                                    {conflict.type === 'unavailable-overlap' && 'Time conflicts:'}
                                  </Text>
                                  {conflict.details.map((detail, detailIdx) => {
                                    // Missing prerequisites with OR/AND logic
                                    if (conflict.type === 'missing-prerequisite' && detail.isGroup && detail.courses) {
                                      return (
                                        <VStack key={detail.id} align="stretch" gap={3} pl={2}>
                                          {detailIdx > 0 && (
                                            <HStack justify="center" py={2}>
                                              <Badge
                                                colorPalette="red"
                                                size="sm"
                                                px={3}
                                                py={1}
                                                fontWeight="bold"
                                              >
                                                AND
                                              </Badge>
                                            </HStack>
                                          )}
                                          <VStack
                                            align="stretch"
                                            gap={2}
                                            p={3}
                                            borderWidth="2px"
                                            borderColor="border.emphasized"
                                            borderRadius="md"
                                            bg="bg"
                                          >
                                            {detail.courses.length > 1 && (
                                              <Text
                                                fontSize="xs"
                                                fontWeight="semibold"
                                                color="fg.muted"
                                                textTransform="uppercase"
                                                letterSpacing="wider"
                                              >
                                                Choose one of:
                                              </Text>
                                            )}
                                            <VStack align="stretch" gap={2}>
                                              {detail.courses.map((course, courseIdx) => (
                                                <VStack key={course.id} align="stretch" gap={1}>
                                                  {courseIdx > 0 && (
                                                    <HStack justify="center" py={1}>
                                                      <Text
                                                        fontSize="xs"
                                                        fontWeight="medium"
                                                        color="orange.500"
                                                        textTransform="uppercase"
                                                      >
                                                        or
                                                      </Text>
                                                    </HStack>
                                                  )}
                                                  <HStack
                                                    justify="space-between"
                                                    p={3}
                                                    borderWidth="1px"
                                                    borderRadius="md"
                                                    bg="bg.subtle"
                                                    gap={3}
                                                    _hover={{
                                                      bg: "bg.muted",
                                                      borderColor: "border.emphasized"
                                                    }}
                                                    transition="all 0.2s"
                                                  >
                                                    <Text fontSize="sm" fontWeight="semibold">
                                                      {course.name}
                                                    </Text>
                                                    <HStack gap={2}>
                                                      <Button
                                                        variant="solid"
                                                        size="xs"
                                                        colorPalette="green"
                                                        onClick={() => handleMarkAsTaken(course)}
                                                      >
                                                        <Icon as={CheckCircleIcon} />
                                                        Taken
                                                      </Button>
                                                      <Button
                                                        variant="solid"
                                                        size="xs"
                                                        colorPalette="blue"
                                                        onClick={() => {
                                                          handleCoreqClick(course.name)
                                                          setDialogOpen(false)
                                                        }}
                                                      >
                                                        <Icon as={ExternalLinkIcon} />
                                                        Add
                                                      </Button>
                                                    </HStack>
                                                  </HStack>
                                                </VStack>
                                              ))}
                                            </VStack>
                                          </VStack>
                                        </VStack>
                                      )
                                    }

                                    // Missing corequisites can be added to schedule
                                    if (conflict.type === 'missing-corequisite') {
                                      return (
                                        <HStack
                                          key={detail.id}
                                          justify="space-between"
                                          p={3}
                                          borderWidth="1px"
                                          borderRadius="md"
                                          bg="bg.subtle"
                                          _hover={{
                                            bg: "bg.muted",
                                            borderColor: "border.emphasized"
                                          }}
                                          transition="all 0.2s"
                                        >
                                          <Text fontSize="sm" fontWeight="semibold">
                                            {detail.name}
                                          </Text>
                                          <Button
                                            variant="solid"
                                            size="xs"
                                            colorPalette="blue"
                                            onClick={() => {
                                              handleCoreqClick(detail.name)
                                              setDialogOpen(false)
                                            }}
                                          >
                                            <Icon as={ExternalLinkIcon} />
                                            Add to Schedule
                                          </Button>
                                        </HStack>
                                      )
                                    }

                                    return (
                                      <HStack
                                        key={detail.id}
                                        pl={2}
                                        py={1}
                                      >
                                        <Text fontSize="sm" color="fg.muted">
                                          • {detail.name}
                                        </Text>
                                      </HStack>
                                    )
                                  })}
                                </VStack>
                              )}
                            </VStack>
                          )
                        })}
                      </VStack>
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


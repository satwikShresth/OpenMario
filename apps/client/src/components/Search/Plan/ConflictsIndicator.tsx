import { Button, Icon, Popover, Portal, VStack, Text, ScrollArea, HStack } from '@chakra-ui/react'
import { MdWarning } from 'react-icons/md'
import { useRefinementList } from 'react-instantsearch'
import { useSearch } from '@tanstack/react-router'
import type { ConflictType } from '@/stores/conflictsStore'
import { useConflicts } from '@/hooks/useConflicts'

export const ConflictsIndicator = () => {
  const { term: currentTerm, year: currentYear } = useSearch({ from: '/_search/plan' })
  const courseRefinement = useRefinementList({ attribute: 'course' })

  // Use the shared conflicts hook
  const { conflicts } = useConflicts(currentTerm, currentYear)

  // Handle clicking on a missing corequisite to add to search filters
  const handleCoreqClick = (courseId: string) => {
    courseRefinement.refine(courseId)
  }

  if (conflicts.length === 0) return null

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          colorPalette="orange"
          variant="subtle"
          size="xs"
        >
          <Icon as={MdWarning} />
          {conflicts.length} Conflicts
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content maxW="400px">
            <Popover.Arrow />
            <Popover.Body>
              <VStack align="stretch" gap={3}>
                <Text fontWeight="semibold" fontSize="sm">
                  Schedule Conflicts
                </Text>
                <ScrollArea.Root maxH="300px" variant="hover">
                  <ScrollArea.Viewport>
                    <ScrollArea.Content>
                      <VStack align="stretch" gap={3}>
                        {conflicts.map((conflict, idx) => {
                          const getConflictLabel = (type: ConflictType) => {
                            switch (type) {
                              case 'duplicate':
                                return { text: 'Duplicate Sections', color: 'orange.500' }
                              case 'overlap':
                                return { text: 'Time Overlap', color: 'red.500' }
                              case 'missing-corequisite':
                                return { text: 'Missing Corequisites', color: 'red.500' }
                              case 'unavailable-overlap':
                                return { text: 'Unavailable Time Conflict', color: 'yellow.600' }
                            }
                          }

                          const label = getConflictLabel(conflict.type)

                          return (
                            <VStack
                              key={`${conflict.courseId}-${idx}`}
                              align="stretch"
                              gap={1}
                              pb={idx < conflicts.length - 1 ? 3 : 0}
                              borderBottomWidth={idx < conflicts.length - 1 ? "1px" : "0"}
                            >
                              <HStack justify="space-between">
                                <Text fontSize="sm" fontWeight="semibold">
                                  {conflict.courseName}
                                </Text>
                                <Text fontSize="xs" color={label.color} fontWeight="medium">
                                  {label.text}
                                </Text>
                              </HStack>
                              <VStack align="stretch" gap={0.5} pl={3}>
                                {conflict.details.map((detail) => {
                                  // Only missing corequisites are clickable
                                  if (conflict.type === 'missing-corequisite') {
                                    return (
                                      <Button
                                        key={detail.id}
                                        variant="ghost"
                                        size="xs"
                                        justifyContent="start"
                                        fontSize="xs"
                                        color="fg.muted"
                                        _hover={{ color: "blue.500", textDecoration: "underline" }}
                                        onClick={() => handleCoreqClick(detail.name)}
                                        px={0}
                                        h="auto"
                                        minH="auto"
                                      >
                                        → {detail.name}
                                      </Button>
                                    )
                                  }

                                  return (
                                    <Text
                                      key={detail.id}
                                      fontSize="xs"
                                      color="fg.muted"
                                    >
                                      → {detail.name}
                                    </Text>
                                  )
                                })}
                              </VStack>
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
              </VStack>
            </Popover.Body>
            <Popover.CloseTrigger />
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}


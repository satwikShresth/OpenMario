import type { Dispatch, SetStateAction } from "react";
import { Button, CloseButton, Dialog, Portal, Text, VStack, HStack, Badge } from "@chakra-ui/react";

export type CourseInfo = {
  title?: string
  crn?: string
  days?: string
  startTime?: string
  endTime?: string
}

export type ConfirmDialogProps = {
  setDeleteDialogOpen: Dispatch<SetStateAction<boolean>>;
  deleteDialogOpen: boolean;
  handleConfirmDelete: () => void;
  handleCancelDelete: () => void;
  isCourseEvent?: boolean;
  courseInfo?: CourseInfo;
}


export function ConfirmDialog($props: ConfirmDialogProps) {
  return (
    <Dialog.Root
      role="alertdialog"
      open={$props.deleteDialogOpen}
      onOpenChange={(e: any) => $props.setDeleteDialogOpen(e.open)}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {$props.isCourseEvent ? 'Remove Course?' : 'Delete Unavailable Slot?'}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack align="stretch" gap={3}>
                {$props.isCourseEvent && $props.courseInfo ? (
                  <>
                    {$props.courseInfo.title && (
                      <Text fontWeight="semibold" fontSize="md">
                        {$props.courseInfo.title}
                      </Text>
                    )}
                    <HStack gap={2} flexWrap="wrap">
                      {$props.courseInfo.crn && (
                        <Badge size="sm" colorPalette="blue">
                          CRN: {$props.courseInfo.crn}
                        </Badge>
                      )}
                      {$props.courseInfo.days && (
                        <Badge size="sm" colorPalette="purple">
                          {$props.courseInfo.days}
                        </Badge>
                      )}
                      {$props.courseInfo.startTime && $props.courseInfo.endTime && (
                        <Badge size="sm" colorPalette="green">
                          {$props.courseInfo.startTime} - {$props.courseInfo.endTime}
                        </Badge>
                      )}
                    </HStack>
                    <Text color="fg.muted">
                      Are you sure you want to remove this course from your schedule? All meeting times will be removed.
                    </Text>
                  </>
                ) : (
                  <Text>
                    {$props.isCourseEvent
                      ? 'Are you sure you want to remove this course from your schedule? All meeting times will be removed.'
                      : 'Are you sure you want to delete this unavailable time slot?'
                    }
                  </Text>
                )}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" onClick={$props.handleCancelDelete}>
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button colorPalette="red" onClick={$props.handleConfirmDelete}>
                Delete
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

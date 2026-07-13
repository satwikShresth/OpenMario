import {
   Button,
   CloseButton,
   Dialog,
   Portal,
   Stack,
   Text,
} from '@chakra-ui/react'
import type { SalaryOffer } from '@/lib/salary-import'

type ImportSalaryDialogProps = {
   open: boolean
   offers: SalaryOffer[]
   onStart: () => void
   onDismiss: () => void
}

export function ImportSalaryDialog({
   open,
   offers,
   onStart,
   onDismiss,
}: ImportSalaryDialogProps) {
   const count = offers.length
   const preview = offers.slice(0, 3)

   return (
      <Dialog.Root
         open={open}
         // Don't wire onOpenChange→dismiss: parent sets open=false after Start,
         // and that would clear the queue before the form prefills.
         placement='center'
         closeOnInteractOutside={false}
      >
         <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
               <Dialog.Content maxW='md'>
                  <Dialog.Header>
                     <Dialog.Title>
                        {count === 1 ? 'Import salary report' : `Import ${count} salary reports`}
                     </Dialog.Title>
                     <Dialog.CloseTrigger asChild>
                        <CloseButton size='sm' onClick={onDismiss} />
                     </Dialog.CloseTrigger>
                  </Dialog.Header>
                  <Dialog.Body>
                     <Stack gap='3'>
                        <Text textStyle='sm' color='fg.muted'>
                           {count === 1
                              ? 'Review this AI-prefilled report, edit anything that looks off, then submit.'
                              : 'These reports were prepared for you. Review and submit them one at a time.'}
                        </Text>
                        <Stack gap='1' as='ul' pl='4' listStyleType='disc'>
                           {preview.map((o, i) => (
                              <Text as='li' key={`${o.company}-${o.position}-${i}`} textStyle='sm'>
                                 {o.company} — {o.position} ({o.compensation}/hr, {o.year})
                              </Text>
                           ))}
                           {count > 3 ? (
                              <Text as='li' textStyle='sm' color='fg.muted'>
                                 and {count - 3} more…
                              </Text>
                           ) : null}
                        </Stack>
                     </Stack>
                  </Dialog.Body>
                  <Dialog.Footer>
                     <Button variant='outline' onClick={onDismiss}>
                        Cancel
                     </Button>
                     <Button colorPalette='green' onClick={onStart} disabled={count === 0}>
                        {count === 1 ? 'Review & submit' : 'Start with first'}
                     </Button>
                  </Dialog.Footer>
               </Dialog.Content>
            </Dialog.Positioner>
         </Portal>
      </Dialog.Root>
   )
}

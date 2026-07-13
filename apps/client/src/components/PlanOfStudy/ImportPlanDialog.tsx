import {
   Button,
   Checkbox,
   CloseButton,
   Dialog,
   Field,
   Input,
   Portal,
   Stack,
   Text,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import {
   applyPlanFromLink,
   suggestPlanName,
   usePlanLibrary,
   type PlanLinkAction,
   type PlanOfStudy,
} from '@/lib/plan-of-study'
import { toaster } from '@/components/ui/toaster'

type ImportPlanDialogProps = {
   open: boolean
   plan: PlanOfStudy | null
   action: PlanLinkAction
   suggestedName?: string
   planId?: string
   onDismiss: () => void
}

export function ImportPlanDialog({
   open,
   plan,
   action,
   suggestedName,
   planId,
   onDismiss,
}: ImportPlanDialogProps) {
   const library = usePlanLibrary()
   const [name, setName] = useState('')
   const [openAsActive, setOpenAsActive] = useState(true)

   useEffect(() => {
      if (!open) return
      setName(suggestedName?.trim() || suggestPlanName(library.plans.length))
      setOpenAsActive(true)
   }, [open, suggestedName, library.plans.length])

   const handleImport = () => {
      if (!plan) return
      const trimmed = name.trim() || suggestPlanName(library.plans.length)
      const { result } = applyPlanFromLink({
         plan,
         action,
         name: trimmed,
         id: planId,
         setDefault: openAsActive,
      })

      toaster.create({
         title:
            result === 'created'
               ? 'Plan saved'
               : result === 'updated'
                 ? 'Plan updated'
                 : 'Plan replaced',
         description: openAsActive
            ? `"${trimmed}" is now open.`
            : `"${trimmed}" was saved without switching plans.`,
         type: 'success',
      })
      onDismiss()
   }

   return (
      <Dialog.Root
         open={open}
         onOpenChange={e => {
            if (!e.open) onDismiss()
         }}
         placement="center"
      >
         <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
               <Dialog.Content maxW="md">
                  <Dialog.Header>
                     <Dialog.Title>Import plan</Dialog.Title>
                     <Dialog.CloseTrigger asChild>
                        <CloseButton size="sm" />
                     </Dialog.CloseTrigger>
                  </Dialog.Header>
                  <Dialog.Body>
                     <Stack gap="4">
                        <Text textStyle="sm" color="fg.muted">
                           Name this plan, and choose whether to open it now or keep your
                           current plan active.
                        </Text>
                        <Field.Root>
                           <Field.Label>Plan name</Field.Label>
                           <Input
                              value={name}
                              onChange={e => setName(e.target.value)}
                              placeholder={suggestPlanName(library.plans.length)}
                              autoFocus
                              onKeyDown={e => {
                                 if (e.key === 'Enter') handleImport()
                              }}
                           />
                        </Field.Root>
                        <Checkbox.Root
                           checked={openAsActive}
                           onCheckedChange={e => setOpenAsActive(!!e.checked)}
                        >
                           <Checkbox.HiddenInput />
                           <Checkbox.Control>
                              <Checkbox.Indicator />
                           </Checkbox.Control>
                           <Checkbox.Label>Open this plan after importing</Checkbox.Label>
                        </Checkbox.Root>
                     </Stack>
                  </Dialog.Body>
                  <Dialog.Footer>
                     <Button variant="outline" onClick={onDismiss}>
                        Cancel
                     </Button>
                     <Button colorPalette="blue" onClick={handleImport} disabled={!plan}>
                        Import
                     </Button>
                  </Dialog.Footer>
               </Dialog.Content>
            </Dialog.Positioner>
         </Portal>
      </Dialog.Root>
   )
}

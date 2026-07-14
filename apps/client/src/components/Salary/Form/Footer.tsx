import { Button, HStack, Text } from '@chakra-ui/react'
import { defaultValues } from '@/helpers'
import type { withForm } from './context'
import { useEntityCreateBusy } from './entityCreateBusy'

export default (withForm: withForm) =>
   withForm({
      defaultValues,
      render: ({ form }) => {
         const { busy, label } = useEntityCreateBusy()

         return (
            <form.Subscribe
               selector={state => ({
                  canSubmit: state.canSubmit,
                  isSubmitting: state.isSubmitting,
                  isPristine: state.isPristine,
                  companyId: state.values.company_id,
                  positionId: state.values.position_id,
                  locationId: state.values.location_id,
               })}
            >
               {({
                  canSubmit,
                  isSubmitting,
                  isPristine,
                  companyId,
                  positionId,
                  locationId,
               }) => {
                  const idsReady = Boolean(companyId && positionId && locationId)
                  const submitDisabled =
                     isSubmitting || !canSubmit || busy || !idsReady

                  return (
                     <HStack gap={5} justify='space-between' width='full' flexWrap='wrap'>
                        <Button
                           type='reset'
                           colorPalette='red'
                           disabled={isSubmitting || isPristine || busy}
                           onClick={() => form.reset()}
                        >
                           Clear
                        </Button>

                        <HStack gap={3}>
                           {busy && label ? (
                              <Text textStyle='sm' color='fg.muted'>
                                 {label}
                              </Text>
                           ) : !idsReady ? (
                              <Text textStyle='sm' color='fg.muted'>
                                 Select or add company, position, and location
                              </Text>
                           ) : null}
                           <Button
                              type='submit'
                              colorPalette='green'
                              disabled={submitDisabled}
                              loading={isSubmitting || busy}
                              loadingText={busy ? (label ?? 'Creating…') : 'Submitting…'}
                              onClick={() => form.handleSubmit()}
                           >
                              Submit
                           </Button>
                        </HStack>
                     </HStack>
                  )
               }}
            </form.Subscribe>
         )
      },
   })

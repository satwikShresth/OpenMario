import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useEffectEvent, useState } from 'react'
import { z } from 'zod'
import { toaster } from '@/components/ui/toaster'
import { Salary } from '@/components/Salary'
import { ImportSalaryDialog } from '@/components/Salary/ImportSalaryDialog'
import type { SubmissionAggregate } from '@openmario/contracts'
import { useMutation } from '@tanstack/react-query'
import { orpc } from '@/helpers'
import { upsertSubmission } from '@/db/mutations'
import {
   advanceSalaryQueue,
   clearSalaryQueue,
   currentOffer,
   decodeSalaryBatch,
   readSalaryQueue,
   writeSalaryQueue,
   type SalaryOffer,
} from '@/lib/salary-import'

const searchSchema = z.object({
   salaries: z.string().optional(),
   idx: z.coerce.number().int().min(0).optional(),
})

export const Route = createFileRoute('/salary/_dialog/_form/report')({
   validateSearch: searchSchema,
   component: ReportSalaryPage,
})

function ReportSalaryPage() {
   const navigate = Route.useNavigate()
   const search = Route.useSearch()
   const submitMutation = useMutation(orpc.submission.create.mutationOptions())

   const [pendingOffers, setPendingOffers] = useState<SalaryOffer[] | null>(null)
   const [queueVersion, setQueueVersion] = useState(0)
   const queue = readSalaryQueue()
   const activeOffer = queue ? currentOffer(queue) : undefined

   const clearParams = useEffectEvent(() => {
      void navigate({
         to: '/salary/report',
         search: prev => ({
            ...prev,
            salaries: undefined,
            idx: undefined,
         }),
         replace: true,
      })
   })

   useEffect(() => {
      if (!search.salaries) return

      const batch = decodeSalaryBatch(search.salaries)
      if (!batch) {
         toaster.create({
            title: 'Invalid salary link',
            description: 'Could not read the shared salary payload.',
            type: 'error',
         })
         clearParams()
         return
      }

      const startIdx = Math.min(search.idx ?? 0, batch.offers.length - 1)
      if (batch.offers.length === 1) {
         writeSalaryQueue({ offers: batch.offers, idx: 0 })
         setPendingOffers(null)
         setQueueVersion(v => v + 1)
         clearParams()
         return
      }

      clearSalaryQueue()
      setPendingOffers(batch.offers.slice(startIdx))
      setQueueVersion(v => v + 1)
      clearParams()
   }, [search.salaries, search.idx])

   const goNextOrClose = () => {
      const next = advanceSalaryQueue()
      setQueueVersion(v => v + 1)
      if (next) {
         toaster.create({
            title: `Ready for salary ${next.idx + 1} of ${next.offers.length}`,
            type: 'info',
         })
         return
      }
      void navigate({ to: '/salary' })
   }

   const onSubmit = ({ value }: { value: SubmissionAggregate }) => {
      const submissionPromise = submitMutation
         .mutateAsync(value)
         .then(async ({ id, message }) => {
            console.log(message)
            await upsertSubmission({
               id,
               server_id: id,
               owner_id: null,
               status: 'synced',
               is_draft: false,
               company: value.company,
               company_id: value.company ?? null,
               position: value.position,
               position_id: value.position ?? null,
               location: value.location,
               location_city: null,
               location_state: null,
               location_state_code: null,
               year: value.year,
               coop_year: value.coop_year,
               coop_cycle: value.coop_cycle,
               program_level: value.program_level,
               work_hours: value.work_hours,
               compensation: value.compensation,
               other_compensation: value.other_compensation ?? null,
               details: value.details ?? null,
               synced_at: new Date().toISOString(),
            })
            goNextOrClose()
         })
         .catch(console.error)

      toaster.promise(submissionPromise, {
         success: {
            title: 'Successfully reported your salary!',
            description: 'Everything looks great',
         },
         error: {
            title: 'Failed to report your salary',
            description: 'Something wrong with the submission',
         },
         loading: { title: 'Reporting...', description: 'Please wait' },
      })
   }

   const handleStartQueue = () => {
      if (!pendingOffers?.length) return
      writeSalaryQueue({ offers: pendingOffers, idx: 0 })
      setPendingOffers(null)
      setQueueVersion(v => v + 1)
   }

   const handleDismissImport = () => {
      setPendingOffers(null)
      clearSalaryQueue()
      void navigate({ to: '/salary' })
   }

   // Force remount between queue items so defaults re-apply.
   void queueVersion

   return (
      <>
         {pendingOffers != null ? (
            <ImportSalaryDialog
               open
               offers={pendingOffers}
               onStart={handleStartQueue}
               onDismiss={handleDismissImport}
            />
         ) : (
            <Salary.Form
               key={queue ? `${queue.idx}-${queue.offers.length}` : 'blank'}
               defaultValues={activeOffer}
               onSubmit={onSubmit}
               queue={
                  queue && queue.offers.length > 1
                     ? {
                          index: queue.idx,
                          total: queue.offers.length,
                          onSkip: goNextOrClose,
                          onDismissQueue: () => {
                             clearSalaryQueue()
                             setQueueVersion(v => v + 1)
                             void navigate({ to: '/salary' })
                          },
                       }
                     : undefined
               }
            />
         )}
      </>
   )
}

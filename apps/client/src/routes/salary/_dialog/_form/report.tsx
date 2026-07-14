import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useEffectEvent, useState } from 'react'
import { z } from 'zod'
import { toaster } from '@/components/ui/toaster'
import { Salary } from '@/components/Salary'
import type { SubmissionAggregate } from '@openmario/contracts'
import { useMutation } from '@tanstack/react-query'
import { orpc } from '@/helpers'
import { upsertSubmission } from '@/db/mutations'
import {
   decodeSalaryBatch,
   salaryOfferToDraft,
   type SalaryOffer,
} from '@/lib/salary-import'

const searchSchema = z.object({
   salaries: z.string().optional(),
   idx: z.coerce.number().int().min(0).optional(),
})

export const Route = createFileRoute('/salary/_dialog/_form/report')({
   beforeLoad: () => ({ getLabel: () => 'Report Salary' }),
   validateSearch: searchSchema,
   component: ReportSalaryPage,
})

function ReportSalaryPage() {
   const navigate = Route.useNavigate()
   const search = Route.useSearch()
   const submitMutation = useMutation(orpc.submission.create.mutationOptions())

   const [importedOffer, setImportedOffer] = useState<SalaryOffer | undefined>()
   const [formKey, setFormKey] = useState(0)

   const clearParams = useEffectEvent(() => {
      void navigate({
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

      if (batch.offers.length === 1) {
         setImportedOffer(batch.offers[0])
         setFormKey(v => v + 1)
         toaster.create({
            type: 'success',
            title: 'Offer loaded',
            description: 'Review the form and submit when ready.',
         })
         clearParams()
         return
      }

      void (async () => {
         for (const offer of batch.offers) {
            await upsertSubmission(salaryOfferToDraft(offer))
         }
         toaster.create({
            type: 'success',
            title: `${batch.offers.length} offers saved as drafts`,
            description: 'Review and submit each draft when ready.',
         })
         clearParams()
         void navigate({ to: '/salary/drafts' })
      })()
   }, [search.salaries, navigate])

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
               company_id: value.company_id ?? null,
               position: value.position,
               position_id: value.position_id ?? null,
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
            void navigate({ to: '/salary' })
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

   return (
      <Salary.Form
         key={
            importedOffer
               ? `${formKey}:${importedOffer.company}:${importedOffer.position}:${importedOffer.location}`
               : `blank:${formKey}`
         }
         defaultValues={importedOffer}
         onSubmit={onSubmit}
      />
   )
}

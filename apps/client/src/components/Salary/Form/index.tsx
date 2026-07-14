import { Box, Separator, Text } from '@chakra-ui/react'
import { Suspense } from 'react'
import { defaultValues as overrideOption } from '@/helpers'
import { submissionSchema } from '@/routes/-validator.ts'
import { Fields } from './context'
import type { SubmissionAggregate } from '@openmario/contracts'
import { EntityCreateBusyProvider } from './entityCreateBusy'

export type FormProps = {
   defaultValues?: Partial<SubmissionAggregate> & {
      company_id?: string | null
      position_id?: string | null
      location_id?: string | null
   }
   onSubmit: ({ value }: { value: SubmissionAggregate }) => void
}

export const Form = ({ defaultValues, onSubmit }: FormProps) => {
   const form = Fields.useAppForm({
      defaultValues: {
         ...overrideOption,
         ...defaultValues,
         company_id: defaultValues?.company_id || '',
         position_id: defaultValues?.position_id || '',
         location_id: defaultValues?.location_id || '',
      },
      //@ts-ignore
      validators: { onSubmit: submissionSchema },
      onSubmit: ({ value }) => {
         onSubmit({
            value: {
               company: value.company,
               position: value.position,
               location: value.location,
               company_id: value.company_id!,
               position_id: value.position_id,
               location_id: value.location_id,
               work_hours: value.work_hours,
               compensation: value.compensation,
               other_compensation: value.other_compensation ?? '',
               details: value.details ?? '',
               year: value.year,
               coop_year: value.coop_year,
               coop_cycle: value.coop_cycle,
               program_level: value.program_level,
            },
         })
      },
   })

   return (
      <EntityCreateBusyProvider>
         <Box mt={2}>
            <Box>
               <Suspense fallback={<Text textStyle='sm'>Loading search…</Text>}>
                  <Fields.PositionFields form={form} />
                  <Box mt={2} />
                  <Fields.LocationProgramFields form={form} />
               </Suspense>
               <Text fontWeight='semibold' fontSize='lg' mt={8}>
                  Coop Details
               </Text>
               <Separator mt={2} mb={5} />
               <Fields.CoopDetailsFields form={form} />
               <Text fontWeight='semibold' fontSize='lg' mt={10}>
                  Compensation Details
               </Text>
               <Separator mt={2} />
               <Fields.CompensationFields form={form} />
               <Text fontWeight='semibold' fontSize='lg' mt={7}>
                  Other Details
               </Text>
               <Separator mt={2} mb={5} />
               <Fields.OtherDetailFields form={form} />
            </Box>
            <Box pt={4}>
               <Fields.Footer form={form} />
            </Box>
         </Box>
      </EntityCreateBusyProvider>
   )
}

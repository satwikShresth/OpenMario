import { Box, Button, Dialog, HStack, Separator, Text } from '@chakra-ui/react'
import { defaultValues as overrideOption } from '@/helpers'
import { submissionSchema } from '@/routes/-validator.ts'
import { Fields } from './context'
import type { SubmissionAggregate } from '@openmario/contracts'

export type FormProps = {
   defaultValues?: SubmissionAggregate
   onSubmit: ({ value }: { value: SubmissionAggregate }) => void
   queue?: {
      index: number
      total: number
      onSkip: () => void
      onDismissQueue: () => void
   }
}

export const Form = ({ defaultValues, onSubmit, queue }: FormProps) => {
   const form = Fields.useAppForm({
      defaultValues: { ...overrideOption, ...defaultValues! },
      //@ts-ignore: shuutp
      validators: { onSubmit: submissionSchema },
      onSubmit,
   })

   return (
      <Box mt={2}>
         {queue && queue.total > 1 ? (
            <HStack
               mb={4}
               px={3}
               py={2}
               rounded='md'
               bg='bg.subtle'
               justify='space-between'
               gap={3}
               flexWrap='wrap'
            >
               <Text textStyle='sm' fontWeight='medium'>
                  Salary {queue.index + 1} of {queue.total}
               </Text>
               <HStack gap={2}>
                  <Button size='sm' variant='ghost' onClick={queue.onDismissQueue}>
                     Discard queue
                  </Button>
                  <Button size='sm' variant='outline' onClick={queue.onSkip}>
                     Skip
                  </Button>
               </HStack>
            </HStack>
         ) : null}
         <Dialog.Body>
            {/*@ts-expect-error*/}
            <Fields.PositionFields form={form} />
            <Box mt={2} />
            {/*@ts-expect-error*/}
            <Fields.LocationProgramFields form={form} />
            <Text fontWeight='semibold' fontSize='lg' mt={8}>
               Coop Details
            </Text>
            <Separator mt={2} mb={5} />
            {/*@ts-expect-error*/}
            <Fields.CoopDetailsFields form={form} />
            <Text fontWeight='semibold' fontSize='lg' mt={10}>
               Compensation Details
            </Text>
            <Separator mt={2} />
            {/*@ts-expect-error*/}
            <Fields.CompensationFields form={form} />
            <Text fontWeight='semibold' fontSize='lg' mt={7}>
               Other Details
            </Text>
            <Separator mt={2} mb={5} />
            {/*@ts-expect-error*/}
            <Fields.OtherDetailFields form={form} />
         </Dialog.Body>
         <Dialog.Footer>
            {/*@ts-expect-error*/}
            <Fields.Footer form={form} />
         </Dialog.Footer>
      </Box>
   )
}

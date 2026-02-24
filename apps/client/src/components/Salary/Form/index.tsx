import { Box, Dialog, Separator, Text } from '@chakra-ui/react';
import { defaultValues as overrideOption } from '@/helpers';
import { submissionSchema } from '@/routes/-validator.ts';
import { Fields } from './context';
import type { SubmissionAggregate } from '@openmario/contracts';

export type FormProps = {
   defaultValues?: SubmissionAggregate;
   onSubmit: ({ value }: { value: SubmissionAggregate }) => void;
};

export const Form = ({ defaultValues, onSubmit }: FormProps) => {
   const form = Fields
      .useAppForm({
         defaultValues: { ...overrideOption, ...defaultValues! },
         //@ts-ignore: shuutp
         validators: { onSubmit: submissionSchema },
         onSubmit,
      });

   return (
      <Box mt={2}>
         <Dialog.Body>
            {/*@ts-expect-error*/}
            <Fields.PositionFields form={form} />
            <Box mt={2} />
            {/*@ts-expect-error*/}
            <Fields.LocationProgramFields form={form} />
            <Text fontWeight='semibold' fontSize='lg' mt={8}>Coop Details</Text>
            <Separator mt={2} mb={5} />
            {/*@ts-expect-error*/}
            <Fields.CoopDetailsFields form={form} />
            <Text fontWeight='semibold' fontSize='lg' mt={10}>Compensation Details</Text>
            <Separator mt={2} />
            {/*@ts-expect-error*/}
            <Fields.CompensationFields form={form} />
            <Text fontWeight='semibold' fontSize='lg' mt={7}>Other Details</Text>
            <Separator mt={2} mb={5} />
            {/*@ts-expect-error*/}
            <Fields.OtherDetailFields form={form} />
         </Dialog.Body>
         <Dialog.Footer>
            {/*@ts-expect-error*/}
            <Fields.Footer form={form} />
         </Dialog.Footer>
      </Box>
   );
};

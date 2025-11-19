import { Box, Dialog, Separator, Text } from '@chakra-ui/react';
import { defaultValues as overrideOption } from '@/helpers';
import { submissionSchema } from '@/routes/-validator.ts';
import { Fields } from './context';
import type { SubmissionAggregate } from '@/client';

export type FormProps = {
   defaultValues?: SubmissionAggregate;
   onSubmit: ({ value }: { value: SubmissionAggregate }) => void;
};

export const Form = ({ defaultValues, onSubmit }: FormProps) => {
   const form = Fields
      .useAppForm({
         defaultValues: defaultValues || overrideOption,
         //@ts-ignore: shuutp
         validators: { onSubmit: submissionSchema },
         onSubmit,
      });

   return (
      <Box mt={2}>
         <Dialog.Body>
            <Fields.PositionFields form={form} />
            <Box mt={2} />
            <Fields.LocationProgramFields form={form} />
            <Text fontWeight='semibold' fontSize='lg' mt={8}>Coop Details</Text>
            <Separator mt={2} mb={5} />
            <Fields.CoopDetailsFields form={form} />
            <Text fontWeight='semibold' fontSize='lg' mt={10}>Compensation Details</Text>
            <Separator mt={2} />
            <Fields.CompensationFields form={form} />
            <Text fontWeight='semibold' fontSize='lg' mt={7}>Other Details</Text>
            <Separator mt={2} mb={5} />
            <Fields.OtherDetailFields form={form} />
         </Dialog.Body>
         <Dialog.Footer>
            <Fields.Footer form={form} />
         </Dialog.Footer>
      </Box>
   );
};

import { Box, Dialog, Separator, Text } from '@chakra-ui/react';
import { defaultValues as overrideOption } from '@/components/Salary/Form/helpers';
import { submissionSchema } from '@/routes/-validator.ts';
import { useSalaryStore } from '@/components/Salary';
import { Fields } from '@/components/Salary/Form/Fields';

export type FormProps =
   | { isSubmitted?: true; idx?: string }
   | { isSubmitted?: false; idx?: number };

export const Form = ({ isSubmitted = false, idx }: FormProps) => {
   const defaultOption = isSubmitted === true
      ? useSalaryStore((state) => state.submissions.get(idx! as string))
      : useSalaryStore((state) =>
         idx &&
         state.draftSubmissions.length > (idx as number) &&
         state.draftSubmissions[idx as number]
      );

   const form = Fields
      .useAppForm({
         defaultValues: defaultOption || overrideOption,
         validators: { onChange: submissionSchema },
         onSubmit: async ({ value }) => {
            console.log(value);
         },
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

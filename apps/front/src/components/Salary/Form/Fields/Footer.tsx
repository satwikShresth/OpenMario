import { Button, HStack } from '@chakra-ui/react';
import { defaultValues } from '../helpers.ts';
import type { withForm } from './index.tsx';

export default (withForm: withForm) =>
   withForm({
      defaultValues,
      render: ({ form }) => {
         return (
            <form.Subscribe
               selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
            >
               {([canSubmit, isSubmitting, isPristine]) => (
                  <HStack gap={5} justify='space-between'>
                     <Button
                        type='reset'
                        colorPalette='red'
                        disabled={isSubmitting || isPristine}
                        onClick={() => form.reset()}
                     >
                        Clear
                     </Button>

                     <Button
                        type='submit'
                        colorPalette='green'
                        disabled={isSubmitting || isPristine || !canSubmit}
                        loading={isSubmitting}
                        loadingText='Submiting...'
                        onClick={() => form.handleSubmit()}
                     >
                        Submit
                     </Button>
                  </HStack>
               )}
            </form.Subscribe>
         );
      },
   });

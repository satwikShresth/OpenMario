import {
   Button,
   CloseButton,
   Dialog,
   Field,
   Input,
   Portal,
   Textarea,
   VStack,
   useDialog,
} from '@chakra-ui/react';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { toaster } from '@/components/ui/toaster';
import { env } from '@env';

type FeedbackData = {
   name: string;
   email: string;
   message: string;
};


const sendFeedbackToDiscord = async (data: FeedbackData) => {
   const embed = {
      title: 'New Feedback Received',
      color: 0x5865F2, // Discord blurple color
      fields: [
         {
            name: 'Name',
            value: data.name || 'Anonymous',
            inline: true
         },
         {
            name: 'Email',
            value: data.email || 'Not provided',
            inline: true
         },
         {
            name: 'Message',
            value: data.message
         }
      ],
      timestamp: new Date().toISOString(),
      footer: {
         text: 'OpenMario Feedback'
      }
   };

   const response = await fetch(env.VITE_DISCORD_WEBHOOK, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
         embeds: [embed]
      })
   });

   if (!response.ok) {
      throw new Error('Failed to send feedback');
   }

   return response;
};

export function FeedbackDialog() {
   const dialog = useDialog();

   const mutation = useMutation({
      mutationFn: sendFeedbackToDiscord,
      onSuccess: () => {
         toaster.create({
            title: 'Feedback sent!',
            description: 'Thank you for your feedback.',
            type: 'success',
            duration: 3000,
         });

         // Reset form and close dialog
         form.reset();
         dialog.setOpen(false);
      },
      onError: (error) => {
         toaster.create({
            title: 'Failed to send feedback',
            description: error instanceof Error ? error.message : 'Please try again later.',
            type: 'error',
            duration: 5000,
         });
      }
   });

   const form = useForm({
      defaultValues: {
         name: '',
         email: '',
         message: '',
      },
      onSubmit: async ({ value }) => {
         mutation.mutate(value);
      },
   });

   return (
      <Dialog.RootProvider value={dialog}>
         <Dialog.Root
            size='md'
            placement='center'
            closeOnInteractOutside={false}
            motionPreset='slide-in-bottom'
         >
            <Dialog.Trigger asChild>
               <Button
                  variant='ghost'
                  _hover={{ color: 'accent' }}
                  borderRadius='lg'
               >
                  Feedback
               </Button>
            </Dialog.Trigger>
            <Portal>
               <Dialog.Backdrop />
               <Dialog.Positioner>
                  <Dialog.Content>
                     <Dialog.Header>
                        <Dialog.Title>Send Feedback</Dialog.Title>
                     </Dialog.Header>
                     <Dialog.Body>
                        <form
                           onSubmit={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              form.handleSubmit();
                           }}
                           id='feedback-form'
                        >
                           <VStack gap={4} align='stretch'>
                              <form.Field name='name'>
                                 {(field) => (
                                    <Field.Root>
                                       <Field.Label>Name</Field.Label>
                                       <Input
                                          value={field.state.value}
                                          onBlur={field.handleBlur}
                                          onChange={(e) => field.handleChange(e.target.value)}
                                          placeholder='Your name'
                                       />
                                    </Field.Root>
                                 )}
                              </form.Field>

                              <form.Field name='email'>
                                 {(field) => (
                                    <Field.Root>
                                       <Field.Label>Email</Field.Label>
                                       <Input
                                          type='email'
                                          value={field.state.value}
                                          onBlur={field.handleBlur}
                                          onChange={(e) => field.handleChange(e.target.value)}
                                          placeholder='your.email@example.com'
                                       />
                                    </Field.Root>
                                 )}
                              </form.Field>

                              <form.Field
                                 name='message'
                                 validators={{
                                    onChange: ({ value }) =>
                                       !value || value.trim().length === 0
                                          ? 'Feedback message is required'
                                          : undefined,
                                 }}
                              >
                                 {(field) => (
                                    <Field.Root required>
                                       <Field.Label>Feedback</Field.Label>
                                       <Textarea
                                          value={field.state.value}
                                          onBlur={field.handleBlur}
                                          onChange={(e) => field.handleChange(e.target.value)}
                                          placeholder='Tell us what you think...'
                                          rows={5}
                                          required
                                       />
                                       {field.state.meta.errors.length > 0 && (
                                          <Field.ErrorText>
                                             {field.state.meta.errors[0]}
                                          </Field.ErrorText>
                                       )}
                                    </Field.Root>
                                 )}
                              </form.Field>
                           </VStack>
                        </form>
                     </Dialog.Body>
                     <Dialog.Footer gap={3}>
                        <Dialog.ActionTrigger asChild>
                           <Button variant='outline'>Cancel</Button>
                        </Dialog.ActionTrigger>
                        <form.Subscribe
                           selector={(state) => [state.canSubmit, state.isSubmitting]}
                        >
                           {([canSubmit, isSubmitting]) => (
                              <Button
                                 type='submit'
                                 form='feedback-form'
                                 colorPalette='blue'
                                 loading={mutation.isPending || isSubmitting}
                                 disabled={!canSubmit || mutation.isPending}
                              >
                                 Send Feedback
                              </Button>
                           )}
                        </form.Subscribe>
                     </Dialog.Footer>
                     <Dialog.CloseTrigger asChild>
                        <CloseButton size='sm' />
                     </Dialog.CloseTrigger>
                  </Dialog.Content>
               </Dialog.Positioner>
            </Portal>
         </Dialog.Root>
      </Dialog.RootProvider>
   );
}


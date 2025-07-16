import { createFileRoute } from '@tanstack/react-router';
import { CloseButton, Dialog } from '@chakra-ui/react';

export const Route = createFileRoute('/salary/_dialog/drafts')({
   component: () => (
      <>
         <Dialog.Header>
            <Dialog.Title>Dialog Title</Dialog.Title>
            <Dialog.CloseTrigger asChild p={2} m={3}>
               <CloseButton size='sm' variant='solid' />
            </Dialog.CloseTrigger>
         </Dialog.Header>
         <Dialog.Body>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
         </Dialog.Body>
      </>
   ),
});


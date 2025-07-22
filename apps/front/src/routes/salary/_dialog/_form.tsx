import { createFileRoute } from '@tanstack/react-router';
import { Box, CloseButton, Dialog } from '@chakra-ui/react';
import { Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/salary/_dialog/_form')({
   component: () => (
      <Box>
         <Dialog.Header>
            <Dialog.Title fontWeight='bold' fontSize='2xl'>Report Salary</Dialog.Title>
            <Dialog.CloseTrigger m={2} asChild>
               <CloseButton size='sm' variant='surface' />
            </Dialog.CloseTrigger>
         </Dialog.Header>
         <Outlet />
      </Box>
   ),
});

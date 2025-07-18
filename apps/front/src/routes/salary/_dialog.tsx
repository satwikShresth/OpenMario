import { createFileRoute } from '@tanstack/react-router';
import { Box, Dialog, Portal } from '@chakra-ui/react';
import { useSalaryStore } from '@/components/Salary';
import { Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/salary/_dialog')({
   component: () => {
      const Route = useSalaryStore(({ Route }) => Route);
      const navigate = Route.useNavigate();
      return (
         <Dialog.Root
            open
            onOpenChange={() => navigate({ to: `/salary` })}
            size='xl'
            placement='top'
            closeOnInteractOutside={false}
            motionPreset='slide-in-bottom'
         >
            <Portal>
               <Dialog.Backdrop />
               <Dialog.Positioner>
                  <Dialog.Content>
                     <Box p={2} m={3}>
                        <Outlet />
                     </Box>
                  </Dialog.Content>
               </Dialog.Positioner>
            </Portal>
         </Dialog.Root>
      );
   },
});

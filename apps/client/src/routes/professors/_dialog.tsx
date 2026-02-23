import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Dialog, Portal } from '@chakra-ui/react';

export const Route = createFileRoute('/professors/_dialog')({
   component: () => {
      const navigate = Route.useNavigate();
      return (
         <Dialog.Root
            open
            onOpenChange={() => navigate({ to: '/professors' })}
            size='xl'
            placement='top'
            closeOnInteractOutside
            motionPreset='slide-in-bottom'
         >
            <Portal>
               <Dialog.Backdrop />
               <Dialog.Positioner>
                  <Dialog.Content p={5}>
                     <Outlet />
                  </Dialog.Content>
               </Dialog.Positioner>
            </Portal>
         </Dialog.Root>
      );
   },
});

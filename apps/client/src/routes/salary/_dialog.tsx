import { Outlet, createFileRoute } from '@tanstack/react-router';
import { Dialog, Portal } from '@chakra-ui/react';

export const Route = createFileRoute('/salary/_dialog')({
   component: () => {
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
                  <Dialog.Content p={5}>
                     <Outlet />
                  </Dialog.Content>
               </Dialog.Positioner>
            </Portal>
         </Dialog.Root>
      );
   },
});

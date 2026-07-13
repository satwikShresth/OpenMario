import { Outlet, createFileRoute } from '@tanstack/react-router';
import { Dialog, Portal } from '@chakra-ui/react';

export const Route = createFileRoute('/salary/_dialog')({
   component: () => {
      const navigate = Route.useNavigate();
      return (
         <Dialog.Root
            open
            onOpenChange={e => {
               if (!e.open) {
                  void navigate({
                     to: '/salary',
                     search: prev => prev,
                  });
               }
            }}
            size='xl'
            placement='center'
            scrollBehavior='inside'
            closeOnInteractOutside={false}
            motionPreset='slide-in-bottom'
         >
            <Portal>
               <Dialog.Backdrop />
               <Dialog.Positioner>
                  <Dialog.Content p={5} maxH='90dvh'>
                     <Outlet />
                  </Dialog.Content>
               </Dialog.Positioner>
            </Portal>
         </Dialog.Root>
      );
   },
});

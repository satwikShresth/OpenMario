import { Drawer, IconButton, useBreakpointValue } from '@chakra-ui/react';
import Fields from './Fields';
import { HiX } from 'react-icons/hi';
import type { SalaryRoute } from '@/routes/salary';

interface FilterDrawerProps {
   open: boolean;
   Route: SalaryRoute;
   onClose: () => void;
}

export default ({
   Route,
   open,
   onClose,
}: FilterDrawerProps) => {
   const isMobile = useBreakpointValue({ base: true, md: false });

   if (!isMobile) {
      return <Fields Route={Route} />;
   }

   return (
      <Drawer.Root open={open} onOpenChange={onClose} placement='start'>
         <Drawer.Backdrop />
         <Drawer.Positioner>
            <Drawer.Content>
               <Drawer.Header>
                  <Drawer.Title>Filters</Drawer.Title>
                  <Drawer.CloseTrigger asChild>
                     <IconButton variant='outline' size='sm'>
                        <HiX />
                     </IconButton>
                  </Drawer.CloseTrigger>
               </Drawer.Header>
               <Drawer.Body>
                  <Fields Route={Route} />
               </Drawer.Body>
            </Drawer.Content>
         </Drawer.Positioner>
      </Drawer.Root>
   );
};

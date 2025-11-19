import { Drawer, IconButton } from '@chakra-ui/react';
import { useMobile } from '@/hooks';
import Fields from './Fields';
import { HiX } from 'react-icons/hi';

interface FilterDrawerProps {
   open: boolean;
   onClose: () => void;
}

export default ({
   open,
   onClose,
}: FilterDrawerProps) => {
   const isMobile = useMobile();

   if (!isMobile) {
      return <Fields />;
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
                  <Fields />
               </Drawer.Body>
            </Drawer.Content>
         </Drawer.Positioner>
      </Drawer.Root>
   );
};

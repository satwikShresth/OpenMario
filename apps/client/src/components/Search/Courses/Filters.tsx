import { Box, Drawer, IconButton, Separator, Text } from '@chakra-ui/react';
import { RefinementCheckbox } from '../index.tsx';
import { CloseIcon } from '@/components/icons';
import { useMobile } from '@/hooks';

interface FilterDrawerProps {
   open: boolean;
   onClose: () => void;
}

export const Filters = ({
   open,
   onClose,
}: FilterDrawerProps) => {
   const isMobile = useMobile();

   if (!isMobile) {
      return (
         <Box
            maxW='330px'
            p={2}
            px={3}
            height='fit-content'
            position='sticky'
            top={0}
            zIndex={1}
            borderWidth='thin'
            borderRadius='lg'
         >
            <Text pt={2} px={2} fontSize='xl' fontWeight='bold'>Filters</Text>
            <Separator mx={2} mt={1} />
            <RefinementCheckbox attribute='days' />
            <RefinementCheckbox attribute='instruction_type' />
            <RefinementCheckbox attribute='subject_name' />
            <RefinementCheckbox attribute='college_name' />
            <RefinementCheckbox attribute='instruction_method' />
            <RefinementCheckbox attribute='instructors.name' />
            <RefinementCheckbox attribute='instructors.department' />
         </Box>
      );
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
                        <CloseIcon />
                     </IconButton>
                  </Drawer.CloseTrigger>
               </Drawer.Header>
               <Drawer.Body>
                  <RefinementCheckbox attribute='days' />
                  <RefinementCheckbox attribute='instruction_type' />
                  <RefinementCheckbox attribute='subject_name' />
                  <RefinementCheckbox attribute='college_name' />
                  <RefinementCheckbox attribute='instruction_method' />
                  <RefinementCheckbox attribute='instructors.name' />
                  <RefinementCheckbox attribute='instructors.department' />
               </Drawer.Body>
            </Drawer.Content>
         </Drawer.Positioner>
      </Drawer.Root>
   );
};

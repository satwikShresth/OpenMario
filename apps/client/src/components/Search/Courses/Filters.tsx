import { Box, Drawer, IconButton, ScrollArea, Separator, Text } from '@chakra-ui/react';
import { RefinementCheckbox } from '../index.tsx';
import { CloseIcon } from '@/components/icons';
import { useMobile } from '@/hooks';

interface FilterDrawerProps {
   open: boolean;
   onClose: () => void;
}

const FilterContent = () => (
   <>
      <RefinementCheckbox attribute='days' />
      <RefinementCheckbox attribute='instruction_type' />
      <RefinementCheckbox attribute='subject_name' />
      <RefinementCheckbox attribute='college_name' />
      <RefinementCheckbox attribute='instruction_method' />
      <RefinementCheckbox attribute='instructors.name' />
      <RefinementCheckbox attribute='instructors.department' />
   </>
);

export const Filters = ({
   open,
   onClose,
}: FilterDrawerProps) => {
   const isMobile = useMobile();

   if (!isMobile) {
      return (
         <Box
            maxW='330px'
            position='sticky'
            top={4}
            zIndex={1}
            borderWidth='2px'
            borderColor='border'
            borderRadius='xl'
            maxHeight='calc(100vh - 2rem)'
            display='flex'
            flexDirection='column'
            overflow='hidden'
         >
            <Text pt={3} px={3} pb={2} fontSize='xl' fontWeight='bold' flexShrink={0}>
               Filters
            </Text>
            <Separator flexShrink={0} />
            <ScrollArea.Root flex='1' overflow='hidden'>
               <ScrollArea.Viewport>
                  <ScrollArea.Content p={2} px={3}>
                     <FilterContent />
                  </ScrollArea.Content>
               </ScrollArea.Viewport>
               <ScrollArea.Scrollbar orientation='vertical'>
                  <ScrollArea.Thumb />
               </ScrollArea.Scrollbar>
            </ScrollArea.Root>
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
                  <FilterContent />
               </Drawer.Body>
            </Drawer.Content>
         </Drawer.Positioner>
      </Drawer.Root>
   );
};

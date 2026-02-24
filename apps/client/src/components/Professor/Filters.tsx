import { Box, Drawer, IconButton, ScrollArea, Separator, Text } from '@chakra-ui/react';
import { RefinementCheckbox } from '@/components/Search/refinements/RefinementCheckbox';
import { NumericFilter } from '@/components/Search/refinements/NumericFilter';
import { CloseIcon } from '@/components/icons';
import { useMobile } from '@/hooks';

interface FilterDrawerProps {
   open: boolean;
   onClose: () => void;
}

const FilterContent = () => (
   <>
      <NumericFilter
         attribute='avg_rating'
         label='Avg Rating'
         items={[
            { label: 'Any' },
            { label: '3.0+', start: 3 },
            { label: '3.5+', start: 3.5 },
            { label: '4.0+', start: 4 },
            { label: '4.5+', start: 4.5 },
         ]}
      />
      <NumericFilter
         attribute='avg_difficulty'
         label='Avg Difficulty'
         items={[
            { label: 'Any' },
            { label: 'Easy (≤ 2.0)', end: 2 },
            { label: 'Moderate (2–3)', start: 2, end: 3 },
            { label: 'Hard (3–4)', start: 3, end: 4 },
            { label: 'Very Hard (4+)', start: 4 },
         ]}
      />
      <RefinementCheckbox attribute='department' />
      <RefinementCheckbox attribute='subjects_taught' />
      <RefinementCheckbox attribute='instruction_methods' />
   </>
);

export const Filters = ({ open, onClose }: FilterDrawerProps) => {
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

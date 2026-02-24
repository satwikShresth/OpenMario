import { Box, Drawer, IconButton, ScrollArea, Separator, Text } from '@chakra-ui/react';
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
         attribute='avg_compensation'
         label='Avg Compensation'
         items={[
            { label: 'Any' },
            { label: 'Under $20/hr', end: 20 },
            { label: '$20 – $30/hr', start: 20, end: 30 },
            { label: '$30 – $40/hr', start: 30, end: 40 },
            { label: '$40+/hr', start: 40 },
         ]}
      />
      <NumericFilter
         attribute='pct_would_recommend'
         label='% Would Recommend'
         items={[
            { label: 'Any' },
            { label: '50%+', start: 50 },
            { label: '75%+', start: 75 },
            { label: '90%+', start: 90 },
         ]}
      />
      <NumericFilter
         attribute='omega_score'
         label='Omega Score'
         items={[
            { label: 'Any' },
            { label: '25+', start: 25 },
            { label: '50+', start: 50 },
            { label: '75+', start: 75 },
         ]}
      />
      <NumericFilter
         attribute='total_reviews'
         label='Total Reviews'
         items={[
            { label: 'Any' },
            { label: '5+', start: 5 },
            { label: '10+', start: 10 },
            { label: '25+', start: 25 },
            { label: '50+', start: 50 },
         ]}
      />
      <NumericFilter
         attribute='avg_days_per_week'
         label='Avg Days / Week'
         items={[
            { label: 'Any' },
            { label: 'Up to 4 days', end: 4 },
            { label: '4 – 5 days', start: 4, end: 5 },
            { label: '5 days', start: 5 },
         ]}
      />
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

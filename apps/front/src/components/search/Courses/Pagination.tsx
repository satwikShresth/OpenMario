import { useHitsPerPage, usePagination } from 'react-instantsearch';
import { useMemo } from 'react';
import {
   ButtonGroup,
   createListCollection,
   HStack,
   IconButton,
   Pagination as CPagination,
   Portal,
   Select,
   Text,
} from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

export const Pagination = () => {
   const instantPagination = usePagination();
   const hitsPerPage = useHitsPerPage({ items: pageSizes.items });
   const currentValue = useMemo(
      () => hitsPerPage.items.find(({ isRefined }) => isRefined)?.label!,
      [hitsPerPage.items],
   );

   return (
      <HStack mt='3' justifySelf='center'>
         <Select.Root
            collection={pageSizes}
            defaultValue={['5']}
            value={[currentValue]}
            onValueChange={({ value }) => hitsPerPage.refine(parseInt(value[0]))}
            width='80px'
         >
            <Select.HiddenSelect />
            <Select.Control>
               <Select.Trigger>
                  <Select.ValueText>
                     <Text ml={2}>{currentValue}</Text>
                  </Select.ValueText>
               </Select.Trigger>
               <Select.IndicatorGroup>
                  <Select.Indicator />
               </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
               <Select.Positioner>
                  <Select.Content>
                     {pageSizes.items.map((page) => (
                        <Select.Item item={page} key={page.value}>
                           {page.label}
                           <Select.ItemIndicator />
                        </Select.Item>
                     ))}
                  </Select.Content>
               </Select.Positioner>
            </Portal>
         </Select.Root>
         <CPagination.Root
            page={instantPagination.currentRefinement}
            count={instantPagination.nbHits}
            pageSize={parseInt(currentValue)}
            onPageChange={({ page }) => instantPagination.refine(page)}
            siblingCount={3}
         >
            <ButtonGroup variant='ghost' size='sm'>
               <CPagination.PrevTrigger asChild>
                  <IconButton>
                     <LuChevronLeft />
                  </IconButton>
               </CPagination.PrevTrigger>

               <CPagination.Items
                  render={(page) => (
                     <IconButton variant={{ base: 'ghost', _selected: 'outline' }}>
                        {page.value}
                     </IconButton>
                  )}
               />

               <CPagination.NextTrigger asChild>
                  <IconButton>
                     <LuChevronRight />
                  </IconButton>
               </CPagination.NextTrigger>
            </ButtonGroup>
         </CPagination.Root>
      </HStack>
   );
};

const pageSizes = createListCollection({
   items: [5, 10, 15, 20, 25, 30].map((value) => ({
      default: value === 10,
      label: String(value),
      value,
   })),
});

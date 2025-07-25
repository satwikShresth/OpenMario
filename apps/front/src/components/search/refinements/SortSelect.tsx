import { type ListCollection, Portal, Select } from '@chakra-ui/react';
import { useSortBy } from 'react-instantsearch';
import { useMobile } from '@/hooks/useMobile.ts';

type SortSelectProps = {
   sortBy: ListCollection<{
      label: string;
      value: string;
   }>;
};
export const SortSelect = ({ sortBy }: SortSelectProps) => {
   const sort = useSortBy({ items: sortBy.items });
   const isMobile = useMobile();

   return (
      <Select.Root
         collection={sortBy}
         maxW='300px'
         minW='150px'
         value={[sort.currentRefinement]}
         onValueChange={(e) => sort.refine(e.value[0])}
      >
         <Select.HiddenSelect />
         {!isMobile ? <Select.Label>Sort</Select.Label> : null}
         <Select.Control>
            <Select.Trigger>
               <Select.ValueText />
            </Select.Trigger>
            <Select.IndicatorGroup>
               <Select.Indicator />
            </Select.IndicatorGroup>
         </Select.Control>
         <Portal>
            <Select.Positioner>
               <Select.Content>
                  {sortBy.items.map((sorting) => (
                     <Select.Item item={sorting} key={sorting.value}>
                        {sorting.label}
                        <Select.ItemIndicator />
                     </Select.Item>
                  ))}
               </Select.Content>
            </Select.Positioner>
         </Portal>
      </Select.Root>
   );
};

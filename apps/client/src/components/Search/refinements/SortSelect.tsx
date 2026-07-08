import { type ListCollection, Portal, Select } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useSortBy } from 'react-instantsearch';

type SortSelectProps = {
   sortBy: ListCollection<{
      label: string;
      value: string;
   }>;
   syncIndex?: string;
};
export const SortSelect = ({ sortBy, syncIndex }: SortSelectProps) => {
   const sort = useSortBy({ items: sortBy.items });

   useEffect(() => {
      if (syncIndex && sort.currentRefinement !== syncIndex) {
         sort.refine(syncIndex);
      }
   }, [syncIndex]);

   return (
      <Select.Root
         collection={sortBy}
         maxW='200px'
         minW='150px'
         value={[sort.currentRefinement]}
         onValueChange={(e) => sort.refine(e.value![0]!)}
      >
         <Select.HiddenSelect />
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

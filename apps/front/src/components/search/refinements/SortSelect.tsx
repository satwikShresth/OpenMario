import { createListCollection, Portal, Select } from '@chakra-ui/react';
import { useSortBy } from 'react-instantsearch';

export const SortSelect = () => {
   const sort = useSortBy({ items: sortBy.items });

   return (
      <Select.Root
         collection={sortBy}
         maxW='320px'
         value={[sort.currentRefinement]}
         onValueChange={(e) => sort.refine(e.value[0])}
      >
         <Select.HiddenSelect />
         <Select.Label>Sort</Select.Label>
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

const sortBy = createListCollection({
   items: [
      { label: 'Most Relevant', value: 'sections' },
      {
         label: 'Course Number (Low to High)',
         value: 'sections:course_number:asc',
      },
      {
         label: 'Course Number (High to Low)',
         value: 'sections:course_number:desc',
      },
      {
         label: 'Credits (Highest)',
         value: 'sections:credits:desc',
      },
      {
         label: 'Credits (Lowest)',
         value: 'sections:credits:asc',
      },
      {
         label: 'Start Time (Earliest)',
         value: 'sections:start_time:asc',
      },
      {
         label: 'Start Time (Latest)',
         value: 'sections:start_time:desc',
      },
      {
         label: 'Instructor Rating (Highest)',
         value: 'sections:instructors.avg_rating:desc',
      },
   ],
});

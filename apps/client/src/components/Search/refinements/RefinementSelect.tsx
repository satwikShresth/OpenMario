import { useRefinementList } from 'react-instantsearch';
import { useCallback, useEffect, useMemo } from 'react';
import {
   Badge,
   Box,
   Combobox,
   type ComboboxRootProviderProps,
   Highlight,
   HStack,
   Portal,
   useCombobox,
   useComboboxContext,
   useListCollection,
} from '@chakra-ui/react';
import { capitalizeWords } from '@/helpers';

type RefinementItem = {
   label: string;
   value: string;
   count: number;
   isRefined: boolean;
   highlighted?: string;
};

type RefinementSelectProps = {
   attribute: string;
   formatLabel?: (value: string) => string;
} & Partial<ComboboxRootProviderProps>;

export const RefinementSelect = ({
   attribute,
   formatLabel,
   ...props
}: RefinementSelectProps) => {
   const refinements = useRefinementList({ attribute, limit: 25 });

   const displayItems = useMemo<RefinementItem[]>(
      () =>
         refinements.items.map((item) => ({
            ...item,
            label: formatLabel?.(item.value) ?? item.label,
         })),
      [formatLabel, refinements.items],
   );

   const ComboboxItem = useCallback(
      ({ item }: { item: RefinementItem }) => {
         const combobox = useComboboxContext();
         return (
            <Combobox.Item
               item={item}
               key={item.value}
               onClick={() => refinements.refine(item.value)}
            >
               <Combobox.ItemText>
                  <HStack width='full' justify='space-between'>
                     <Box>
                        <Highlight
                           ignoreCase
                           query={combobox.inputValue.split(' ')}
                           styles={{ bg: 'yellow.emphasized', fontWeight: 'medium' }}
                        >
                           {item.label}
                        </Highlight>
                     </Box>
                     <Badge size='md' variant='outline' ml={3}>{item.count}</Badge>
                  </HStack>
               </Combobox.ItemText>
               <Combobox.ItemIndicator />
            </Combobox.Item>
         );
      },
      [refinements.refine],
   );

   const { collection, set } = useListCollection<RefinementItem>({
      initialItems: displayItems,
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
   });

   useEffect(() => {
      set(displayItems);
   }, [displayItems, set]);

   const placeholder = capitalizeWords(attribute.replace('_', ' ').replace('.', ' '));

   const value = useMemo(
      () =>
         refinements
            .items
            .filter(({ isRefined }) => isRefined)
            .map(({ value }) => value),
      [refinements.items],
   );

   const combobox = useCombobox({
      placeholder,
      multiple: true,
      openOnClick: true,
      onInputValueChange: ({ inputValue }) => {
         if (formatLabel) {
            const query = inputValue.trim().toLowerCase();
            set(
               displayItems.filter((item) =>
                  !query || item.label.toLowerCase().includes(query)
               )
            );
            return;
         }
         refinements.searchForItems(inputValue);
      },
      value,
      collection,
   });

   return (
      <Combobox.RootProvider value={combobox} {...props}>
         <Combobox.Control>
            <Combobox.Input />
            <Combobox.IndicatorGroup>
               <Combobox.ClearTrigger
                  onClick={() => value.map((value) => refinements.refine(value))}
               />
               <Combobox.Trigger />
            </Combobox.IndicatorGroup>
         </Combobox.Control>
         <Portal>
            <Combobox.Positioner>
               <Combobox.Content>
                  <Combobox.Empty>No items found</Combobox.Empty>
                  {collection.items.map((item) => <ComboboxItem item={item} key={item.value} />)}
               </Combobox.Content>
            </Combobox.Positioner>
         </Portal>
      </Combobox.RootProvider>
   );
};

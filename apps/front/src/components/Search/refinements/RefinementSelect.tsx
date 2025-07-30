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

export const RefinementSelect = (
   { attribute, ...props }: { attribute: string } & Partial<ComboboxRootProviderProps>,
) => {
   const refinements = useRefinementList({ attribute, limit: 25 });

   const ComboboxItem = useCallback(
      ({ item }: { item: typeof refinements.items[number] }) => {
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

   const { collection, set } = useListCollection<typeof refinements.items[number]>({
      initialItems: refinements.items,
   });

   useEffect(() => set(refinements.items), [refinements.items]);
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
      onInputValueChange: ({ inputValue }) => refinements.searchForItems(inputValue),
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

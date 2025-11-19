import { useRefinementList } from 'react-instantsearch';
import { useEffect, useMemo, useState } from 'react';
import { capitalizeWords } from '@/helpers';
import {
   Badge,
   Box,
   Button,
   Checkbox,
   CheckboxGroup,
   Field,
   Fieldset,
   For,
   HStack,
   Input,
   Text,
} from '@chakra-ui/react';
import { Tooltip } from '@/components/ui';

export const RefinementCheckbox = ({ attribute }: { attribute: string }) => {
   const refinements = useRefinementList({
      attribute,
      limit: 5,
      showMore: true,
      showMoreLimit: 20,
   });

   const [inputValue, setInputValue] = useState('');
   useEffect(() => refinements.searchForItems(inputValue), [inputValue]);
   const placeholder = capitalizeWords(attribute.replace('_', ' ').replace('.', ' '));
   const checkedItems = useMemo(
      () => refinements.items.filter(({ isRefined }) => isRefined).map(({ value }) => value),
      [refinements.items],
   );

   return (
      <Box p={2}>
         <Fieldset.Root size='sm' width='sm'>
            <Field.Root mt={3}>
               <Field.Label fontSize='md'>{placeholder}</Field.Label>
               <Input
                  width='65%'
                  placeholder={`Search ${placeholder.toLowerCase()}...`}
                  value={inputValue}
                  onChange={({ target: { value } }) => setInputValue(value)}
               />
            </Field.Root>
            <CheckboxGroup value={checkedItems}>
               <Fieldset.Content width='60%'>
                  <For each={refinements.items}>
                     {({ value, isRefined, label, count }) => (
                        <Checkbox.Root
                           name={value}
                           value={value}
                           checked={isRefined}
                           onCheckedChange={() => refinements.refine(value)}
                        >
                           <Checkbox.HiddenInput />
                           <Checkbox.Control />
                           <Tooltip content={label}>
                              <Checkbox.Label>
                                 <HStack>
                                    <Text lineClamp={1}>{label}</Text>
                                    <Badge>{count}</Badge>
                                 </HStack>
                              </Checkbox.Label>
                           </Tooltip>
                        </Checkbox.Root>
                     )}
                  </For>
                  <Button
                     hidden={!refinements.canToggleShowMore}
                     width='fit-content'
                     justifyContent='start'
                     size='xs'
                     variant='ghost'
                     onClick={() => refinements.toggleShowMore()}
                  >
                     <Text>Show {refinements.isShowingMore ? 'less' : 'more'}</Text>
                  </Button>
               </Fieldset.Content>
            </CheckboxGroup>
         </Fieldset.Root>
      </Box>
   );
};

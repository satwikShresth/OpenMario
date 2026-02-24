import { useNumericMenu } from 'react-instantsearch';
import { Box, Field, Fieldset, RadioGroup, Text } from '@chakra-ui/react';
import { capitalizeWords } from '@/helpers';

type NumericItem = { label: string; start?: number; end?: number };

export const NumericFilter = ({
   attribute,
   items,
   label: labelOverride,
}: {
   attribute: string;
   items: NumericItem[];
   label?: string;
}) => {
   const { items: refinedItems, refine } = useNumericMenu({ attribute, items });
   const label = labelOverride ?? capitalizeWords(attribute.replace(/_/g, ' '));
   const currentValue = refinedItems.find(i => i.isRefined)?.value ?? '';

   return (
      <Box pt={1} pb={2} px={2}>
         <Fieldset.Root size='sm' width='sm'>
            <Field.Root mt={0}>
               <Field.Label fontSize='md'>{label}</Field.Label>
            </Field.Root>
            <RadioGroup.Root value={currentValue}>
               <Fieldset.Content>
                  {refinedItems.map(item => (
                     <RadioGroup.Item
                        key={item.value}
                        value={item.value}
                        onClick={() => refine(item.value)}
                     >
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemControl />
                        <RadioGroup.ItemText>
                           <Text lineClamp={1}>{item.label}</Text>
                        </RadioGroup.ItemText>
                     </RadioGroup.Item>
                  ))}
               </Fieldset.Content>
            </RadioGroup.Root>
         </Fieldset.Root>
      </Box>
   );
};

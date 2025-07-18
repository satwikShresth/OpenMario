import { Field, Select, Stack, useBreakpointValue } from '@chakra-ui/react';
import type { withForm } from './index.tsx';
import {
   convertFunc,
   defaultValues,
   isInvalid,
   programLevelCollection,
   selectProps,
} from '../helpers.ts';
import { capitalizeWords } from '@/helpers/index.ts';
import { AsyncCreatableSelect } from 'chakra-react-select';
import { useQueryClient } from '@tanstack/react-query';
import { getV1AutocompleteLocationOptions } from '@/client';

export default (withForm: withForm) =>
   withForm({
      defaultValues,
      render: ({ form }) => {
         const isMobile = useBreakpointValue({ base: true, md: false });
         const queryClient = useQueryClient();

         return (
            <Stack direction={isMobile ? 'column' : 'row'} mb={2} gap={6} mt={3}>
               <form.Field name='location'>
                  {(field) => (
                     <Field.Root required invalid={isInvalid({ field })}>
                        <Field.Label fontSize='md'>
                           {capitalizeWords(field.name)}
                           <Field.RequiredIndicator />
                        </Field.Label>
                        {/*@ts-ignore: shut up*/}
                        <AsyncCreatableSelect
                           {...selectProps(field)}
                           required
                           onBlur={field.handleBlur}
                           loadOptions={(inputValue, callback) => {
                              const query = { loc: inputValue };
                              if (inputValue?.length >= 3) {
                                 queryClient
                                    .ensureQueryData(
                                       getV1AutocompleteLocationOptions({ query }),
                                    )
                                    .then((data) => callback(data?.map(convertFunc) || []))
                                    .catch(() => callback([]));
                              }
                           }}
                        />
                        <Field.ErrorText>
                           {/*@ts-ignore: shut up*/}
                           {field.state.meta.errors.map(({ message }) => message).join(', ')}
                        </Field.ErrorText>
                     </Field.Root>
                  )}
               </form.Field>
               <form.Field name='program_level'>
                  {({ state, handleChange, handleBlur, name }) => (
                     <Field.Root required invalid={isInvalid({ state })}>
                        <Select.Root
                           value={[state?.value!]}
                           onValueChange={({ value: [change] }) =>
                              //@ts-ignore: shut up
                              handleChange(change!)}
                           collection={programLevelCollection}
                           required
                           onBlur={handleBlur}
                        >
                           <Select.HiddenSelect />
                           <Select.Label fontSize='md'>
                              {capitalizeWords(name.replaceAll('_', ' '))}
                              <Field.RequiredIndicator ml={1} />
                           </Select.Label>
                           <Select.Control>
                              <Select.Trigger>
                                 <Select.ValueText />
                              </Select.Trigger>
                              <Select.IndicatorGroup>
                                 <Select.Indicator />
                              </Select.IndicatorGroup>
                           </Select.Control>
                           <Select.Positioner>
                              <Select.Content>
                                 {programLevelCollection
                                    .items
                                    .map((level) => (
                                       <Select.Item
                                          item={level}
                                          key={level.value}
                                       >
                                          {level.label}
                                          <Select.ItemIndicator />
                                       </Select.Item>
                                    ))}
                              </Select.Content>
                           </Select.Positioner>
                        </Select.Root>
                        <Field.ErrorText>
                           {/*@ts-ignore: shut up*/}
                           {state.meta.errors.map(({ message }) =>
                              message
                           ).join(', ')}
                        </Field.ErrorText>
                     </Field.Root>
                  )}
               </form.Field>
            </Stack>
         );
      },
   });

import { Field, Select, Stack } from '@chakra-ui/react';
import type { withForm } from './context';
import {
   capitalizeWords,
   convertFunc,
   defaultValues,
   isInvalid,
   orpc,
   programLevelCollection,
   selectProps,
} from '@/helpers';
import { useMobile } from '@/hooks';
import { AsyncCreatableSelect } from 'chakra-react-select';
import { useQueryClient } from '@tanstack/react-query';

export default (withForm: withForm) =>
   withForm({
      defaultValues,
      render: ({ form }) => {
         const isMobile = useMobile();
         const queryClient = useQueryClient();

         return (
            <Stack direction={isMobile ? 'column' : 'row'} mb={2} gap={6} mt={3}>
               <form.Field
                  name='location'
                  validators={{
                     onSubmitAsync: ({ value: loc }) =>
                        queryClient
                           .ensureQueryData(
                              orpc.autocomplete.location.queryOptions({
                                 input: { loc },
                                 select: (data) => data
                                    .some(({ name }) => name === loc) ? undefined : 'Unknown Location'

                              }))
                           .catch((e) => {
                              console.error(e);
                              return 'Value is unable to be validated';
                           }),
                  }}
               >
                  {(field) => (
                     <Field.Root
                        required
                        invalid={isInvalid({ field })}
                     >
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
                              const loc = (inputValue.length >= 3) ? inputValue : field.state.value;
                              const query = { loc };
                              if (inputValue?.length >= 3) {
                                 queryClient
                                    .ensureQueryData(
                                       orpc.autocomplete.location.queryOptions({ input: query })
                                    )
                                    .then((data) => callback(data?.map(convertFunc) || []))
                                    .catch(() => callback([]));
                              }
                           }}
                        />
                        <Field.ErrorText>
                           {/*@ts-ignore: shut up*/}
                           {field.state.meta.errors.join(', ')}
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

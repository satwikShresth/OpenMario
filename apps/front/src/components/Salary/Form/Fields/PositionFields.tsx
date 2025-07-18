import { Field, Stack, useBreakpointValue } from '@chakra-ui/react';
import type { withForm } from './index.tsx';
import { convertFunc, defaultValues, isInvalid, selectProps } from '../helpers.ts';
import { capitalizeWords } from '@/helpers/index.ts';
import { AsyncCreatableSelect } from 'chakra-react-select';
import { useQueryClient } from '@tanstack/react-query';
import { getV1AutocompleteCompanyOptions, getV1AutocompletePositionOptions } from '@/client';

export default (withForm: withForm) =>
   withForm({
      defaultValues,
      render: ({ form }) => {
         const isMobile = useBreakpointValue({ base: true, md: false });
         const queryClient = useQueryClient();

         return (
            <Stack direction={isMobile ? 'column' : 'row'} mb={2} gap={6}>
               <form.Field
                  name='company'
                  listeners={{ onChange: ({ fieldApi }) => fieldApi.form.resetField('position') }}
               >
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
                           loadOptions={(inputValue, callback) => {
                              const query = { comp: inputValue };
                              if (inputValue?.length >= 3) {
                                 queryClient
                                    .ensureQueryData(
                                       getV1AutocompleteCompanyOptions({ query }),
                                    )
                                    .then((data) => callback(data?.map(convertFunc) || []))
                                    .catch(() => callback([]));
                              }
                           }}
                        />
                        <Field.ErrorText>
                           {/*@ts-ignore: shut up*/}
                           {field.state.meta.errors.map(({ message }) => message).join(
                              ', ',
                           )}
                        </Field.ErrorText>
                     </Field.Root>
                  )}
               </form.Field>
               <form.Subscribe
                  selector={(state) => state.values.company}
               >
                  {(comp) => (
                     <form.Field name='position'>
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
                                 disabled={comp.length == 0}
                                 loadOptions={(inputValue, callback) => {
                                    const query = { comp, pos: inputValue };
                                    if (inputValue?.length >= 3) {
                                       queryClient
                                          .ensureQueryData(
                                             getV1AutocompletePositionOptions({ query }),
                                          )
                                          .then((data) => callback(data?.map(convertFunc) || []))
                                          .catch(() => callback([]));
                                    }
                                 }}
                              />
                              <Field.ErrorText>
                                 {/*@ts-ignore: shut up*/}
                                 {field.state.meta.errors.map(({ message }) => message).join(
                                    ', ',
                                 )}
                              </Field.ErrorText>
                           </Field.Root>
                        )}
                     </form.Field>
                  )}
               </form.Subscribe>
            </Stack>
         );
      },
   });

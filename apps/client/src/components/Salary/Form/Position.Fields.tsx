import { Field, Stack } from '@chakra-ui/react';
import type { withForm } from './context';
import { convertFunc, defaultValues, isInvalid, orpc, selectProps } from '@/helpers';
import { capitalizeWords } from '@/helpers/index.ts';
import { AsyncCreatableSelect } from 'chakra-react-select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMobile } from '@/hooks';
import { toaster } from '@/components/ui/toaster';

export default (withForm: withForm) =>
   withForm({
      defaultValues,
      render: ({ form }) => {
         const isMobile = useMobile();
         const queryClient = useQueryClient();
         const createCompany = useMutation(orpc.company.create.mutationOptions());
         const createPosition = useMutation(orpc.position.create.mutationOptions());

         return (
            <Stack direction={isMobile ? 'column' : 'row'} mb={2} gap={6}>
               <form.Field
                  name='company'
                  validators={{
                     onSubmitAsync: ({ value: comp }) =>
                        queryClient
                           .ensureQueryData(
                              orpc.autocomplete.company.queryOptions({
                                 input: { comp },
                              })
                           )
                           .then((data) => data.some(({ name }) => name === comp) ? undefined : 'Unknown Company')
                           .catch((e) => {
                              console.error(e);
                              return 'Value is unable to be validated';
                           }),
                  }}
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
                           onCreateOption={(name) => {
                              const promise = createCompany
                                 .mutateAsync({ name })
                                 .then(({ company: { name } }) => {
                                    field.handleChange(name);
                                    queryClient.getQueryCache().clear();
                                 })
                                 .catch(console.error);

                              toaster.promise(promise, {
                                 success: {
                                    title: 'Successfully created a new Comapny!',
                                    description: 'Everything looks great',
                                 },
                                 error: {
                                    title: 'Failed to create your new company',
                                    description: 'Something wrong with the submission',
                                 },
                                 loading: {
                                    title: 'Creating Company...',
                                    description: 'Please wait',
                                 },
                              });
                           }}
                           loadOptions={(inputValue, callback) => {
                              const comp = (inputValue.length >= 3)
                                 ? inputValue
                                 : field.state.value;
                              const query = { comp };
                              if (comp?.length >= 3) {
                                 queryClient
                                    .ensureQueryData(
                                       orpc.autocomplete.company.queryOptions({
                                          input: query,
                                       })
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
               <form.Subscribe
                  selector={(state) => state.values.company}
               >
                  {(comp) => (
                     <form.Field
                        name='position'
                        validators={{
                           onSubmitAsync: ({ value: pos }) =>
                              queryClient
                                 .ensureQueryData(
                                    orpc.autocomplete.position.queryOptions({
                                       input: {
                                          comp, pos
                                       },
                                    })
                                 ).then(
                                    (data) =>
                                       data.some(({ name }) => name === pos)
                                          ? undefined
                                          : "Unknown Company's Position"

                                 )
                                 .catch((e) => {
                                    console.error(e);
                                    return 'Value is unable to be validated';
                                 }),
                        }}
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
                                 disabled={!comp || comp.length === 0}
                                 onCreateOption={(name) => {
                                    const promise = createPosition
                                       .mutateAsync({ name, company: comp })
                                       .then(({ position: { name } }) => {
                                          field.handleChange(name);
                                          queryClient.getQueryCache().clear();
                                       })
                                       .catch(console.error);

                                    toaster.promise(promise, {
                                       success: {
                                          title: 'Successfully created a new Comapny!',
                                          description: 'Everything looks great',
                                       },
                                       error: {
                                          title: 'Failed to create your new company',
                                          description: 'Something wrong with the submission',
                                       },
                                       loading: {
                                          title: 'Creating Company...',
                                          description: 'Please wait',
                                       },
                                    });
                                 }}
                                 loadOptions={(inputValue, callback) => {
                                    const pos = (inputValue.length >= 3)
                                       ? inputValue
                                       : field.state.value;
                                    const query = { comp, pos };
                                    if (pos?.length >= 3) {
                                       queryClient
                                          .ensureQueryData(
                                             orpc.autocomplete.position.queryOptions({
                                                input: query,
                                             })
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
                  )}
               </form.Subscribe>
            </Stack >
         );
      },
   });

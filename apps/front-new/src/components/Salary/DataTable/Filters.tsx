import { HStack } from '@chakra-ui/react';
import { AsyncSelect } from 'chakra-react-select';
import { useQueryClient } from '@tanstack/react-query';
import { useSalaryTableStore } from './Store.ts';
import { useForm } from '@tanstack/react-form';
import { asyncComponents } from '@/components/common';
import {
   getV1AutocompleteCompanyOptions,
   getV1AutocompleteLocationOptions,
   getV1AutocompletePositionOptions,
} from '@/client';
import type { SubmissionSearch } from '@/routes/home';

export const COOP_CYCLES = [
   'Fall/Winter',
   'Winter/Spring',
   'Spring/Summer',
   'Summer/Fall',
] as const;

export default () => {
   const Route = useSalaryTableStore(({ Route }) => Route);
   const query = Route.useSearch();
   const queryClient = useQueryClient();
   const navigate = Route.useNavigate();

   const defaultValues: Partial<SubmissionSearch> = {
      company: [...((query?.company!) ? query?.company : [''])],
      position: [...((query?.position!) ? query?.position : [''])],
      location: [...((query?.location!) ? query?.location : [''])],
   };

   const form = useForm({
      defaultValues,
      onSubmit: async ({ value }) => {
         console.log(value);
      },
   });

   return (
      <form>
         <HStack mb={4}>
            <form.Field
               name='company'
               listeners={{
                  onChange: ({ value }) =>
                     navigate({
                        search: (prev) => ({
                           ...prev,
                           pageIndex: 1,
                           company: value?.map(({ value }) => value),
                        }),
                        reloadDocument: false,
                        replace: true,
                        startTransition: true,
                     }),
               }}
            >
               {({ state, handleChange, handleBlur }) => (
                  <AsyncSelect
                     isMulti
                     name='company'
                     placeholder='Select a company'
                     value={state?.value}
                     components={asyncComponents}
                     onBlur={handleBlur}
                     onChange={(value) => handleChange(value)}
                     noOptionsMessage={() => 'Keeping typing for autocomplete'}
                     loadOptions={async (inputValue, callback) => {
                        if (inputValue?.length >= 3) {
                           callback(
                              await queryClient
                                 .ensureQueryData(
                                    {
                                       ...getV1AutocompleteCompanyOptions({
                                          query: {
                                             comp: inputValue,
                                          },
                                       }),
                                    },
                                 ).then(
                                    (values) =>
                                       values
                                          ?.map(({ name }) => (
                                             {
                                                value: name!,
                                                label: name!,
                                                variant: 'subtle',
                                             }
                                          )),
                                 ),
                           );
                        }
                     }}
                  />
               )}
            </form.Field>
            <form.Field
               name='position'
               listeners={{
                  onChange: ({ value }) =>
                     navigate({
                        search: (prev) => ({
                           ...prev,
                           pageIndex: 1,
                           position: value?.map(({ value }) => value),
                        }),
                        reloadDocument: false,
                        replace: true,
                        startTransition: true,
                     }),
               }}
            >
               {({ state, handleChange, handleBlur }) => (
                  <AsyncSelect
                     isMulti
                     name='position'
                     placeholder='Select a position'
                     value={state?.value}
                     components={asyncComponents}
                     onBlur={handleBlur}
                     onChange={(value) => handleChange(value)}
                     noOptionsMessage={() => 'Keeping typing for autocomplete'}
                     loadOptions={async (inputValue, callback) => {
                        if (inputValue?.length >= 3) {
                           callback(
                              await queryClient
                                 .ensureQueryData(
                                    {
                                       ...getV1AutocompletePositionOptions({
                                          query: {
                                             comp: '*',
                                             pos: inputValue,
                                          },
                                       }),
                                    },
                                 ).then(
                                    (values) =>
                                       values
                                          ?.map(({ name }) => (
                                             {
                                                value: name!,
                                                label: name!,
                                                variant: 'subtle',
                                             }
                                          )),
                                 ),
                           );
                        }
                     }}
                  />
               )}
            </form.Field>

            <form.Field
               name='location'
               listeners={{
                  onChange: ({ value }) =>
                     navigate({
                        search: (prev) => ({
                           ...prev,
                           pageIndex: 1,
                           location: value?.map(({ value }) => value),
                        }),
                        reloadDocument: false,
                        replace: true,
                        startTransition: true,
                     }),
               }}
            >
               {({ state, handleChange, handleBlur }) => (
                  <AsyncSelect
                     isMulti
                     name='location'
                     placeholder='Select a location'
                     value={state?.value}
                     components={asyncComponents}
                     onBlur={handleBlur}
                     onChange={(value) => handleChange(value)}
                     noOptionsMessage={() => 'Keeping typing for autocomplete'}
                     loadOptions={async (inputValue, callback) => {
                        if (inputValue?.length >= 3) {
                           callback(
                              await queryClient
                                 .ensureQueryData(
                                    {
                                       ...getV1AutocompleteLocationOptions({
                                          query: { loc: inputValue },
                                       }),
                                    },
                                 ).then(
                                    (values) =>
                                       values
                                          ?.map(({ name }) => (
                                             {
                                                value: name!,
                                                label: name!,
                                                variant: 'subtle',
                                             }
                                          )),
                                 ),
                           );
                        }
                     }}
                  />
               )}
            </form.Field>
         </HStack>
      </form>
   );
};

import { HStack } from '@chakra-ui/react';
import { AsyncSelect } from 'chakra-react-select';
import { useQueryClient } from '@tanstack/react-query';
import { useSalaryTableStore } from './Store.ts';
import { useForm } from '@tanstack/react-form';
import { asyncComponents } from '@/components/common';
import {
   getAutocompleteCompanyOptions,
   getAutocompletePositionOptions,
} from '@/client/@tanstack/react-query.gen.ts';

export default () => {
   const Route = useSalaryTableStore(({ Route }) => Route);
   const query = Route.useSearch();
   const queryClient = useQueryClient();
   const navigate = Route.useNavigate();

   const form = useForm({
      defaultValues: {
         company: [...((query?.company!) ? query?.company : [''])],
         position: [...((query?.position!) ? query?.position : [''])],
      },
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
                              await queryClient.ensureQueryData(
                                 {
                                    ...getAutocompleteCompanyOptions({
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
                              await queryClient.ensureQueryData(
                                 {
                                    ...getAutocompletePositionOptions({
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
         </HStack>
      </form>
   );
};

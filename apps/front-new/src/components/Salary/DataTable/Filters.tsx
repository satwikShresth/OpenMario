import { HStack } from '@chakra-ui/react';
import { AsyncSelect, type GroupBase } from 'chakra-react-select';
import { useQueryClient } from '@tanstack/react-query';
import { useSalaryTableStore } from './Store.ts';
import { useForm } from '@tanstack/react-form';
import { asyncComponents } from '@/components/common';
import {
   getV1AutocompleteCompanyOptions,
   getV1AutocompleteLocationOptions,
   getV1AutocompletePositionOptions,
} from '@/client';

export const COOP_CYCLES = [
   'Fall/Winter',
   'Winter/Spring',
   'Spring/Summer',
   'Summer/Fall',
] as const;

type AutocompleteOptions = {
   value: string;
   label: string;
   variant: string;
};

const ConvertMapFunc = (value: string | { name: string } | undefined): AutocompleteOptions => ({
   value: typeof value === 'string' ? value : value?.name || '',
   label: typeof value === 'string' ? value : value?.name || '',
   variant: 'subtle',
});

export default () => {
   const Route = useSalaryTableStore(({ Route }) => Route);
   const query = Route.useSearch();
   const queryClient = useQueryClient();
   const navigate = Route.useNavigate();

   const defaultValues: { company: string[]; position: string[]; location: string[] } = {
      company: [...((query?.company!) ? query?.company : [])],
      position: [...((query?.position!) ? query?.position : [])],
      location: [...((query?.location!) ? query?.location : [])],
   };

   const form = useForm({ defaultValues });

   return (
      <form>
         <HStack mb={4}>
            <form.Field
               name='company'
               listeners={{
                  onChange: (company) =>
                     navigate({
                        search: (prev) => ({ ...prev, pageIndex: 1, company }),
                        reloadDocument: false,
                        replace: true,
                        startTransition: true,
                     }),
               }}
            >
               {({ state, handleChange, handleBlur }) => (
                  <AsyncSelect<AutocompleteOptions, true, GroupBase<AutocompleteOptions>>
                     isMulti
                     name='company'
                     placeholder='Select a company'
                     value={state.value?.map(ConvertMapFunc)}
                     components={asyncComponents}
                     onBlur={handleBlur}
                     onChange={(values) =>
                        handleChange(values.map(({ value }) =>
                           value
                        ))}
                     noOptionsMessage={() => 'Keeping typing for autocomplete'}
                     loadOptions={(inputValue, callback) => {
                        const query = { comp: inputValue };
                        if (inputValue?.length >= 3) {
                           queryClient
                              .ensureQueryData(getV1AutocompleteCompanyOptions({ query }))
                              .then((data) => callback(data?.map(ConvertMapFunc) || []))
                              .catch(() => callback([]));
                        }
                     }}
                  />
               )}
            </form.Field>
            <form.Field
               name='position'
               listeners={{
                  onChange: (position) =>
                     navigate({
                        search: (prev) => ({ ...prev, pageIndex: 1, position }),
                        reloadDocument: false,
                        replace: true,
                        startTransition: true,
                     }),
               }}
            >
               {({ state, handleChange, handleBlur }) => (
                  <AsyncSelect<AutocompleteOptions, true, GroupBase<AutocompleteOptions>>
                     isMulti
                     name='position'
                     placeholder='Select a position'
                     value={state.value?.map(ConvertMapFunc)}
                     components={asyncComponents}
                     onBlur={handleBlur}
                     onChange={(values) =>
                        handleChange(values.map(({ value }) =>
                           value
                        ))}
                     noOptionsMessage={() => 'Keeping typing for autocomplete'}
                     loadOptions={(inputValue, callback) => {
                        const query = { comp: '*', pos: inputValue };
                        if (inputValue?.length >= 3) {
                           queryClient
                              .ensureQueryData(getV1AutocompletePositionOptions({ query }))
                              .then((data) => callback(data?.map(ConvertMapFunc) || []))
                              .catch(() => callback([]));
                        }
                     }}
                  />
               )}
            </form.Field>

            <form.Field
               name='location'
               listeners={{
                  onChange: (location) =>
                     navigate({
                        search: (prev) => ({ ...prev, pageIndex: 1, location }),
                        reloadDocument: false,
                        replace: true,
                        startTransition: true,
                     }),
               }}
            >
               {({ state, handleChange, handleBlur }) => (
                  <AsyncSelect<AutocompleteOptions, true, GroupBase<AutocompleteOptions>>
                     isMulti
                     name='location'
                     placeholder='Select a location'
                     value={state.value?.map(ConvertMapFunc)}
                     components={asyncComponents}
                     onBlur={handleBlur}
                     onChange={(values) =>
                        handleChange(values.map(({ value }) =>
                           value
                        ))}
                     noOptionsMessage={() => 'Keeping typing for autocomplete'}
                     loadOptions={(inputValue, callback) => {
                        const query = { loc: inputValue };
                        if (inputValue?.length >= 3) {
                           queryClient
                              .ensureQueryData(getV1AutocompleteLocationOptions({ query }))
                              .then((data) => callback(data?.map(ConvertMapFunc) || []))
                              .catch(() => callback([]));
                        }
                     }}
                  />
               )}
            </form.Field>
         </HStack>
      </form>
   );
};

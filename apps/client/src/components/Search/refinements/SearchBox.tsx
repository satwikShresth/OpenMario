import { useSearchBox } from 'react-instantsearch';
import { CloseButton, Field, Input, InputGroup } from '@chakra-ui/react';
import { useEffect } from 'react';

type SearchBoxProps = {
   value?: string;
   onChange?: (value: string) => void;
}

export const SearchBox = ({ value: controlledValue, onChange }: SearchBoxProps = {}) => {
   const search = useSearchBox();
   
   // Sync controlled value with InstantSearch
   useEffect(() => {
      if (controlledValue !== undefined && controlledValue !== search.query) {
         search.refine(controlledValue);
      }
   }, [controlledValue, search]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      search.refine(newValue);
      onChange?.(newValue);
   };

   const handleClear = () => {
      search.clear();
      onChange?.('');
   };

   return (
      <Field.Root
         fontSize={{ base: 'lg', md: 'xl' }}
      >
         <InputGroup
            startAddon='Search'
            endElement={search.query
               ? (
                  <CloseButton
                     size='xs'
                     onClick={handleClear}
                  />
               )
               : undefined}
         >
            <Input
               size={{ base: 'lg', md: 'xl' }}
               placeholder='Start typing to search...'
               value={search.query}
               onChange={handleChange}
            />
         </InputGroup>
      </Field.Root>
   );
};

import { useSearchBox } from 'react-instantsearch';
import { CloseButton, Field, Input, InputGroup } from '@chakra-ui/react';

export const SearchBox = () => {
   const search = useSearchBox();
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
                     onClick={() => search.clear()}
                  />
               )
               : undefined}
         >
            <Input
               size={{ base: 'lg', md: 'xl' }}
               placeholder='Start typing to search...'
               value={search.query}
               onChange={(e) => search.refine(e.target.value)}
            />
         </InputGroup>
      </Field.Root>
   );
};

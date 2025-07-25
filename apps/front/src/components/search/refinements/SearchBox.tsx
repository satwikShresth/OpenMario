import { useSearchBox } from 'react-instantsearch';
import { CloseButton, Field, Input, InputGroup } from '@chakra-ui/react';
import { useMobile } from '@/hooks';

export const SearchBox = () => {
   const isMobile = useMobile();
   const search = useSearchBox();
   return (
      <Field.Root>
         <Field.Label hidden={!isMobile} fontSize='xl' fontWeight='semibold'>
            Search
         </Field.Label>
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
               size='xl'
               fontSize='xl'
               placeholder='Start typing to search...'
               value={search.query}
               onChange={(e) => search.refine(e.target.value)}
            />
         </InputGroup>
      </Field.Root>
   );
};

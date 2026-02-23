import { Box, Flex, Input, Select, createListCollection } from '@chakra-ui/react';
import { SearchIcon } from '@/components/icons';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useRef } from 'react';
import type { SortBy } from './types';

const sortOptions = createListCollection({
   items: [
      { label: 'Total Reviews', value: 'total_reviews' },
      { label: 'Omega Score', value: 'omega_score' },
      { label: 'Avg Rating', value: 'avg_rating_overall' },
      { label: 'Company Name', value: 'company_name' },
   ],
});

const orderOptions = createListCollection({
   items: [
      { label: 'Descending', value: 'desc' },
      { label: 'Ascending', value: 'asc' },
   ],
});

export function Toolbar() {
   const query = useSearch({ from: '/companies/' });
   const navigate = useNavigate({ from: '/companies/' });
   const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
   const searchInputRef = useRef<HTMLInputElement>(null);

   const sortBy = (query.sort_by ?? 'total_reviews') as SortBy;
   const order = (query.order ?? 'desc') as 'asc' | 'desc';

   const updateSearch = (updates: Partial<typeof query>) =>
      navigate({ search: (prev: typeof query) => ({ ...prev, ...updates }) });

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => updateSearch({ search: val || undefined }), 300);
   };

   return (
      <Flex gap={3} wrap='wrap' align='center'>
         <Box flex='1' minW='200px' position='relative'>
            <Input
               ref={searchInputRef}
               placeholder='Search companies...'
               defaultValue={query.search ?? ''}
               onChange={handleSearchChange}
               pl={9}
            />
            <Box position='absolute' left={3} top='50%' transform='translateY(-50%)' color='fg.muted'>
               <SearchIcon size={15} />
            </Box>
         </Box>
         <Select.Root
            collection={sortOptions}
            width='180px'
            value={[sortBy]}
            onValueChange={({ value }) => updateSearch({ sort_by: value[0] as SortBy })}
         >
            <Select.HiddenSelect />
            <Select.Control>
               <Select.Trigger><Select.ValueText placeholder='Sort by' /></Select.Trigger>
            </Select.Control>
            <Select.Positioner>
               <Select.Content>
                  {sortOptions.items.map(item => (
                     <Select.Item key={item.value} item={item}>{item.label}</Select.Item>
                  ))}
               </Select.Content>
            </Select.Positioner>
         </Select.Root>
         <Select.Root
            collection={orderOptions}
            width='150px'
            value={[order]}
            onValueChange={({ value }) => updateSearch({ order: value[0] as 'asc' | 'desc' })}
         >
            <Select.HiddenSelect />
            <Select.Control>
               <Select.Trigger><Select.ValueText placeholder='Order' /></Select.Trigger>
            </Select.Control>
            <Select.Positioner>
               <Select.Content>
                  {orderOptions.items.map(item => (
                     <Select.Item key={item.value} item={item}>{item.label}</Select.Item>
                  ))}
               </Select.Content>
            </Select.Positioner>
         </Select.Root>
      </Flex>
   );
}

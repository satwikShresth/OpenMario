import { Box, Flex, Input, Select, createListCollection } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useRef } from 'react';
import type { SortBy } from './types';

const sortOptions = createListCollection({
   items: [
      { label: 'Most Rated', value: 'num_ratings' },
      { label: 'Avg Rating', value: 'avg_rating' },
      { label: 'Difficulty', value: 'avg_difficulty' },
      { label: 'Sections Taught', value: 'total_sections_taught' },
      { label: 'Name', value: 'instructor_name' },
   ],
});

const orderOptions = createListCollection({
   items: [
      { label: 'Descending', value: 'desc' },
      { label: 'Ascending', value: 'asc' },
   ],
});

export function Toolbar() {
   const query = useSearch({ from: '/professors/' });
   const navigate = useNavigate({ from: '/professors/' });
   const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
   const deptDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

   const sortBy = (query.sort_by ?? 'num_ratings') as SortBy;
   const order = (query.order ?? 'desc') as 'asc' | 'desc';

   const updateSearch = (updates: Partial<typeof query>) =>
      navigate({ search: (prev: typeof query) => ({ ...prev, ...updates }) });

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => updateSearch({ search: val || undefined }), 300);
   };

   const handleDeptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      clearTimeout(deptDebounceRef.current);
      deptDebounceRef.current = setTimeout(() => updateSearch({ department: val || undefined }), 300);
   };

   return (
      <Flex gap={3} wrap='wrap' align='center'>
         <Box flex='1' minW='180px' position='relative'>
            <Input
               placeholder='Search by name...'
               defaultValue={query.search ?? ''}
               onChange={handleSearchChange}
               pl={9}
            />
            <Box position='absolute' left={3} top='50%' transform='translateY(-50%)' color='fg.muted'>
               <FiSearch />
            </Box>
         </Box>
         <Box minW='160px'>
            <Input
               placeholder='Filter by department...'
               defaultValue={query.department ?? ''}
               onChange={handleDeptChange}
            />
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

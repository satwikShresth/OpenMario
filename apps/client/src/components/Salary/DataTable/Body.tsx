import {
   Badge,
   EmptyState,
   Flex,
   HStack,
   Icon,
   List,
   Table,
   Text,
   useDialog,
   VStack,
} from '@chakra-ui/react';
import DataTableDialog from './Dialog';
import { HiColorSwatch } from 'react-icons/hi';
import { useCallback, useState } from 'react';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { Tooltip } from '@/components/ui/tooltip.jsx';
import { Link } from '@tanstack/react-router';
import { useSearch } from '@tanstack/react-router';
import type { SubmissionListItem, SubmissionListResponse, SubmissionQuery } from '@openmario/server/contracts';

export default (
   { data, count }: {
      data: SubmissionListResponse['data'];
      count: number;
   },
) => {
   const search = useSearch({ from: '/salary' });
   const dialog = useDialog();
   const [submission, setSubmission] = useState<SubmissionListItem | null>(null);

   const SortableColumnHeader = useCallback(({
      label,
      value,
      textAlign = 'start',
      display = { base: 'table-cell', md: 'table-cell' },
   }: {
      label: string;
      value: NonNullable<SubmissionQuery['sortField']>;
      textAlign?: 'start' | 'center' | 'end';
      display?: Record<string, string>;
   }) => (
      <Table.ColumnHeader
         textAlign={textAlign}
         display={display}
      >
         <Link
            //@ts-expect-error 
            search={(prev) => {
               const sort: 'ASC' | 'DESC' = (prev?.sortField === value)
                  ? (prev?.sort === 'DESC') ? 'ASC' : 'DESC'
                  : 'DESC';
               return { ...prev, sort, sortField: value };
            }}
         >
            <HStack justify='space-between'>
               {label}
               <Tooltip
                  content={(search!.sortField === value)
                     ? (search!.sort === 'ASC') ? 'ASC' : 'DESC'
                     : 'SORT'}
               >
                  <Icon size='sm'>
                     {(search!.sortField === value)
                        ? (search!.sort === 'ASC') ? <FaSortUp /> : <FaSortDown />
                        : <FaSort />}
                  </Icon>
               </Tooltip>
            </HStack>
         </Link>
      </Table.ColumnHeader>
   ), [search]);

   return (
      <Flex overflow='auto' w='full' mt={4}>
         <Table.Root
            tableLayout={count === 0 ? 'fixed' : 'auto'}
            variant='outline'
            interactive
            borderRadius='xl'
         >
            <Table.Header>
               <Table.Row>
                  <SortableColumnHeader label='Company' value='company' />
                  <SortableColumnHeader label='Position' value='position' />
                  <SortableColumnHeader
                     label='Location'
                     value='location'
                     display={{ base: 'none', md: 'table-cell' }}
                  />
                  <SortableColumnHeader
                     label='Year'
                     value='year'
                     display={{ base: 'none', md: 'table-cell' }}
                  />
                  <SortableColumnHeader label='Salary' value='compensation' />
                  <SortableColumnHeader
                     label='Coop'
                     display={{ base: 'none', md: 'table-cell' }}
                     value='coop'
                  />
                  <Table.ColumnHeader display={{ base: 'none', md: 'table-cell' }}>
                     Cycle
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                     display={{ base: 'none', md: 'table-cell' }}
                  >
                     Program Level
                  </Table.ColumnHeader>
               </Table.Row>
            </Table.Header>
            <Table.Body columnWidth='10px'>
               {count > 0
                  ? (
                     data?.map((row, index) => (
                        <Table.Row
                           key={index}
                           cursor='pointer'
                           onClick={() => {
                              setSubmission(row);
                              dialog.setOpen(true);
                           }}
                        >
                           <Table.Cell>
                              <Text lineClamp={2}>
                                 {row?.company || 'N/A'}
                              </Text>
                           </Table.Cell>
                           <Table.Cell>
                              <Text lineClamp={2}>
                                 {row?.position || 'N/A'}
                              </Text>
                           </Table.Cell>
                           <Table.Cell
                              display={{ base: 'none', md: 'table-cell' }}
                           >
                              {`${row.location_city}, ${row.location_state_code}` ||
                                 'N/A'}
                           </Table.Cell>
                           <Table.Cell
                              display={{ base: 'none', md: 'table-cell' }}
                           >
                              {row?.year || 'N/A'}
                           </Table.Cell>
                           <Table.Cell textAlign='end'>
                              {row?.compensation
                                 ? (
                                    <Text
                                       fontWeight='semibold'
                                       color='green.600'
                                    >
                                       ${row?.compensation?.toLocaleString()}/hr
                                    </Text>
                                 )
                                 : 'N/A'}
                           </Table.Cell>
                           <Table.Cell
                              display={{ base: 'none', md: 'table-cell' }}
                           >
                              {row?.coop_year || 'N/A'}
                           </Table.Cell>
                           <Table.Cell
                              display={{ base: 'none', md: 'table-cell' }}
                           >
                              {row?.coop_cycle
                                 ? (
                                    <Badge size='lg' colorPalette='blue' variant='subtle'>
                                       {row?.coop_cycle}
                                    </Badge>
                                 )
                                 : 'N/A'}
                           </Table.Cell>
                           <Table.Cell
                              display={{ base: 'none', md: 'table-cell' }}
                           >
                              {row?.program_level || 'N/A'}
                           </Table.Cell>
                        </Table.Row>
                     ))
                  )
                  : (
                     <Table.Row>
                        <Table.Cell colSpan={8} py={100} width='full'>
                           <EmptyState.Root>
                              <EmptyState.Content>
                                 <EmptyState.Indicator>
                                    <HiColorSwatch />
                                 </EmptyState.Indicator>
                                 <VStack textAlign='center'>
                                    <EmptyState.Title>No results found</EmptyState.Title>
                                    <EmptyState.Description>
                                       Try adjusting your search
                                    </EmptyState.Description>
                                 </VStack>
                                 <List.Root variant='marker'>
                                    <List.Item>Try removing filters</List.Item>
                                    <List.Item>Try different keywords</List.Item>
                                 </List.Root>
                              </EmptyState.Content>
                           </EmptyState.Root>
                        </Table.Cell>
                     </Table.Row>
                  )}
            </Table.Body>
         </Table.Root>
         <DataTableDialog dialog={dialog} submission={submission} />
      </Flex>
   );
};

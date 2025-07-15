import {
   Badge,
   Box,
   EmptyState,
   Flex,
   List,
   Table,
   Text,
   useDialog,
   VStack,
} from '@chakra-ui/react';
import type { SubmissionListItem, SubmissionListResponse } from '@/client';
import DataTableDialog from './Dialog';
import { HiColorSwatch } from 'react-icons/hi';
import { useState } from 'react';

export default (
   { data, count }: { data: SubmissionListResponse['data']; count: number },
) => {
   const dialog = useDialog();
   const [submission, setSubmission] = useState<SubmissionListItem | null>(null);
   console.log(data);

   return (
      <Flex overflow='auto' w='full' mt={4}>
         <Table.Root
            tableLayout={count === 0 ? 'fixed' : 'auto'}
            size='lg'
            variant='outline'
            interactive
            borderRadius='2xl'
            native
         >
            <Table.Header>
               <Table.Row>
                  <Table.ColumnHeader>Company</Table.ColumnHeader>
                  <Table.ColumnHeader>Position</Table.ColumnHeader>
                  <Table.ColumnHeader
                     display={{ base: 'none', md: 'table-cell' }}
                  >
                     Location
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                     display={{ base: 'table-cell', md: 'table-cell' }}
                  >
                     Year
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                     display={{ base: 'none', md: 'table-cell' }}
                  >
                     Coop Year
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                     display={{ base: 'none', md: 'table-cell' }}
                  >
                     Coop Cycle
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                     display={{ base: 'none', md: 'table-cell' }}
                  >
                     Program Level
                  </Table.ColumnHeader>
                  <Table.ColumnHeader textAlign='end'>
                     Salary
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
                              {row?.company || 'N/A'}
                           </Table.Cell>
                           <Table.Cell>{row?.position || 'N/A'}</Table.Cell>
                           <Table.Cell
                              display={{ base: 'none', md: 'table-cell' }}
                           >
                              {`${row.location_city}, ${row.location_state_code}` ||
                                 'N/A'}
                           </Table.Cell>
                           <Table.Cell
                              display={{ base: 'table-cell', md: 'table-cell' }}
                           >
                              {row?.year || 'N/A'}
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
                           <Table.Cell textAlign='end'>
                              {row?.compensation
                                 ? (
                                    <Text
                                       fontWeight='semibold'
                                       color='green.600'
                                    >
                                       ${row?.compensation?.toLocaleString()}
                                    </Text>
                                 )
                                 : 'N/A'}
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

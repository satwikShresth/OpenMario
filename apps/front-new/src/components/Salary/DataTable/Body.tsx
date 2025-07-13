import { Badge, Table, Text } from '@chakra-ui/react';

export default ({ data, count }: { data: any; count: number }) => {
   return (
      <Table.Root variant='outline' striped interactive width='100vh'>
         <Table.Header>
            <Table.Row>
               <Table.ColumnHeader>Company</Table.ColumnHeader>
               <Table.ColumnHeader>Position</Table.ColumnHeader>
               <Table.ColumnHeader>Location</Table.ColumnHeader>
               <Table.ColumnHeader>Year</Table.ColumnHeader>
               <Table.ColumnHeader>Coop Year</Table.ColumnHeader>
               <Table.ColumnHeader>Coop Cycle</Table.ColumnHeader>
               <Table.ColumnHeader>Program Level</Table.ColumnHeader>
               <Table.ColumnHeader textAlign='end'>
                  Salary
               </Table.ColumnHeader>
            </Table.Row>
         </Table.Header>
         <Table.Body>
            {count > 0
               ? (
                  data?.map((row, index) => (
                     <Table.Row key={index}>
                        <Table.Cell>
                           {row?.company || 'N/A'}
                        </Table.Cell>
                        <Table.Cell>
                           {row?.position || 'N/A'}
                        </Table.Cell>
                        <Table.Cell>
                           {`${row.location_city}, ${row.location_state_code}` ||
                              'N/A'}
                        </Table.Cell>
                        <Table.Cell>{row?.year || 'N/A'}</Table.Cell>
                        <Table.Cell>
                           {row?.coop_year || 'N/A'}
                        </Table.Cell>
                        <Table.Cell>
                           {row?.coop_cycle
                              ? (
                                 <Badge
                                    colorPalette='blue'
                                    variant='subtle'
                                 >
                                    {row?.coop_cycle}
                                 </Badge>
                              )
                              : 'N/A'}
                        </Table.Cell>
                        <Table.Cell>
                           {row?.program_level || 'N/A'}
                        </Table.Cell>
                        <Table.Cell textAlign='end'>
                           {row?.compensation
                              ? (
                                 <Text
                                    fontWeight='semibold'
                                    color='green.600'
                                 >
                                    ${row?.compensation
                                       ?.toLocaleString()}
                                 </Text>
                              )
                              : 'N/A'}
                        </Table.Cell>
                     </Table.Row>
                  ))
               )
               : (
                  <Table.Row>
                     <Table.Cell colSpan={8} textAlign='center' py={8}>
                        <Text color='gray.500'>
                           No salary data available
                        </Text>
                     </Table.Cell>
                  </Table.Row>
               )}
         </Table.Body>
      </Table.Root>
   );
};

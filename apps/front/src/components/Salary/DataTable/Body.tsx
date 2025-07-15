import {
   Badge,
   Box,
   Button,
   CloseButton,
   Dialog,
   EmptyState,
   Grid,
   GridItem,
   HStack,
   Icon,
   List,
   Portal,
   Table,
   Text,
   useDialog,
   VStack,
} from '@chakra-ui/react';
import {
   FaCalendarAlt,
   FaClock,
   FaDollarSign,
   FaGraduationCap,
   FaMapMarkerAlt,
   FaSync,
} from 'react-icons/fa';
import type { SubmissionListItem, SubmissionListResponse } from '@/client';
import { HiColorSwatch } from 'react-icons/hi';
import { useState } from 'react';

const formatCurrency = (amount: number) => {
   return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
   }).format(amount);
};

export default (
   { data, count }: { data: SubmissionListResponse['data']; count: number },
) => {
   const dialog = useDialog();

   const [submission, setSubmission] = useState<SubmissionListItem | null>(null);

   return (
      <Box overflow='auto' w='full'>
         <Table.Root
            tableLayout={count === 0 ? 'fixed' : 'auto'}
            variant='outline'
            interactive
            borderRadius='2xl'
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
            <Table.Body>
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
                           <Table.Cell>{row?.company || 'N/A'}</Table.Cell>
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

         <Dialog.RootProvider value={dialog}>
            <Dialog.Trigger asChild>
               <Button variant='outline' size='md'>
                  {dialog.open ? 'Close' : 'Open'} Dialog
               </Button>
            </Dialog.Trigger>
            <Portal>
               <Dialog.Backdrop />
               <Dialog.Positioner>
                  <Dialog.Content>
                     <Dialog.Header>
                        <Dialog.Title>Submission Details</Dialog.Title>
                     </Dialog.Header>
                     <Dialog.Context>
                        {() => (
                           <Dialog.Body>
                              <VStack spaceY={6} align='stretch'>
                                 {/* Location and Basic Info */}
                                 <Box>
                                    <HStack mb={3}>
                                       <Icon as={FaMapMarkerAlt} color='green.500' />
                                       <Text fontWeight='semibold' fontSize='md'>Location</Text>
                                    </HStack>
                                    <Text ml={2} fontSize='md'>
                                       {submission?.location_city}
                                       {', '}
                                       {submission?.location_state || 'N/A'}{' '}
                                       ({submission?.location_state_code || 'N/A'})
                                    </Text>
                                 </Box>

                                 <Box height='1px' bg='gray.200' />

                                 {/* Program Details */}
                                 <Grid templateColumns='repeat(2, 1fr)' gap={4}>
                                    <GridItem>
                                       <HStack mb={2}>
                                          <Icon as={FaGraduationCap} color='purple.500' />
                                          <Text fontSize='md' fontWeight='semibold'>
                                             Program Level
                                          </Text>
                                       </HStack>
                                       <Badge
                                          ml={2}
                                          size='lg'
                                          colorPalette='purple'
                                          variant='subtle'
                                       >
                                          {submission?.program_level || 'N/A'}
                                       </Badge>
                                    </GridItem>

                                    <GridItem>
                                       <HStack mb={2}>
                                          <Icon as={FaCalendarAlt} color='orange.500' />
                                          <Text fontSize='md' fontWeight='semibold'>
                                             Academic Year
                                          </Text>
                                       </HStack>
                                       <Text ml={2} fontSize='md'>
                                          {submission?.coop_year || 'N/A'}
                                       </Text>
                                    </GridItem>
                                 </Grid>

                                 <Box height='1px' bg='gray.200' />

                                 {/* Work Details */}
                                 <Grid templateColumns='repeat(2, 1fr)' gap={4}>
                                    <GridItem>
                                       <HStack mb={2}>
                                          <Icon as={FaSync} color='blue.500' />
                                          <Text fontSize='md' fontWeight='semibold'>Cycle</Text>
                                       </HStack>
                                       <Badge ml={2} size='lg' colorPalette='blue' variant='subtle'>
                                          {submission?.coop_cycle || 'N/A'}
                                          {submission?.year || 'N/A'}
                                       </Badge>
                                    </GridItem>

                                    <GridItem>
                                       <HStack mb={2}>
                                          <Icon as={FaClock} color='teal.500' />
                                          <Text fontSize='md' fontWeight='semibold'>
                                             Work Hours
                                          </Text>
                                       </HStack>
                                       <Text fontSize='md' ml={2}>
                                          {submission?.work_hours || 'N/A'} hours/week
                                       </Text>
                                    </GridItem>
                                 </Grid>

                                 <Box height='1px' bg='gray.200' />

                                 {/* Compensation */}
                                 <Box>
                                    <HStack mb={3}>
                                       <Icon as={FaDollarSign} color='green.500' />
                                       <Text fontSize='md' fontWeight='semibold'>Compensation</Text>
                                    </HStack>
                                    <VStack align='start' spaceY={2}>
                                       <Text
                                          ml={2}
                                          fontSize='lg'
                                          fontWeight='bold'
                                          color='green.600'
                                       >
                                          {formatCurrency(submission?.compensation!)}
                                       </Text>
                                       {submission?.other_compensation && (
                                          <Box>
                                             <Text fontSize='md' mb={1}>
                                                Additional Benefits:
                                             </Text>
                                             <Text ml={2} fontSize='md'>
                                                {submission?.other_compensation}
                                             </Text>
                                          </Box>
                                       )}
                                    </VStack>
                                 </Box>

                                 {/* Details */}
                                 {submission?.details && (
                                    <>
                                       <Box height='1px' bg='gray.200' />
                                       <Box>
                                          <Text fontSize='md' fontWeight='semibold' mb={3}>
                                             Experience Details
                                          </Text>
                                          <Text lineHeight='tall' fontSize='md'>
                                             {submission.details}
                                          </Text>
                                       </Box>
                                    </>
                                 )}
                              </VStack>
                           </Dialog.Body>
                        )}
                     </Dialog.Context>
                     <Dialog.Footer>
                        <Dialog.ActionTrigger asChild>
                           <Button variant='outline'>Close</Button>
                        </Dialog.ActionTrigger>
                     </Dialog.Footer>
                     <Dialog.CloseTrigger asChild>
                        <CloseButton size='sm' />
                     </Dialog.CloseTrigger>
                  </Dialog.Content>
               </Dialog.Positioner>
            </Portal>
         </Dialog.RootProvider>
      </Box>
   );
};

import {
   Badge,
   Box,
   Button,
   CloseButton,
   Dialog,
   Grid,
   GridItem,
   HStack,
   Icon,
   Portal,
   Text,
   type UseDialogReturn,
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
import type { SubmissionListItem } from '@/client';

const formatCurrency = (amount: number) => {
   return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
   }).format(amount);
};
type DataTableDialogProps = {
   dialog: UseDialogReturn;
   submission: SubmissionListItem | null;
};
export default ({ dialog, submission }: DataTableDialogProps) => (
   <Dialog.RootProvider value={dialog}>
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
                                       {submission?.details || 'N/A'}
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
);

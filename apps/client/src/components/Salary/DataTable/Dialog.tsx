import {
   Badge,
   Box,
   Button,
   CloseButton,
   Dialog,
   Flex,
   Grid,
   HStack,
   Icon,
   Portal,
   Separator,
   Text,
   type UseDialogReturn,
   VStack,
} from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import type { SubmissionListItem } from '@openmario/contracts';

import {
   ArrowRightIcon,
   BriefcaseIcon,
   CalendarDaysIcon,
   ClockIcon,
   GraduationCapIcon,
   MapPinIcon,
   RefreshIcon,
} from '@/components/icons';

const formatCurrency = (amount: number) =>
   new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

type DataTableDialogProps = {
   dialog: UseDialogReturn;
   submission: SubmissionListItem | null;
};

const StatCell = ({ icon, label, value, color = 'fg.muted' }: {
   icon: React.ElementType;
   label: string;
   value: React.ReactNode;
   color?: string;
}) => (
   <Box bg='bg.subtle' borderRadius='md' p={3}>
      <HStack gap={1.5} mb={1}>
         <Icon as={icon} color={color} boxSize={3.5} />
         <Text fontSize='xs' color='fg.muted'>{label}</Text>
      </HStack>
      <Box>{value}</Box>
   </Box>
);

export default ({ dialog, submission }: DataTableDialogProps) => (
   <Dialog.RootProvider value={dialog}>
      <Portal>
         <Dialog.Backdrop />
         <Dialog.Positioner>
            <Dialog.Content>
               <Dialog.Header pb={2}>
                  <VStack align='start' gap={0.5}>
                     <Dialog.Title fontSize='lg'>{submission?.company ?? 'Submission Details'}</Dialog.Title>
                     {submission?.position && (
                        <Text fontSize='sm' color='fg.muted' fontWeight='normal'>{submission.position}</Text>
                     )}
                  </VStack>
               </Dialog.Header>

               <Dialog.Context>
                  {() => (
                     <Dialog.Body pt={2}>
                        <VStack gap={4} align='stretch'>

                           {/* Compensation hero */}
                           <Box borderRadius='lg' borderWidth='thin' p={4}>
                              <Text fontSize='xs' color='fg.muted' mb={1}>Compensation</Text>
                              <Text fontSize='3xl' fontWeight='extrabold' color='green.fg' lineHeight='1'>
                                 {submission?.compensation != null ? formatCurrency(submission.compensation) : '—'}
                              </Text>
                              {submission?.other_compensation && (
                                 <Text fontSize='sm' color='fg.muted' mt={2}>
                                    + {submission.other_compensation}
                                 </Text>
                              )}
                           </Box>

                           {/* Stats grid */}
                           <Grid templateColumns='repeat(2, 1fr)' gap={3}>
                              <StatCell
                                 icon={MapPinIcon}
                                 label='Location'
                                 color='green.500'
                                 value={
                                    <Text fontSize='sm' fontWeight='medium'>
                                       {submission?.location_city}{submission?.location_state_code ? `, ${submission.location_state_code}` : ''}
                                    </Text>
                                 }
                              />
                              <StatCell
                                 icon={RefreshIcon}
                                 label='Cycle'
                                 color='blue.500'
                                 value={
                                    <Badge colorPalette='blue' variant='subtle' size='sm'>
                                       {submission?.coop_cycle} {submission?.year}
                                    </Badge>
                                 }
                              />
                              <StatCell
                                 icon={GraduationCapIcon}
                                 label='Program'
                                 color='purple.500'
                                 value={
                                    <Badge colorPalette='purple' variant='subtle' size='sm'>
                                       {submission?.program_level || 'N/A'}
                                    </Badge>
                                 }
                              />
                              <StatCell
                                 icon={ClockIcon}
                                 label='Work Hours'
                                 color='teal.500'
                                 value={
                                    <Text fontSize='sm' fontWeight='medium'>
                                       {submission?.work_hours ? `${submission.work_hours} hrs/week` : 'N/A'}
                                    </Text>
                                 }
                              />
                              <StatCell
                                 icon={CalendarDaysIcon}
                                 label='Academic Year'
                                 color='orange.500'
                                 value={
                                    <Text fontSize='sm' fontWeight='medium'>
                                       {submission?.coop_year || 'N/A'}
                                    </Text>
                                 }
                              />
                           </Grid>

                           {/* Experience details */}
                           {submission?.details && (
                              <Box>
                                 <Text fontSize='xs' color='fg.muted' mb={2}>Experience</Text>
                                 <Text fontSize='sm' lineHeight='tall' color='fg'>
                                    {submission.details}
                                 </Text>
                              </Box>
                           )}

                           {/* Show more information */}
                           {(submission?.company_id || submission?.position_id) && (
                              <>
                                 <Separator />
                                 <Box>
                                    <Text fontSize='xs' color='fg.muted' mb={3}>
                                       View omega scores, salary trends & reviews
                                    </Text>
                                    <VStack gap={0} borderWidth='thin' borderRadius='lg' overflow='hidden'>
                                       {submission?.company_id && (
                                          <Dialog.ActionTrigger asChild>
                                             <Link
                                                to='/companies/$company_id'
                                                params={{ company_id: submission.company_id }}
                                                style={{ width: '100%' }}
                                             >
                                                <Flex
                                                   align='center'
                                                   gap={3}
                                                   px={4}
                                                   py={3}
                                                   _hover={{ bg: 'bg.subtle' }}
                                                   transition='background 0.15s'
                                                   cursor='pointer'
                                                >
                                                   <Flex align='center' justify='center' bg='blue.subtle' borderRadius='md' p={1.5} flexShrink={0}>
                                                      <Icon as={BriefcaseIcon} color='blue.fg' boxSize={3.5} />
                                                   </Flex>
                                                   <Text flex={1} fontSize='sm' fontWeight='medium'>
                                                      {submission.company}
                                                   </Text>
                                                   <HStack gap={1} color='fg.muted'>
                                                      <Text fontSize='xs'>Show more</Text>
                                                      <Icon as={ArrowRightIcon} boxSize={3.5} />
                                                   </HStack>
                                                </Flex>
                                             </Link>
                                          </Dialog.ActionTrigger>
                                       )}
                                       {submission?.company_id && submission?.position_id && (
                                          <>
                                             <Separator />
                                             <Dialog.ActionTrigger asChild>
                                                <Link
                                                   to='/companies/$company_id/$position_id'
                                                   params={{
                                                      company_id: submission.company_id,
                                                      position_id: submission.position_id,
                                                   }}
                                                   style={{ width: '100%' }}
                                                >
                                                   <Flex
                                                      align='center'
                                                      gap={3}
                                                      px={4}
                                                      py={3}
                                                      _hover={{ bg: 'bg.subtle' }}
                                                      transition='background 0.15s'
                                                      cursor='pointer'
                                                   >
                                                      <Flex align='center' justify='center' bg='purple.subtle' borderRadius='md' p={1.5} flexShrink={0}>
                                                         <Icon as={GraduationCapIcon} color='purple.fg' boxSize={3.5} />
                                                      </Flex>
                                                      <Text flex={1} fontSize='sm' fontWeight='medium' truncate>
                                                         {submission.position}
                                                      </Text>
                                                      <HStack gap={1} color='fg.muted'>
                                                         <Text fontSize='xs'>Show more</Text>
                                                         <Icon as={ArrowRightIcon} boxSize={3.5} />
                                                      </HStack>
                                                   </Flex>
                                                </Link>
                                             </Dialog.ActionTrigger>
                                          </>
                                       )}
                                    </VStack>
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

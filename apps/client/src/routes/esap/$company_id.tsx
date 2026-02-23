import {
   Badge,
   Box,
   CloseButton,
   Dialog,
   Flex,
   Grid,
   HStack,
   Portal,
   Progress,
   Separator,
   Skeleton,
   Stat,
   Table,
   Text,
   VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { orpc } from '@/helpers/rpc.ts';

export const Route = createFileRoute('/esap/$company_id')({
   component: EsapCompanyDialog,
});

const omegaColor = (score: number | null) => {
   if (score === null) return 'gray';
   if (score >= 70) return 'green';
   if (score >= 50) return 'yellow';
   return 'red';
};

function ScoreBar({ label, value }: { label: string; value: number | null }) {
   return (
      <Box>
         <Flex justify='space-between' mb={1}>
            <Text fontSize='sm'>{label}</Text>
            <Text fontSize='sm' fontWeight='medium'>{value != null ? `${value}` : 'N/A'}</Text>
         </Flex>
         <Progress.Root value={value ?? 0} max={100} size='sm' colorPalette={omegaColor(value)}>
            <Progress.Track borderRadius='full'>
               <Progress.Range />
            </Progress.Track>
         </Progress.Root>
      </Box>
   );
}

function EsapCompanyDialog() {
   const company_id = useParams({ strict: false, select: s => s?.company_id ?? '' });
   const navigate = useNavigate();

   const { data, isLoading } = useQuery(
      orpc.esap.getCompany.queryOptions({
         input: { company_id },
         staleTime: 30_000,
      })
   );

   const { company, positions } = data ?? { company: null, positions: [] };

   return (
      <Dialog.Root
         open
         onOpenChange={() =>
            navigate({ to: '..', reloadDocument: false, resetScroll: false, replace: true })
         }
         size='xl'
         placement='top'
         motionPreset='slide-in-bottom'
      >
         <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
               <Dialog.Content p={{ base: 4, md: 6 }} maxWidth='4xl' maxH='90vh' overflow='hidden' display='flex' flexDir='column'>
                  <Dialog.Header pb={4} flexShrink={0}>
                     <Dialog.Title>
                        {isLoading || !company ? (
                           <Skeleton height='28px' width='280px' />
                        ) : (
                           <Flex justify='space-between' align='center' wrap='wrap' gap={2}>
                              <VStack align='flex-start' gap={0}>
                                 <Text fontSize='xs' color='fg.muted' mb={1}>ESAP Company</Text>
                                 <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight='semibold' lineHeight='1.2'>
                                    {company.company_name}
                                 </Text>
                              </VStack>
                              <Badge
                                 colorPalette={omegaColor(company.omega_score)}
                                 variant='subtle'
                                 fontSize='lg'
                                 px={4}
                                 py={2}
                              >
                                 Ω {company.omega_score ?? 'N/A'}
                              </Badge>
                           </Flex>
                        )}
                     </Dialog.Title>
                     <Dialog.CloseTrigger m={4} asChild>
                        <CloseButton size='sm' variant='outline' />
                     </Dialog.CloseTrigger>
                  </Dialog.Header>

                  <Dialog.Body overflowY='auto' flex='1'>
                     {isLoading || !company ? (
                        <VStack gap={4}>
                           <Skeleton height='100px' />
                           <Skeleton height='200px' />
                           <Skeleton height='200px' />
                        </VStack>
                     ) : (
                        <VStack align='stretch' gap={5}>
                           {/* Key Stats */}
                           <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={3}>
                              {[
                                 { label: 'Total Reviews', value: company.total_reviews },
                                 { label: 'Positions Reviewed', value: company.positions_reviewed },
                                 {
                                    label: 'Avg Rating',
                                    value: company.avg_rating_overall != null
                                       ? `${company.avg_rating_overall} / 4`
                                       : 'N/A',
                                 },
                                 {
                                    label: 'Would Recommend',
                                    value: company.pct_would_recommend != null
                                       ? `${company.pct_would_recommend}%`
                                       : 'N/A',
                                 },
                              ].map(({ label, value }) => (
                                 <Box key={label} borderWidth='thin' borderRadius='lg' p={3}>
                                    <Stat.Root>
                                       <Stat.Label fontSize='xs'>{label}</Stat.Label>
                                       <Stat.ValueText fontSize='lg'>{value}</Stat.ValueText>
                                    </Stat.Root>
                                 </Box>
                              ))}
                           </Grid>

                           <Separator />

                           {/* Omega Score Breakdown */}
                           <Box>
                              <Text fontWeight='semibold' mb={3}>Omega Score Breakdown</Text>
                              <VStack gap={3} align='stretch'>
                                 <ScoreBar label='Satisfaction' value={company.satisfaction_score} />
                                 <ScoreBar label='Trust (Would Recommend)' value={company.trust_score} />
                                 <ScoreBar label='Integrity (Description Accurate)' value={company.integrity_score} />
                                 <ScoreBar label='Growth (Competencies)' value={company.growth_score} />
                                 <ScoreBar label='Work-Life Balance' value={company.work_life_score} />
                              </VStack>
                           </Box>

                           <Separator />

                           {/* Rating Details */}
                           <Box>
                              <Text fontWeight='semibold' mb={3}>Rating Details</Text>
                              <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(3, 1fr)' }} gap={3}>
                                 {[
                                    { label: 'Collaboration', value: company.avg_rating_collaboration },
                                    { label: 'Work Variety', value: company.avg_rating_work_variety },
                                    { label: 'Relationships', value: company.avg_rating_relationships },
                                    { label: 'Supervisor Access', value: company.avg_rating_supervisor_access },
                                    { label: 'Training', value: company.avg_rating_training },
                                    {
                                       label: 'Description Accurate',
                                       value: company.pct_description_accurate != null
                                          ? company.pct_description_accurate / 100 * 4
                                          : null,
                                    },
                                    { label: 'Avg Days / Week', value: company.avg_days_per_week },
                                    {
                                       label: 'Public Transit',
                                       value: company.pct_public_transit != null
                                          ? `${company.pct_public_transit}%`
                                          : null,
                                    },
                                    {
                                       label: 'Overtime Required',
                                       value: company.pct_overtime_required != null
                                          ? `${company.pct_overtime_required}%`
                                          : null,
                                    },
                                 ].map(({ label, value }) => (
                                    <Box key={label}>
                                       <Text fontSize='xs' color='fg.muted'>{label}</Text>
                                       <Text fontWeight='medium'>
                                          {value != null
                                             ? typeof value === 'number'
                                                ? `${Number(value).toFixed(2)} / 4`
                                                : value
                                             : 'N/A'}
                                       </Text>
                                    </Box>
                                 ))}
                              </Grid>
                           </Box>

                           <Separator />

                           {/* Positions Table */}
                           <Box>
                              <Text fontWeight='semibold' mb={3}>
                                 Positions ({positions.length})
                              </Text>
                              <Box overflowX='auto'>
                                 <Table.Root size='sm' variant='outline'>
                                    <Table.Header>
                                       <Table.Row>
                                          <Table.ColumnHeader>Position</Table.ColumnHeader>
                                          <Table.ColumnHeader textAlign='center'>Omega</Table.ColumnHeader>
                                          <Table.ColumnHeader textAlign='center'>Reviews</Table.ColumnHeader>
                                          <Table.ColumnHeader textAlign='center'>Submissions</Table.ColumnHeader>
                                          <Table.ColumnHeader textAlign='center'>Avg Comp</Table.ColumnHeader>
                                          <Table.ColumnHeader textAlign='center'>Last Posted</Table.ColumnHeader>
                                       </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                       {positions.length === 0 ? (
                                          <Table.Row>
                                             <Table.Cell colSpan={6} textAlign='center' py={6} color='fg.muted'>
                                                No positions found
                                             </Table.Cell>
                                          </Table.Row>
                                       ) : (
                                          positions.map(pos => (
                                             <Table.Row key={pos.position_id}>
                                                <Table.Cell fontWeight='medium'>{pos.position_name}</Table.Cell>
                                                <Table.Cell textAlign='center'>
                                                   <Badge colorPalette={omegaColor(pos.omega_score)} variant='subtle' size='sm'>
                                                      {pos.omega_score ?? 'N/A'}
                                                   </Badge>
                                                </Table.Cell>
                                                <Table.Cell textAlign='center'>{pos.total_reviews}</Table.Cell>
                                                <Table.Cell textAlign='center'>{pos.total_submissions}</Table.Cell>
                                                <Table.Cell textAlign='center'>
                                                   {pos.avg_compensation != null
                                                      ? `$${Number(pos.avg_compensation).toLocaleString()}`
                                                      : 'N/A'}
                                                </Table.Cell>
                                                <Table.Cell textAlign='center'>
                                                   {pos.most_recent_posting_year ?? 'N/A'}
                                                </Table.Cell>
                                             </Table.Row>
                                          ))
                                       )}
                                    </Table.Body>
                                 </Table.Root>
                              </Box>
                           </Box>

                           <HStack justify='flex-end'>
                              <Text fontSize='xs' color='fg.subtle'>
                                 {company.company_id}
                              </Text>
                           </HStack>
                        </VStack>
                     )}
                  </Dialog.Body>
               </Dialog.Content>
            </Dialog.Positioner>
         </Portal>
      </Dialog.Root>
   );
}

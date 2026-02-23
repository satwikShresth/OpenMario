import {
   Badge,
   Box,
   Card,
   Container,
   Flex,
   Grid,
   HStack,
   Progress,
   Separator,
   Skeleton,
   Stat,
   Table,
   Text,
   VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { orpc } from '@/helpers/rpc.ts';
import { FiArrowLeft } from 'react-icons/fi';

export const Route = createFileRoute('/esap/$company_id')({
   component: EsapCompanyPage,
});

const omegaColor = (score: number | null) => {
   if (score === null) return 'gray';
   if (score >= 70) return 'green';
   if (score >= 50) return 'yellow';
   return 'red';
};

type ScoreBarProps = { label: string; value: number | null };

function ScoreBar({ label, value }: ScoreBarProps) {
   return (
      <Box>
         <Flex justify='space-between' mb={1}>
            <Text fontSize='sm'>{label}</Text>
            <Text fontSize='sm' fontWeight='medium'>
               {value != null ? `${value}` : 'N/A'}
            </Text>
         </Flex>
         <Progress.Root value={value ?? 0} max={100} size='sm' colorPalette={omegaColor(value)}>
            <Progress.Track borderRadius='full'>
               <Progress.Range />
            </Progress.Track>
         </Progress.Root>
      </Box>
   );
}

function EsapCompanyPage() {
   const { company_id } = Route.useParams();

   const { data, isLoading } = useQuery(
      orpc.esap.getCompany.queryOptions({
         input: { company_id },
         staleTime: 30_000,
      })
   );

   if (isLoading) {
      return (
         <Container>
            <VStack align='stretch' gap={6} mt={10}>
               <Skeleton height='40px' width='300px' />
               <Skeleton height='200px' borderRadius='lg' />
               <Skeleton height='400px' borderRadius='lg' />
            </VStack>
         </Container>
      );
   }

   if (!data) return null;

   const { company, positions } = data;

   return (
      <Container>
         <VStack align='stretch' gap={6} mt={10} pb={10}>
            <HStack>
               <Badge
                  as={Link}
                  to='/esap'
                  variant='outline'
                  cursor='pointer'
                  _hover={{ borderColor: 'accent', color: 'accent' }}
                  px={3}
                  py={1}
               >
                  <HStack gap={1}>
                     <FiArrowLeft />
                     <Text>Back to ESAP</Text>
                  </HStack>
               </Badge>
            </HStack>

            <Flex justify='space-between' align='center' wrap='wrap' gap={3}>
               <Text fontSize='3xl' fontWeight='bolder'>
                  {company.company_name}
               </Text>
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

            <Separator />

            {/* Key Stats */}
            <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={4}>
               <Card.Root variant='outline'>
                  <Card.Body>
                     <Stat.Root>
                        <Stat.Label>Total Reviews</Stat.Label>
                        <Stat.ValueText>{company.total_reviews}</Stat.ValueText>
                     </Stat.Root>
                  </Card.Body>
               </Card.Root>
               <Card.Root variant='outline'>
                  <Card.Body>
                     <Stat.Root>
                        <Stat.Label>Positions Reviewed</Stat.Label>
                        <Stat.ValueText>{company.positions_reviewed}</Stat.ValueText>
                     </Stat.Root>
                  </Card.Body>
               </Card.Root>
               <Card.Root variant='outline'>
                  <Card.Body>
                     <Stat.Root>
                        <Stat.Label>Avg Overall Rating</Stat.Label>
                        <Stat.ValueText>
                           {company.avg_rating_overall != null
                              ? `${company.avg_rating_overall} / 4`
                              : 'N/A'}
                        </Stat.ValueText>
                     </Stat.Root>
                  </Card.Body>
               </Card.Root>
               <Card.Root variant='outline'>
                  <Card.Body>
                     <Stat.Root>
                        <Stat.Label>Would Recommend</Stat.Label>
                        <Stat.ValueText>
                           {company.pct_would_recommend != null
                              ? `${company.pct_would_recommend}%`
                              : 'N/A'}
                        </Stat.ValueText>
                     </Stat.Root>
                  </Card.Body>
               </Card.Root>
            </Grid>

            {/* Omega Score Breakdown */}
            <Card.Root variant='outline'>
               <Card.Header>
                  <Text fontWeight='semibold' fontSize='lg'>
                     Omega Score Breakdown
                  </Text>
               </Card.Header>
               <Card.Body>
                  <VStack gap={4} align='stretch'>
                     <ScoreBar label='Satisfaction' value={company.satisfaction_score} />
                     <ScoreBar label='Trust (Would Recommend)' value={company.trust_score} />
                     <ScoreBar label='Integrity (Description Accurate)' value={company.integrity_score} />
                     <ScoreBar label='Growth (Competencies)' value={company.growth_score} />
                     <ScoreBar label='Work-Life Balance' value={company.work_life_score} />
                  </VStack>
               </Card.Body>
            </Card.Root>

            {/* Rating Details */}
            <Card.Root variant='outline'>
               <Card.Header>
                  <Text fontWeight='semibold' fontSize='lg'>
                     Rating Details
                  </Text>
               </Card.Header>
               <Card.Body>
                  <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                     {[
                        { label: 'Collaboration', value: company.avg_rating_collaboration },
                        { label: 'Work Variety', value: company.avg_rating_work_variety },
                        { label: 'Relationships', value: company.avg_rating_relationships },
                        { label: 'Supervisor Access', value: company.avg_rating_supervisor_access },
                        { label: 'Training', value: company.avg_rating_training },
                        { label: 'Description Accurate', value: company.pct_description_accurate != null ? company.pct_description_accurate / 100 * 4 : null },
                     ].map(({ label, value }) => (
                        <Box key={label}>
                           <Text fontSize='xs' color='fg.muted'>{label}</Text>
                           <Text fontWeight='medium'>
                              {value != null ? `${Number(value).toFixed(2)} / 4` : 'N/A'}
                           </Text>
                        </Box>
                     ))}
                     <Box>
                        <Text fontSize='xs' color='fg.muted'>Avg Days / Week</Text>
                        <Text fontWeight='medium'>
                           {company.avg_days_per_week ?? 'N/A'}
                        </Text>
                     </Box>
                     <Box>
                        <Text fontSize='xs' color='fg.muted'>Public Transit</Text>
                        <Text fontWeight='medium'>
                           {company.pct_public_transit != null
                              ? `${company.pct_public_transit}%`
                              : 'N/A'}
                        </Text>
                     </Box>
                     <Box>
                        <Text fontSize='xs' color='fg.muted'>Overtime Required</Text>
                        <Text fontWeight='medium'>
                           {company.pct_overtime_required != null
                              ? `${company.pct_overtime_required}%`
                              : 'N/A'}
                        </Text>
                     </Box>
                  </Grid>
               </Card.Body>
            </Card.Root>

            {/* Positions Table */}
            <Card.Root variant='outline'>
               <Card.Header>
                  <Text fontWeight='semibold' fontSize='lg'>
                     Positions ({positions.length})
                  </Text>
               </Card.Header>
               <Card.Body p={0}>
                  <Box overflowX='auto'>
                     <Table.Root size='sm'>
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
                                    <Table.Cell fontWeight='medium'>
                                       {pos.position_name}
                                    </Table.Cell>
                                    <Table.Cell textAlign='center'>
                                       <Badge
                                          colorPalette={omegaColor(pos.omega_score)}
                                          variant='subtle'
                                          size='sm'
                                       >
                                          {pos.omega_score ?? 'N/A'}
                                       </Badge>
                                    </Table.Cell>
                                    <Table.Cell textAlign='center'>
                                       {pos.total_reviews}
                                    </Table.Cell>
                                    <Table.Cell textAlign='center'>
                                       {pos.total_submissions}
                                    </Table.Cell>
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
               </Card.Body>
            </Card.Root>
         </VStack>
      </Container>
   );
}

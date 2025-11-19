import { createFileRoute } from '@tanstack/react-router';
import {
   Badge,
   Box,
   Card,
   CloseButton,
   Dialog,
   HStack,
   SimpleGrid,
   Text,
   VStack,
} from '@chakra-ui/react';
import { useSalaryStore } from '@/hooks';

export const Route = createFileRoute('/salary/_dialog/submissions')({
   component: () => {
      const navigate = Route.useNavigate();
      const { submissions } = useSalaryStore();

      return (
         <Box>
            <Dialog.Header>
               <Dialog.Title fontWeight='bold' fontSize='2xl'>
                  Submissions ({submissions.size})
               </Dialog.Title>
               <Dialog.CloseTrigger m={2} asChild>
                  <CloseButton size='sm' variant='surface' />
               </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
               {submissions.size === 0
                  ? (
                     <Text color='fg.muted' textAlign='center' py={8}>
                        No submissions yet
                     </Text>
                  )
                  : (
                     <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        {Array.from(submissions.entries()).map(([id, submission], index) => (
                           <Card.Root
                              key={index}
                              cursor='pointer'
                              onClick={() =>
                                 navigate({
                                    to: '/salary/reported/$key',
                                    params: { key: String(id!) },
                                 })}
                              _hover={{ bg: 'bg.muted' }}
                           >
                              <Card.Body>
                                 <VStack align='start' gap={3}>
                                    {/* Header */}
                                    <VStack align='start' gap={1}>
                                       <Text fontWeight='semibold' fontSize='lg'>
                                          {submission.company}
                                       </Text>
                                       <Text color='fg.muted'>
                                          {submission.position}
                                       </Text>
                                    </VStack>

                                    {/* Location & Hours */}
                                    <HStack justify='space-between' width='full'>
                                       <Text fontSize='sm' color='fg.muted'>
                                          {submission.location}
                                       </Text>
                                       <Text fontSize='sm'>
                                          {submission.work_hours}h/week
                                       </Text>
                                    </HStack>

                                    {/* Compensation */}
                                    <HStack justify='space-between' width='full'>
                                       <Text fontWeight='medium'>
                                          ${submission.compensation.toLocaleString()}
                                       </Text>
                                       {submission.other_compensation && (
                                          <Text fontSize='sm' color='fg.muted'>
                                             +{submission.other_compensation}
                                          </Text>
                                       )}
                                    </HStack>

                                    {/* Badges */}
                                    <HStack wrap='wrap' gap={2}>
                                       <Badge size='sm' variant='outline'>
                                          {submission.coop_year} Year
                                       </Badge>
                                       <Badge size='sm' variant='outline'>
                                          {submission.coop_cycle}
                                       </Badge>
                                       <Badge size='sm' variant='outline'>
                                          {submission.program_level}
                                       </Badge>
                                       <Badge size='sm' variant='outline'>
                                          {submission.year}
                                       </Badge>
                                    </HStack>
                                 </VStack>
                              </Card.Body>
                           </Card.Root>
                        ))}
                     </SimpleGrid>
                  )}
            </Dialog.Body>
         </Box>
      );
   },
});

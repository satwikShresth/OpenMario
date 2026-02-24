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
import { useSubmissions } from '@/db/stores/submissions';

export const Route = createFileRoute('/salary/_dialog/submissions')({
   component: () => {
      const navigate = Route.useNavigate();

      const submissions = useSubmissions(false);

      return (
         <Box>
            <Dialog.Header>
               <Dialog.Title fontWeight='bold' fontSize='2xl'>
                  Submissions ({submissions.length})
               </Dialog.Title>
               <Dialog.CloseTrigger m={2} asChild>
                  <CloseButton size='sm' variant='surface' />
               </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
               {submissions.length === 0
                  ? (
                     <Text color='fg.muted' textAlign='center' py={8}>
                        No submissions yet
                     </Text>
                  )
                  : (
                     <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        {submissions.map((submission) => (
                           <Card.Root
                              key={submission.id}
                              cursor='pointer'
                              onClick={() =>
                                 navigate({
                                    to: '/salary/reported/$key',
                                    params: { key: submission.id },
                                 })}
                              _hover={{ bg: 'bg.muted' }}
                           >
                              <Card.Body>
                                 <VStack align='start' gap={3}>
                                    <VStack align='start' gap={1}>
                                       <Text fontWeight='semibold' fontSize='lg'>
                                          {submission.company}
                                       </Text>
                                       <Text color='fg.muted'>
                                          {submission.position}
                                       </Text>
                                    </VStack>
                                    <HStack justify='space-between' width='full'>
                                       <Text fontSize='sm' color='fg.muted'>
                                          {submission.location}
                                       </Text>
                                       <Text fontSize='sm'>
                                          {submission.work_hours}h/week
                                       </Text>
                                    </HStack>
                                    <HStack justify='space-between' width='full'>
                                       <Text fontWeight='medium'>
                                          ${submission.compensation}
                                       </Text>
                                       {submission.other_compensation && (
                                          <Text fontSize='sm' color='fg.muted'>
                                             +{submission.other_compensation}
                                          </Text>
                                       )}
                                    </HStack>
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

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

export const Route = createFileRoute('/salary/_dialog/drafts')({
   component: () => {
      const navigate = Route.useNavigate();
      const { draftSubmissions: drafts } = useSalaryStore();

      return (
         <Box>
            <Dialog.Header>
               <Dialog.Title fontWeight='bold' fontSize='2xl'>
                  Draft Submissions ({drafts.length})
               </Dialog.Title>
               <Dialog.CloseTrigger m={2} asChild>
                  <CloseButton size='sm' variant='surface' />
               </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body>
               {drafts.length === 0
                  ? (
                     <Text color='fg.muted' textAlign='center' py={8}>
                        No draft submissions yet
                     </Text>
                  )
                  : (
                     <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        {drafts.map((draft, index) => (
                           <Card.Root
                              key={index}
                              cursor='pointer'
                              onClick={() =>
                                 navigate({
                                    to: '/salary/report/{-$idx}',
                                    params: { idx: String(index) },
                                 })}
                              _hover={{ bg: 'bg.muted' }}
                           >
                              <Card.Body>
                                 <VStack align='start' gap={3}>
                                    {/* Header */}
                                    <VStack align='start' gap={1}>
                                       <Text fontWeight='semibold' fontSize='lg'>
                                          {draft.company}
                                       </Text>
                                       <Text color='fg.muted'>
                                          {draft.position}
                                       </Text>
                                    </VStack>

                                    {/* Location & Hours */}
                                    <HStack justify='space-between' width='full'>
                                       <Text fontSize='sm' color='fg.muted'>
                                          {draft.location}
                                       </Text>
                                       <Text fontSize='sm'>
                                          {draft.work_hours}h/week
                                       </Text>
                                    </HStack>

                                    {/* Compensation */}
                                    <HStack justify='space-between' width='full'>
                                       <Text fontWeight='medium'>
                                          ${draft.compensation.toLocaleString()}
                                       </Text>
                                       {draft.other_compensation && (
                                          <Text fontSize='sm' color='fg.muted'>
                                             +{draft.other_compensation}
                                          </Text>
                                       )}
                                    </HStack>

                                    {/* Badges */}
                                    <HStack wrap='wrap' gap={2}>
                                       <Badge size='sm' variant='outline'>
                                          {draft.coop_year} Year
                                       </Badge>
                                       <Badge size='sm' variant='outline'>
                                          {draft.coop_cycle}
                                       </Badge>
                                       <Badge size='sm' variant='outline'>
                                          {draft.program_level}
                                       </Badge>
                                       <Badge size='sm' variant='outline'>
                                          {draft.year}
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

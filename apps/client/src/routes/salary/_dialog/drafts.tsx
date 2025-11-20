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
import { useLiveQuery, eq } from '@tanstack/react-db';
import { submissionsCollection } from '@/helpers';

export const Route = createFileRoute('/salary/_dialog/drafts')({
   component: () => {
      const navigate = Route.useNavigate();

      const { data: drafts = [] } = useLiveQuery(
         (q) => q
            .from({ sub: submissionsCollection })
            .select(({ sub }) => ({ ...sub }))
            .where(({ sub }) => eq(sub.isDraft, true))
      );

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
                        {drafts.map((draft) => (
                           <Card.Root
                              key={draft.id}
                              cursor='pointer'
                              onClick={() =>
                                 navigate({
                                    to: '/salary/report/{-$idx}',
                                    params: { idx: draft.id },
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
                                          {draft.workHours}h/week
                                       </Text>
                                    </HStack>

                                    {/* Compensation */}
                                    <HStack justify='space-between' width='full'>
                                       <Text fontWeight='medium'>
                                          ${draft.compensation.toLocaleString()}
                                       </Text>
                                       {draft.otherCompensation && (
                                          <Text fontSize='sm' color='fg.muted'>
                                             +{draft.otherCompensation}
                                          </Text>
                                       )}
                                    </HStack>

                                    {/* Badges */}
                                    <HStack wrap='wrap' gap={2}>
                                       <Badge size='sm' variant='outline'>
                                          {draft.coopYear} Year
                                       </Badge>
                                       <Badge size='sm' variant='outline'>
                                          {draft.coopCycle}
                                       </Badge>
                                       <Badge size='sm' variant='outline'>
                                          {draft.programLevel}
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

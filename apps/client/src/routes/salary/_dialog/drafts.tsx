import { createFileRoute } from '@tanstack/react-router'
import {
   Badge,
   Card,
   HStack,
   SimpleGrid,
   Text,
   VStack,
} from '@chakra-ui/react'
import { useSubmissions } from '@/db/stores/submissions'

export const Route = createFileRoute('/salary/_dialog/drafts')({
   beforeLoad: () => ({ getLabel: () => 'Drafts' }),
   component: () => {
      const navigate = Route.useNavigate()
      const drafts = useSubmissions(true)

      return (
         <>
            {drafts.length === 0 ? (
               <Text color='fg.muted' textAlign='center' py={8}>
                  No draft submissions yet
               </Text>
            ) : (
               <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  {drafts.map(draft => (
                     <Card.Root
                        key={draft.id}
                        cursor='pointer'
                        onClick={() =>
                           navigate({
                              to: '/salary/report/{-$idx}',
                              params: { idx: draft.id },
                           })
                        }
                        _hover={{ bg: 'bg.muted' }}
                     >
                        <Card.Body>
                           <VStack align='start' gap={3}>
                              <VStack align='start' gap={1}>
                                 <Text fontWeight='semibold' fontSize='lg'>
                                    {draft.company}
                                 </Text>
                                 <Text color='fg.muted'>{draft.position}</Text>
                              </VStack>
                              <HStack justify='space-between' width='full'>
                                 <Text fontSize='sm' color='fg.muted'>
                                    {draft.location}
                                 </Text>
                                 <Text fontSize='sm'>{draft.work_hours}h/week</Text>
                              </HStack>
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
         </>
      )
   },
})

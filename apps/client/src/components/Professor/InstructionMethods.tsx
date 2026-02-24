import { Box, Card, HStack, Text } from '@chakra-ui/react';
import { useProfessorDetail } from './detailStore';

export function InstructionMethods() {
   const sections = useProfessorDetail(s => s.allSections);
   const isLoading = useProfessorDetail(s => s.isLoading);

   if (isLoading) return null;

   const methodBreakdown = Object.entries(
      sections.reduce<Record<string, number>>((acc, s) => {
         const method = s.instruction_method ?? 'Unknown';
         acc[method] = (acc[method] ?? 0) + 1;
         return acc;
      }, {})
   )
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count);

   if (methodBreakdown.length <= 1) return null;

   return (
      <Box borderWidth='thin' borderRadius='xl' p={4}>
         <Text fontWeight='semibold' mb={3}>Instruction Methods</Text>
         <HStack gap={3} wrap='wrap'>
            {methodBreakdown.map(({ method, count }) => (
               <Card.Root key={method} variant='outline' size='sm' borderRadius='lg' minW='120px'>
                  <Card.Body p={3} textAlign='center'>
                     <Text fontWeight='semibold' fontSize='lg'>{count}</Text>
                     <Text fontSize='xs' color='fg.muted'>{method}</Text>
                  </Card.Body>
               </Card.Root>
            ))}
         </HStack>
      </Box>
   );
}

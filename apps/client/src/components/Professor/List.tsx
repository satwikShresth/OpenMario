import { Box, Skeleton, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from '@tanstack/react-router';
import { ProfessorCard } from './Card';
import { useProfessorList } from './listStore';

export function List() {
   const professors = useProfessorList(s => s.professors);
   const isLoading = useProfessorList(s => s.isLoading);
   const navigate = useNavigate();

   if (isLoading) {
      return (
         <VStack gap={3}>
            {Array.from({ length: 5 }).map((_, i) => (
               <Skeleton key={i} height='100px' borderRadius='lg' width='100%' />
            ))}
         </VStack>
      );
   }
   if (professors.length === 0) {
      return (
         <Box textAlign='center' py={16}>
            <Text fontSize='lg' color='fg.muted'>No professors found</Text>
         </Box>
      );
   }
   return (
      <VStack gap={3} align='stretch'>
         {professors.map(prof => (
            <ProfessorCard
               key={prof.instructor_id}
               prof={prof}
               onClick={() =>
                  navigate({
                     to: '/professors/$professor_id',
                     params: { professor_id: String(prof.instructor_id) },
                  })
               }
            />
         ))}
      </VStack>
   );
}

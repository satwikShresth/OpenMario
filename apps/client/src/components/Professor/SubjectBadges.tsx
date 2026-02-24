import { Badge, Box, HStack, Text } from '@chakra-ui/react';
import { useProfessorDetail } from './detailStore';

export function SubjectBadges() {
   const subjects = useProfessorDetail(s => s.prof?.subjects_taught);
   const isLoading = useProfessorDetail(s => s.isLoading);

   if (isLoading || !subjects || subjects.length === 0) return null;
   return (
      <Box>
         <Text fontSize='sm' color='fg.muted' mb={2}>Subjects Taught</Text>
         <HStack gap={2} wrap='wrap'>
            {subjects.map(s => (
               <Badge key={s} variant='surface' colorPalette='blue'>{s}</Badge>
            ))}
         </HStack>
      </Box>
   );
}

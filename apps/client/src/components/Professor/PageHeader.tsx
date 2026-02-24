import { Flex, Text } from '@chakra-ui/react';
import { useProfessorList } from './listStore';

export function PageHeader() {
   const totalCount = useProfessorList(s => s.totalCount);
   return (
      <Flex justify='space-between' align='center' wrap='wrap' gap={3}>
         <Text fontSize='2xl' fontWeight='bold'>Professors</Text>
         <Text color='fg.muted' fontSize='sm'>{totalCount} instructors</Text>
      </Flex>
   );
}

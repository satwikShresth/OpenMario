import { Flex, Text } from '@chakra-ui/react';
import { useCompanyList } from './listStore';

export function PageHeader() {
   const totalCount = useCompanyList(s => s.totalCount);
   return (
      <Flex justify='space-between' align='center' wrap='wrap' gap={3}>
         <Text fontSize='3xl' fontWeight='bolder'>Companies</Text>
         <Text color='fg.muted' fontSize='sm'>{totalCount} companies</Text>
      </Flex>
   );
}

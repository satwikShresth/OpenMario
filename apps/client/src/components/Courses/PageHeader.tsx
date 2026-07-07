import { Text } from '@chakra-ui/react';

export function PageHeader({ title }: { title: string }) {
   return (
      <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight='bold'>
         {title}
      </Text>
   );
}
